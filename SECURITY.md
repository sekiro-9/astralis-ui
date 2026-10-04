# Security policy

Thank you for helping keep Astralis UI and the people who use it safe.

## Supported versions

Security fixes are released for the newest version of each package. Older
versions are not patched: upgrade to get a fix.

| Package | Supported | Not supported |
| --- | --- | --- |
| `astralis-ui` | ✅ 0.8.x | ❌ 0.7.x and earlier |
| `astralis-cli` | ✅ 0.5.x | ❌ 0.4.x and earlier |
| `astralis-mcp` | ✅ 0.4.x | ❌ 0.3.x and earlier |
| `astralis-devtools` | ✅ 0.1.x | |
| `create-astralis` | ✅ 0.1.x | |

## Reporting a vulnerability

**Please do not report security problems in public issues, discussions or
pull requests.**

Report them privately through GitHub:
[**Report a vulnerability**](https://github.com/sekiro-9/astralis-ui/security/advisories/new).
Only the maintainer can see the report and the conversation that follows.

A useful report includes:

- the package and version affected;
- what an attacker could do, and under which conditions;
- steps or code to reproduce it, or a proof of concept;
- any idea you have for a fix.

## What happens next

| Step | Timeline |
| --- | --- |
| Acknowledgement that the report was received | within 72 hours |
| First assessment: confirmed or not, and how severe | within 7 days |
| A fix released for a confirmed problem | as soon as possible, and within 90 days |

You are kept informed at each step. If a fix needs longer than 90 days, we
will tell you why and agree a new date with you.

## Disclosure

Disclosure is coordinated. Once a fix is released, a
[security advisory](https://github.com/sekiro-9/astralis-ui/security/advisories)
is published describing the problem, the affected versions and how to
upgrade, and a CVE is requested where one applies. You are credited in the
advisory unless you prefer to stay anonymous.

Please give us the chance to release a fix before you share details publicly.

## Scope

**In scope**

- The published packages listed above.
- The code in this repository that builds them.
- The docs site at [astralis-ui.com](https://astralis-ui.com), including its
  issue platform.

**Out of scope**

- Problems in third-party dependencies; please report those to the project
  concerned (we will update once a fixed version is out).
- Issues that require an already compromised machine or a deliberately
  malicious local project.
- Missing hardening that does not lead to a concrete vulnerability.

## Safe harbour

We will not take legal action against anyone who researches and reports a
vulnerability in good faith under this policy: without accessing other
people's data, degrading the service for others, or exploiting the problem
beyond what is needed to demonstrate it.
