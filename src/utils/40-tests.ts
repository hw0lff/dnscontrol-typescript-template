import { nop, isStringOrEmpty } from "./10-helpers";
import { debug } from "./30-logging";

enum Environment {
    prod,
    test,
}

// dnscontrol env var
CLI_DEFAULTS({
    environment: Environment.test, // or prod
});

// returns the yes/no conditionally depending on the environment
// if we are not in production -> we are in testing
export function ifTest(y: any, n: any): any {
    if (Environment.prod !== Environment[environment as keyof typeof Environment]) {
        return y;
    } else {
        return n;
    }
}

// returns SOA and NAMESERVER records in testing mode.
// They are needed by named-checkzone and will not be included in the production environment
export const TestRecords = ifTest(function (s: any) {
    s = isStringOrEmpty(s);
    s = "Including testing records" + (s.length > 0 ? ": " + s : "");
    ifTest(debug(s), {});

    // These records are only included during zone file testing
    const testingRecords = [
        SOA("@", "ns.inwx.de.", "hostmaster.inwx.de.", 86400, 600, 864000, 60),
        NAMESERVER("ns.inwx.de."),
        NAMESERVER("ns2.inwx.de."),
        NAMESERVER("ns3.inwx.eu."),
    ];
    return ifTest(testingRecords, {});
}, nop);
