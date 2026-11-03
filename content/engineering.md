## A small architecture, with clear responsibilities

**Content → Python build → static files → hosting.**

Jinja handles page templates. Markdown holds the case studies. A JSON profile supplies shared information. The build writes HTML and copies the portfolio's assets into `dist/`.

## Available today

- Python 3.13 with dependencies managed by uv and recorded in `uv.lock`.
- A static build with required-content and local-link validation.
- Homepage, project pages, and this engineering overview generated from source content.
- A local static preview with a 30-minute automatic shutdown.
- Existing GitHub Actions image-build and deployment-check configuration from the original Flask application.

## Planned delivery workflow

1. Push a change to `dev` or open a pull request.
2. Install locked dependencies, run focused checks, and build the site.
3. Retain the tested build as a release artifact.
4. Deploy successful `main` releases after the AWS environment is configured.
5. Check public pages and retain the previous build for manual rollback.

## Planned AWS hosting

The target is a private S3 bucket served through CloudFront with HTTPS and Origin Access Control. GitHub Actions will use OIDC with a narrowly scoped deployment role. These resources have not been provisioned as part of the static-content phase.

## Why keep the runtime small?

A public portfolio mostly serves content. Static output keeps the public runtime simple while Python remains responsible for creating and checking the release. Dynamic services can be introduced later when a concrete feature justifies them.
