# Local development

## Astro portfolio

Use Node 24 LTS, matching `.node-version`, and install with `npm ci`.

```powershell
npm run dev
```

The terminal prints the local address. Changes refresh automatically. Keep the
terminal attached and use Ctrl+C to stop it. Closing the browser does not stop
any local server.

For the generated site and full-text search:

```powershell
npm run check
npm run build
npm run preview
```

Both Astro servers bind to localhost. They remain running until stopped. Use
the timed preview below if you want automatic shutdown and a separate stop command.
No container or database is required.

## Timed production preview

After `npm run build`, use the retained Python helper:

```powershell
uv sync --locked
uv run --locked python scripts/serve.py
```

Open http://127.0.0.1:5055. This serves only the existing `dist/` build and stops
after 30 minutes. Rebuild and refresh after changing content. Ctrl+C or Ctrl+Break
stops it early. From another terminal in the project directory:

```powershell
uv run --locked python scripts/serve.py --stop
```

This stops only the managed preview. It does not stop an Astro dev/preview server.
For an Astro server whose terminal is unavailable, identify its exact Node PID
and command line in Task Manager, then end that process. Avoid stopping every
Node or Python process on the computer.

To choose a different time limit before starting:

```powershell
$env:PREVIEW_DURATION_SECONDS = '3600'
uv run --locked python scripts/serve.py
```

The maximum is 24 hours. Remove that environment variable to restore 30 minutes.
Run the preview check after building with `uv run --locked pytest -q`.
The helper uses only Python's standard library; uv installs pytest and Ruff for
development checks. CI runs pinned `cfn-lint` separately with `uv tool run`.

## Retired Flask lab

The Flask app, sample preview, Docker/Compose definitions, initialization schema,
and container deployment scripts have been removed. Their source remains in Git
history. The Astro portfolio needs no application server or database.

This cleanup does not stop containers, change database records, or remove Docker
volumes. The ignored local `webapp/.env` remains untouched and must stay private.
Docker's engine was unavailable during cleanup, so existing volumes could not be
inspected. Do not assume that an unavailable engine means the volumes are gone.

For future recovery, find the old configuration in Git history. The development
stack used a Compose-prefixed `postgres_data` volume; production used the exact
external volume named by `POSTGRES_VOLUME`. Verify the actual volume and back it
up before reusing it. Keep its data volume and any local dumps; do not use volume
pruning or `docker compose down -v` as cleanup steps.

The old database password appeared in Git history. Replace it before reusing the
database, and change it anywhere else it was reused. Editing an environment file
alone does not change the password stored in an existing PostgreSQL database.
