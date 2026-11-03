# Oscar Valdes · Portfolio

A portfolio focused on DevOps, SRE, and Platform Engineering. Python renders
Jinja templates and Markdown case studies into static pages in `dist/`.

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then run:

```powershell
uv sync --locked
uv run --locked pytest -q
uv run --locked python scripts/build.py
```

Python 3.13 and dependencies are managed from `pyproject.toml` and `uv.lock`.
Add packages with `uv add`; use `uv add --dev` for development tools.

Preview the portfolio with `uv run --locked python scripts/serve.py`, then open
http://127.0.0.1:5055. Ctrl+C stops it; it also stops automatically after 30 minutes.
If your terminal does not forward Ctrl+C, run `uv run --locked python scripts/serve.py --stop`
from another terminal in this directory.
Edit `content/profile.json` and `content/projects/*.md`, then rebuild or restart
the preview. The original résumé stays local and is not copied into `dist/`.

The original Flask/Compose application remains available during the transition.
Its containers and source are separate from the generated portfolio.
See [local development](docs/local-development.md) for the legacy preview controls.

GitHub Actions validates changes on `dev`, `main`, and pull requests to `main`.
Successful runs save the static site as a downloadable artifact for seven days.
Production deployment is disabled while AWS hosting is being prepared.
See [build and deployment status](docs/deployment.md).

Run `bash tests/deploy.sh` to check deployment ordering and failure handling with
a fake Docker CLI, without starting containers or accessing a database.
