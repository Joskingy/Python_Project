## The problem

Operational questions cross several screens: which Amplify branch failed, what configuration differs, and which account am I actually investigating? A useful tool needs to collect that evidence without casually exposing configuration values or changing infrastructure.

## What I built

BotoToolkit now contains **amplify-ops**, a Python CLI built with Boto3, Typer, and Rich. Its commands cover Amplify Hosting inventory, deployment investigation, configuration comparisons, AppSync key expiration, costs, and stale-environment evidence.

The operator supplies an AWS profile, expected account, and selected regions. An STS identity check runs before the operational reads. Configuration comparisons report differences while withholding the values themselves.

## Decisions that matter

- **Establish identity first.** An explicit expected account helps catch work in the wrong environment.
- **Keep scope visible.** Inventory covers the selected Amplify Hosting resources; it does not claim to discover every backend dependency.
- **Treat incomplete evidence honestly.** Reports distinguish partial reads from complete results, with contextual errors and meaningful exit codes.
- **Separate reads from writes.** The deployment command submits an explicitly reviewed retry. Other operational commands are read-only.

## Evidence and delivery

The public repository contains the CLI implementation, command documentation, uv lockfile, and pytest checks. Its GitHub Actions configuration includes Linux and Windows tests, sensitive-information checks, and distribution smoke checks.

[Read the command documentation](https://github.com/Joskingy/BotoToolkit#readme) and [inspect the CI workflow](https://github.com/Joskingy/BotoToolkit/blob/main/.github/workflows/ci.yml) for the implementation and verification approach. Workflow results are available in the repository.

## Scope and limitations

The CLI focuses on Amplify Hosting operations in explicitly selected accounts and regions. Partial reads remain visible in the report. CI authentication support is documented as future work. This case study describes the tool's implemented behavior and repository checks.

## Engineering lessons

Account identity belongs at the beginning of an operations workflow. A useful report also needs to explain its scope and what could be read, so the operator can judge the evidence.

Configuration comparisons can expose useful differences while withholding values. Keeping deployment retries behind an explicit review makes the transition from investigation to action visible. These decisions shape both the CLI interface and its failure behavior.
