# Copyright (c) 2024 Hendrik Wolff <hendrik.wolff@agdsn.me>
# SPDX-License-Identifier: MIT OR Apache-2.0

import argparse
import subprocess
from dataclasses import dataclass, field
from pathlib import Path
import sys

try:
    from rich import print
except Exception as _:
    pass


@dataclass(frozen=True)
class DnsCtl:
    """
    Small wrapper around the `dnscontrol get-zones` command
    """

    credkey: str
    creds: Path
    out_dir: Path

    def dnsctl(self) -> [str]:
        """dnscontrol get-zones base command parameters"""
        return ["dnscontrol", "get-zones", "--creds", f"{self.creds}"]

    def zone_names(self) -> [str]:
        """command to fetch all zone names and print them"""
        return self.dnsctl() + ["--format", "nameonly", f"{self.credkey}", "-", "all"]

    def zone_path(self, zone: str) -> Path:
        return self.out_dir / f"{zone}.ts"

    def zone_file(self, zone: str) -> [str]:
        """command to fetch specific zone into a file named `$OUT_DIR/$zone.ts"""
        # fmt: off
        args = [
            "--format", "js",
            "--out", f"{self.zone_path(zone)}",
            f"{self.credkey}", "-", f"{zone}",
        ]
        # fmt: on
        return self.dnsctl() + args


@dataclass(frozen=True)
class ZoneFetcher:
    """
    Utilizes `DnsCtl` to run dnscontrol in subprocesses to fetch all zone data.
    """

    dnsctl: DnsCtl

    def fetch_zone_names(self) -> [str]:
        """Only fetch the name of available zones"""
        cmd: [str] = self.dnsctl.zone_names()
        proc = subprocess.run(cmd, capture_output=True)
        if proc.returncode != 0:
            print(f"dnscontrol emitted error: {proc.stderr.decode('utf8')}", end="")
            print(proc)
            sys.exit(1)
        proc_output = proc.stdout.splitlines()
        zone_list: [str] = list(map(lambda z: z.decode("utf8"), proc_output))
        return zone_list

    def fetch_zone(self, zone: str) -> Path:
        """Fetch a whole zone from your DNS provider"""
        cmd: [str] = self.dnsctl.zone_file(zone)
        proc = subprocess.run(cmd, capture_output=True)
        if proc.returncode != 0:
            print(f"dnscontrol emitted error: {proc.stderr.decode('utf8')}", end="")
            print(proc)
            sys.exit(1)
        return self.dnsctl.zone_path(zone)


@dataclass
class Zone:
    name: str
    file: Path


def d_definition(zone: str) -> str:
    """return the dnscontrol D default definition of a zone"""
    return f'D("{zone}", REG_CHANGEME,'


def header(zone_name: str) -> [str]:
    """return the new typescript import headers that will be added to a zone.ts"""
    return [
        'import { DOMAIN_DNS, DOMAIN_REG } from "../static/provider";',
        'import { TestRecords } from "../utils";',
        "",
        f'const domain = "{zone_name}";',
    ]


@dataclass
class ZoneFormatFixer:
    """reformats the dnscontrol.js zone config to typescript like noone else does!"""

    credkey: str
    zone: Zone
    buf: [str] = field(default_factory=list)

    def read_zone(self):
        with open(self.zone.file, mode="r") as f:
            self.buf = [line.strip() for line in f.readlines()]

    def write_zone(self):
        with open(self.zone.file, mode="w") as f:
            f.write("\n".join(self.buf))

    def fix_header(self):
        self.buf = self.buf[2:]
        self.buf = header(self.zone.name) + self.buf

    def fix_body(self):
        idx = self.buf.index(d_definition(self.zone.name))
        self.buf[idx] = "D(domain, DOMAIN_REG,"
        self.buf[idx + 1] = "DnsProvider(DOMAIN_DNS),"
        self.buf.insert(idx + 2, "TestRecords(domain),")

    def format(self):
        self.read_zone()
        self.fix_header()
        self.fix_body()
        self.write_zone()


def export_zones_in_dnsconfig(zones: [Zone]):
    """modifies `src/dnsconfig.js` by adding module exports of the new zones"""

    def mk_zone_export(dnsconfig: Path, zone: Zone):
        """format the export line for a single zone"""
        path = zone.file.absolute().relative_to(dnsconfig.parent)
        return f'export * from "./{str(path)[:-3]}";\n'

    dnsconfig_file = Path(__file__).parent.parent / "src/dnsconfig.ts"
    dnsconfig_file.touch(exist_ok=True)
    with open(dnsconfig_file, mode="r") as f:
        buf = [line for line in f.readlines()]
    zone_exports = [mk_zone_export(dnsconfig_file, zone) for zone in zones]
    zone_exports = list(filter(lambda ze: ze not in buf, zone_exports))

    # only write to file if we have modules that aren't already exported
    if len(zone_exports) > 0:
        gen_by = [f"\n// These exports have been generated by {Path(__file__).name}\n"]
        buf = buf + gen_by + zone_exports
        with open(dnsconfig_file, mode="w") as f:
            f.write("".join(buf))


# running a formatter  on all generated files and printing final logs
def format_and_end(out_dir: Path, zones: [Zone]):
    # formatter
    formatter = "prettier --log-level=warn --write".split() + [f"{out_dir}"]
    subprocess.run(formatter)

    # goodbye messages
    print(f"Imported {len(zones)} zones:")
    if "rich" in sys.modules:
        print(zones)
    else:
        [print(zone) for zone in zones]
    msg = "\nHint: Maybe you have to add a `NAMESERVER_TTL(86400)` to your definitions."
    print(msg, end="")
    sys.stdout.write(" ¯\\_(ツ)_/¯\n\n")
    print("**Have fun!**\n")


def main(args):
    credkey: str = args.credkey
    creds: Path = args.creds
    out_dir: Path = args.out_dir

    out_dir.mkdir(parents=True, exist_ok=True)
    dnsctl = DnsCtl(credkey, creds, out_dir)
    fetcher = ZoneFetcher(dnsctl)

    # calling into dnscontrol
    zone_names = fetcher.fetch_zone_names()
    zones = [Zone(zone, fetcher.fetch_zone(zone)) for zone in zone_names]

    # fixing up the headers
    if not args.no_fix_zone_format:
        zffs = [ZoneFormatFixer(credkey, zone) for zone in zones]
        [zff.format() for zff in zffs]

    # adding exports to dnsconfig.ts
    export_zones_in_dnsconfig(zones)

    format_and_end(out_dir, zones)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="""
        Wrapping `dnscontrol get-zones` to fetch all zones from the DNS provider and import them into this project.

        It creates for all zones a separate file in the OUT_DIR
        and fixes them up to work in this project as typescript.
        It only /reads/ from your providers and /never pushes/.
        """,
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    # fmt: off
    parser.add_argument(
        "credkey", type=str, action="store",
        help="The credkey of your DNS provider you specified in your creds.json",
    )
    parser.add_argument(
        "--creds", type=Path, action="store", nargs="?",
        default="src/creds.json", help="The path to your creds.json",
    )
    parser.add_argument(
        "--out-dir", type=Path, action="store", nargs="?",
        default="src/imports", help="path where you zone definitions get written to",
    )
    parser.add_argument(
        "--no-fix-zone-format", action='store_true',
        help="Do not make changes to files generated by dnscontrol",
    )
    # fmt: on
    args = parser.parse_args()
    main(args)