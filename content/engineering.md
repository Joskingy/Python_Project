## A small architecture, with clear responsibilities

**Content → Python build → static files → hosting.**

Jinja handles page templates. Markdown holds the case studies. A JSON profile supplies shared information. The build writes HTML and copies the portfolio's assets into `dist/`.

## Available today

- Python 3.13 with dependencies managed by uv and recorded in `uv.lock`.
- A static build with required-content and local-link validation.
- Homepage, project pages, and this engineering overview generated from source content.
- A local static preview with a 30-minute automatic shutdown.
- GitHub Actions checks on `dev`, `main`, and pull requests: linting, tests, a static build, and link validation.
- A downloadable static-site artifact retained for seven days per successful run.

## Build and release workflow

1. Push a change to `dev` or open a pull request.
2. Install locked dependencies, run focused checks, and build the site.
3. Retain the tested build as a release artifact.
4. Inspect the downloadable site artifact from a successful run.

Production deployment is currently disabled. After the AWS environment is configured,
the next step is to deploy tested `main` artifacts, check the public pages, and
retain the previous release for manual rollback.

## Planned AWS hosting

The target is a private S3 bucket served through CloudFront with HTTPS and Origin Access Control. GitHub Actions will use OIDC with a narrowly scoped deployment role. These resources have not been provisioned as part of the static-content phase.

## Why keep the runtime small?

A public portfolio mostly serves content. Static output keeps the public runtime simple while Python remains responsible for creating and checking the release. Dynamic services can be introduced later when a concrete feature justifies them.
