import { c, info, ifTest } from "../utils";

// Enter the keys from src/creds.json of your providers here
// Refer to https://docs.dnscontrol.org/provider on how to configure your provider in src/creds.json
const PRODUCTION_REGISTRAR = "inwx-env";
const PRODUCTION_DNS_PROVIDER = "inwx-env";

//
// You probably won't need to touch that for now:

info("Using " + ifTest(c.boldgreen("TESTING"), c.boldred("PRODUCTION")) + " providers");
export const DOMAIN_REG = NewRegistrar(ifTest("none", PRODUCTION_REGISTRAR));
export const DOMAIN_DNS = NewDnsProvider(ifTest("zone-check", PRODUCTION_DNS_PROVIDER));
