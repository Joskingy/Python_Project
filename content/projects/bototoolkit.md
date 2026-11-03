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

## Delivery and verification

The repository uses a uv lockfile, Ruff, and pytest. Its GitHub Actions configuration includes Linux and Windows tests, sensitive-information checks, and distribution smoke checks. These are repository capabilities, not a claim that every current workflow run is passing.

## What this demonstrates

The project connects Python engineering to day-to-day operations: bounded investigation, careful output handling, explicit permissions, and useful failure behavior. The repository documents limits and future work, including CI authentication support that is not yet implemented.

[Read the project documentation](https://github.com/Joskingy/BotoToolkit#readme) · [Inspect its CI workflow](https://github.com/Joskingy/BotoToolkit/blob/main/.github/workflows/ci.yml)
