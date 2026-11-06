# Oscar Valdes · Portfolio

A static Astro portfolio and Starlight engineering handbook for DevOps, SRE,
and Platform Engineering. Black by default with an optional dark blue theme,
locally hosted Mono-inspired fonts, and a lightweight interactive starfield.

## Run locally

Use Node 24 LTS (`.node-version` pins the verified release), then:

```powershell
npm ci
npm run dev
```

Open the local URL printed in the terminal. Ctrl+C stops the server.
For the production build, including full-text search:

```powershell
npm run check
npm run build
npm run preview
```

Search is generated during the build. It is not available in the live development
server. The build validates exact S3 paths, anchors, and the generated content
security policy. It also checks the initial homepage asset budget.

For an automatically timed preview with a separate stop command, see
[local development](docs/local-development.md).

## Edit content

- `src/data/profile.json` contains the public profile.
- `src/content/projects/` contains case studies and typed metadata.
- `src/content/docs/handbook/` contains Starlight articles.
- `src/styles/` contains shared tokens and separate portfolio/handbook styles.
- `public/` contains publishable assets, including fonts and their licenses.

The original résumé stays local. Only put an approved public version in `public/`.
The earlier design mockups remain in `docs/design-preview/` for comparison.

## Delivery

GitHub Actions checks dev and pull requests, then publishes the tested main
artifact to private S3 and CloudFront through OIDC. Infrastructure changes use
a separate manual change-set review and approval workflow. Existing `.html`
URLs are preserved, including the handbook’s nested pages.

See [deployment](docs/deployment.md) for hosting, release, and rollback details.

## Python tooling

Python 3.13 and uv support the optional timed static preview and its checks.
The preview uses only the standard library; pytest and Ruff are development
tools. CI runs the pinned CloudFormation linter separately through `uv tool run`.

The original Flask app, Compose setup, and container deployment scripts have
been retired. Their source remains in Git history. Existing database data and
Docker volumes are preserved; no database is needed for the portfolio. See
[local development](docs/local-development.md#retired-flask-lab) for preservation notes.
