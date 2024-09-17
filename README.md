# DNS with dnscontrol and typescript

Use typescript and dnscontrol to maintain your DNS data.

## TL;DR.

Change a file. Run `just full-run`. That's it!

### First steps

#### Dependencies

-   just
-   yarn
-   named-checkzone
-   jq
-   python

To install `just`, see https://github.com/casey/just#packages

```sh
# don't forget to install listed programs
just setup

# and now run the checks to verify your setup works correctly
just check
```

## How to use?

Issue commands with `just`:

```sh
# show all available commands
just -l
```

Use the `dns` group for stuff related to the production environment.
The `typescript` group is for building/bundling your config,
`tests` run tests on the files that have been built without interacting with your providers,
and the last group is intended for project `house-keeping`.

### Files

#### `src/dnsconfig.ts`

The entrypoint of your code.
This file only contains exports for all of your domains.

#### `src/creds.json`

See [dnscontrol creds.json docs](https://docs.dnscontrol.org/commands/creds-json) for an explanation.

Add your own credentials in this file.
Take note of the _credkeys_ (i.e. `none`, `zone-check`, `inwx-env`, `hexonet-login`).
You will need them later.

```json
{
    "none": { "TYPE": "NONE" },
    "zone-check": {
        "TYPE": "BIND",
        "directory": "zone-cache"
    },
    "inwx-env": {
        "TYPE": "INWX",
        "username": "$INWX_USERNAME",
        "password": "$INWX_PASSWORD"
    },
    "hexonet-login": {
        "TYPE": "HEXONET",
        "apilogin": "$HEXONET_APILOGIN",
        "apipassword": "$HEXONET_APIPASSWORD"
    }
}
```

> [!IMPORTANT]
> The `zone-check` and `none` providers are required for testing.
> _Do not remove them._

> [!CAUTION]
> It is strongly recommended you supply your credentials with environment variables.
> Your dnscontrol credentials file [SHOULD NOT contain any secrets](https://docs.dnscontrol.org/commands/creds-json#dont-store-creds.json-in-a-git-repo)!
>
> An example file to load your credentials could look like this:
>
> ```sh
> # load-creds.sh
> DNS_CREDKEY="inwx-env"
> INWX_USERNAME="your username"
> INWX_PASSWORD="$(command that returns your password)"
> export DNS_CREDKEY INWX_USERNAME INWX_PASSWORD
> ```
>
> Load it with `source load-creds.sh`

#### `src/static/providers.ts`

In this file you find 2 private constants: `PRODUCTION_REGISTRAR`, `PRODUCTION_DNS_PROVIDER`.

Change these to the credkeys of your production providers that you have used in the `src/creds.json` file.

#### `src/domains/`

In here go your domain definitions.
I recommend a separate file for each domain \(e.g. `src/domains/example.com.ts`\).

### Code generation workflow

This is the underlying order of `just` recipe execution when you want to push changes.

1. `just build` to compile and bundle typescript to ES5
2. `just check` to run all checks (creds.json, dnsconfig.js, zone files)
3. `just dns-preview` to preview changes to your DNS provider
4. `just dns-deploy` to push changes to your DNS provider

Every step depends on the on the previous step.
The justfile recipe dependencies are defined this way.

So whenever you want to push changes with `just dns-deploy`,
`just` will always build, check, and show a preview of your changes.

This causes `just full-run` to be the same as `just dns-deploy` with code formatting.

## Importing from a DNS provider

1. Populate the `src/creds.json`.
   Remember the `credkey` you used for your DNS provider.
   See [`src/creds.json`](#srccredsjson) above for tips.
2. Replace the example `inwx-env` credkeys with your own in `src/static/provider.ts`.
3. Set the `DNS_CREDKEY` env var to your DNS provider `credkey`
   or change the the `_provider_credkey` variable in `justfile` to your `credkey`.
4. Verify that your credentials work with `just dns-get-zones nameonly all`.
   It should print a list of your domains.
5. Run `just dns-import-zones`.
   This will generate files that work with this project.
   See `just dns-import-zones --help` for options.
6. Preview what the imported files would change with `just dns-preview`
   and minimise all differences by changing the generated files.
7. Move all your files from the import directory to `src/domains`, fix up `src/dnsconfig.ts` and commit.

> [!TIP]
> Set the `--out-dir` option of `just dns-import-zones` to `src/domains` to bootstrap your project.

## Updating dnscontrol

Shouldn't happen much. Just run

```sh
dnscontrol write-types --dts-file src/types-dnscontrol.d.ts
just fmt
just check
```

commit the changes and you should be good.

## License

This template is dual licensed under MIT or Apache-2.0.
