# People workspace

A Python Flask app with a PostgreSQL database and a responsive people directory.

For an automatically timed design preview and simple start/status/stop commands,
see [managing local servers](docs/local-development.md).

Local development uses `docker-compose.yml`. Production uses the separately
configured `docker-compose.production.yml` and the image published by GitHub Actions.

See [deployment setup and workflow instructions](docs/deployment.md) for registry
access, server configuration, database volume reuse, and manual deployment.

Run `bash tests/deploy.sh` to check deployment ordering and failure handling with
a fake Docker CLI, without starting containers or accessing a database.
