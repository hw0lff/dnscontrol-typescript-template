import { DOMAIN_DNS, DOMAIN_REG } from "../static/provider";
import { TestRecords } from "../utils";

const domain = "example.com";

D(
    domain,
    // Registrar and provider are set depending on the environment
    DOMAIN_REG,
    DnsProvider(DOMAIN_DNS),

    NAMESERVER_TTL(86400),
    DefaultTTL(600),

    // These are for local zone file testing
    TestRecords(domain),

    CAA("@", "issue", "letsencrypt.org"),
    CAA("@", "issuewild", ";"),

    A("host1", "10.11.12.13"),
    AAAA("host1", "2001:db8::123:4567:89ab:cdef"),
    END,
);
