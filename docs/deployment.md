# Build and deploy

The workflow builds pull requests targeting `main` without publishing. Pushes and
manual runs on `main` publish `ghcr.io/<lowercase-owner>/<lowercase-repository>`
with the tag `sha-<commit>`. GitHub's automatic `GITHUB_TOKEN` logs in to GHCR;
registry passwords are never passed to Docker builds.

Production deployment is a manual workflow run on `main` with **deploy** checked.
It pulls the exact image digest produced by that run. It does not provision a
server or deploy on every push. Commit and push changes before GitHub can run them.
Manual runs on other branches build and test only; they cannot publish or deploy.

## Server setup (once)

Use a Linux **x86-64** server with Bash, tar, Docker Engine, and Docker Compose v2
supporting `up --wait`. The SSH user needs Docker access and write permission to
the deployment directory, for example `/opt/people`.

1. Find the existing Compose project name and PostgreSQL volume name with
   `docker compose ls` and `docker volume ls`. Reuse the exact project and volume.
   A different project can start a second database container against the same
   volume. Resolve any uncertainty before the first deployment.
2. For an existing installation, use the existing Compose project directory so
   the SQL initialization bind mount stays consistent. The workflow transfers the
   production Compose file, SQL initialization file, and deployment script there.
   It never copies `.env` or application source.
3. Create `.env` **on the server** with these names. Use existing database
   credentials and a generated Flask secret. Do not commit this file:

   ```dotenv
   COMPOSE_PROJECT_NAME=your-existing-project-name
   POSTGRES_VOLUME=your-existing-postgres-volume-name
   DB_NAME=mydb
   DB_USER=postgres
   DB_PASSWORD=replace-with-existing-database-password
   DB_HOST=db
   DB_PORT=5432
   SECRET_KEY=replace-with-a-generated-secret
   APP_BIND_ADDRESS=127.0.0.1
   APP_PORT=5000
   ```

   Restrict permissions with `chmod 600 .env`. Database initialization variables
   do not change passwords on an existing database. For a genuinely new
   installation only, explicitly create a named Docker volume and use its name
   above. Existing user records are not reset by deployment.
4. Private GHCR images require login **on the server**, as the deployment user.
   Use `docker login ghcr.io --username YOUR_GITHUB_USERNAME --password-stdin`
   with a token having `read:packages` and access to the package. The workflow's
   short-lived publishing token is not installed on the server.
5. Put an SSH public key in the deployment user's `authorized_keys`. Retain its
   private key for the GitHub environment secret below. Verify the server's SSH
   host key through a trusted channel before storing its known-hosts entry.

The web port defaults to loopback. The app currently has no authentication;
complete the application security work before making it public. When exposing
it later, place it behind an HTTPS reverse proxy. PostgreSQL is not published by
the production file; an existing database container's published ports are not
changed by this app-only deployment.

## GitHub configuration

Create an environment named **production** in repository Settings → Environments.
Restrict it to `main` and add:

| Kind | Name | Value |
| --- | --- | --- |
| Variable | `SERVER_HOST` | Server DNS name or IPv4 address |
| Variable | `SERVER_USER` | SSH username |
| Variable | `SERVER_PORT` | SSH port; defaults to `22` |
| Variable | `SERVER_PATH` | Absolute directory, such as `/opt/people`; letters, digits, `_`, `-`, and `/` only |
| Secret | `SERVER_SSH_KEY` | SSH private key, usable noninteractively |
| Secret | `SERVER_KNOWN_HOSTS` | Verified OpenSSH known-hosts entry; use `[hostname]:port` for a nonstandard port |

The Actions policy must allow `GITHUB_TOKEN` to write packages. If a package of
the same name already exists, grant this repository access to it.

## Run and verify

1. Merge the changes to `main`. Confirm **Build and Deploy / build** succeeds.
2. In Actions → **Build and Deploy** → **Run workflow**, select `main` and check
   **deploy** once server setup is complete.
3. Confirm the deploy job succeeds. Compose waits for the web HTTP health check.
   That check verifies the home page; verify database access separately through
   the directory page and your normal application checks.

The deployment never runs `down`, removes volumes, or recreates an existing
database container. It pulls the app image, then updates only the app. If the
new app fails its health check, the job fails; rollback is manual:

```bash
cd /opt/people
bash scripts/deploy.sh ghcr.io/owner/repository@sha256:PREVIOUS_IMAGE_DIGEST
```

Use the real digest from a previous successful build. Do not delete volumes or
change the Compose project name during recovery.
