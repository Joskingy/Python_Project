# Managing local servers

## Static portfolio

Run `uv run --locked python scripts/serve.py` and open http://127.0.0.1:5055.
This builds the portfolio, serves only `dist/`, and automatically stops after
30 minutes. Ctrl+C stops it early. Rebuild or restart to see content changes.
For a build without a server, use `uv run --locked python scripts/build.py`.

If Ctrl+C does not reach the preview on Windows, try Ctrl+Break or run this from
another terminal in the project directory:

```powershell
uv run --locked python scripts/serve.py --stop
```

This requests shutdown without terminating unrelated Python processes. It works
with the updated preview; a process started before this fix must first be stopped
using its terminal or its specific PID in Task Manager.

The Compose commands below still preview the original Flask sample application.
They will be replaced with static preview controls in the preview/CI phase.

Install dependencies with `uv sync --locked` from the repository root. This uses
Python 3.13 and creates a local `.venv`. Run page checks with `uv run --locked pytest -q`.
For a preview without Docker, run `uv run --locked python scripts/preview.py`;
it uses sample records and automatically stops after 30 minutes. Ctrl+C stops it early.

## Legacy design preview (sample records only)

From the repository directory in PowerShell, with Docker Desktop running:

```powershell
.\scripts\preview.ps1 start
```

Open http://127.0.0.1:5055. Keep that terminal open. **Ctrl+C** stops the preview.
It automatically exits after 30 minutes even if you leave it unattended; it does
not restart itself. A stopped preview container may remain listed in Docker
Desktop, using disk space but no running server CPU or memory.

Manage it from another terminal:

```powershell
.\scripts\preview.ps1 status
.\scripts\preview.ps1 stop
.\scripts\preview.ps1 logs
```

Alternatively, open Docker Desktop → Containers → **people-design-preview** and
press **Stop**. Do not delete containers or volumes to stop a server.

The preview has no PostgreSQL service, database volume, credentials, or application
backend import. Its create/edit forms display a preview notice and do not save
changes. It mounts only its script, templates, and static assets. Template/CSS/JS
edits can be viewed by refreshing; restart after changing the Python preview code.

Equivalent commands if PowerShell script execution is restricted:

```powershell
docker compose -p people-design-preview -f compose.preview.yml up --build --abort-on-container-exit
docker compose -p people-design-preview -f compose.preview.yml ps --all
docker compose -p people-design-preview -f compose.preview.yml stop
```

To choose a different time limit before starting:

```powershell
$env:PREVIEW_DURATION_SECONDS = '3600'
.\scripts\preview.ps1 start
```

The maximum is 24 hours. Remove that environment variable to restore 30 minutes.

## The real app and PostgreSQL

The main `docker-compose.yml` is a separate project. Its database/environment
configuration still needs the next planned configuration fix. Once configured,
use its own directory and these commands:

```powershell
docker compose up --build
docker compose ps --all
docker compose stop
```

Prefer an attached `up` during development. If you intentionally use `up -d`, the
containers continue running after the terminal closes: stop them from Docker
Desktop or with `docker compose stop`. Stopping preserves database records.
Avoid `down -v` as a shutdown shortcut: that option removes database volumes.

## A Python server launched outside Docker

If it is attached to a terminal, press **Ctrl+C** in that terminal. Closing a
browser tab does not stop a Flask server. If its terminal is unavailable, use
Task Manager → Details, identify the exact Python process by PID/command line,
and choose **End task**. Other Python processes may belong to unrelated tools.

References: [Flask development server](https://flask.palletsprojects.com/en/stable/server/)
and [Docker Compose stop](https://docs.docker.com/reference/cli/docker/compose/stop/).

Use one manager for each server. The managed preview above replaces the temporary
`webapp/__pycache__/design_preview.py --serve` command used during the first design
check. Stopping Compose does not stop an older host Python process on the same port.
