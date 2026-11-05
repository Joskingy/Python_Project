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

## Python and Flask history

The original Flask/Compose application and database remain separate from the
portfolio. Python 3.13, uv, and the original app dependencies are retained for
that work and the optional managed preview. The old Jinja website generator has
been retired. No database is needed to build or serve the portfolio.
