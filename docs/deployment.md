# Portfolio builds

GitHub Actions runs **Portfolio CI** on pushes to `dev` and `main`, pull requests
targeting `main`, and manual runs.

Each run installs locked dependencies, checks the portfolio Python code, runs
tests, builds the static pages, and validates local links. It saves only `dist/`
as an artifact named `portfolio-<commit SHA>` for seven days.

To inspect a build:

1. Open the successful **Portfolio CI** run in GitHub Actions.
2. Download its `portfolio-<commit SHA>` artifact.
3. Extract it and inspect `index.html`, `engineering.html`, and `projects/`.

## Production status

Production deployment is disabled: this workflow has no deploy job, registry
publishing, SSH step, or cloud credentials. Merging into `main` builds and saves
the site but does not publish it to a website or update a server.

The legacy Flask Dockerfile, Compose files, and deployment script are retained
during the transition. They are not used by Portfolio CI.

## Before enabling AWS hosting

- Provision private S3 and CloudFront with HTTPS and Origin Access Control.
- Configure a scoped GitHub OIDC role and the `production` environment.
- Add a deployment job that consumes the tested artifact.
- Verify the first release and document restoration of the previous artifact.

Until then, use `uv run --locked python scripts/serve.py` for local previews.
