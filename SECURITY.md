# Security policy

## Supported versions

Security fixes go into the latest release of each package.

| Package | Supported |
| --- | --- |
| `astralis-ui` | 0.8.x |
| `astralis-cli` | 0.5.x |
| `astralis-mcp` | 0.4.x |
| `astralis-devtools` | 0.1.x |
| `create-astralis` | 0.1.x |

Older versions are not patched; upgrade to get a fix.

## Reporting a vulnerability

Please do not open a public issue for a security problem.

Report it privately through GitHub instead:
[**Report a vulnerability**](https://github.com/sekiro-9/astralis-ui/security/advisories/new).
Only the maintainer can see the report.

Include what you can of:

- the package and version affected,
- what an attacker could do, and under which conditions,
- steps or code to reproduce it.

You can expect an acknowledgement within a few days. Once the problem is
confirmed, a fix is prepared and released, and the advisory is published with
credit to you unless you prefer otherwise.

## Scope

In scope: the published packages listed above, and the code in this
repository that builds them. The docs site's issue platform is in scope too.

Out of scope: problems in third-party dependencies (report those upstream),
and issues that need an already-compromised machine or a malicious local
project to exploit.
