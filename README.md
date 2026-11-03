# People workspace

A Python Flask app with a PostgreSQL database and a responsive people directory.

Install [uv](https://docs.astral.sh/uv/getting-started/installation/), then run:

```powershell
uv sync --locked
uv run --locked pytest -q
```

Python 3.13 and dependencies are managed from `pyproject.toml` and `uv.lock`.
Add packages with `uv add`; use `uv add --dev` for development tools.

For an automatically timed design preview and simple start/status/stop commands,
see [managing local servers](docs/local-development.md).

Local development uses `docker-compose.yml`. Production uses the separately
configured `docker-compose.production.yml` and the image published by GitHub Actions.

See [deployment setup and workflow instructions](docs/deployment.md) for registry
access, server configuration, database volume reuse, and manual deployment.

Run `bash tests/deploy.sh` to check deployment ordering and failure handling with
a fake Docker CLI, without starting containers or accessing a database.
