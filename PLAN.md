# Premium portfolio plan

Status: execution started. Phase 1 (uv migration) is complete; phases 2-6 remain.
Verified: locked install, existing page/deployment checks, workflow lint, Docker
build, and database-free page rendering. No preview server was started.

Build a polished portfolio that presents real experience, explains project decisions,
and demonstrates a dependable delivery pipeline. Keep the first release small.

**Direction**

- Python generates static pages from Jinja templates and Markdown content.
- `uv` manages Python and dependencies. Docker Compose provides a local preview.
- GitHub Actions checks and builds the site; AWS S3 and CloudFront serve it.
- Production content needs no Flask server or database. Preserve the existing app
  in Git history and leave its database volumes and user records untouched.
- Add a dependency or service only when a concrete feature needs it.

**1. Migrate to uv first**

- Add a root `pyproject.toml`, `uv.lock`, and `.python-version`.
- Use stable Python 3.13 initially, replacing the current Python alpha image.
- Import existing requirements first; keep this commit focused on project management.
- Put Ruff and pytest in a development dependency group. Do not upgrade every
  library or restructure the application in the same step.
- Update Docker build contexts and copy paths so the root lockfile is available.
  Exclude `.venv`, secrets, caches, and generated output from builds and Git.
- Use `uv sync --locked` in CI and locked production installs without development
  dependencies in Docker. Keep a single dependency source of truth.
- Verify the current page renders and the existing small test suites still pass.
  Stop any temporary processes when verification ends.

Done when: a fresh checkout has predictable install, check, and preview commands.
Suggested commit: `chore: migrate Python project to uv`

**2. Establish the portfolio content and static build**

- Add one small Python build script using Jinja and a Markdown parser. Reuse the
  existing template/static directories where practical; avoid a custom framework.
- Keep profile/project metadata in one simple JSON file and case studies in Markdown.
  Build generated HTML and assets into ignored `dist/`.
- First release: homepage, three project case studies, and a "How this site ships"
  page. Put experience, about, and contact sections on the homepage.
- Each case study explains the problem, Oscar's contribution, architecture,
  decisions, evidence, and lessons learned. Label personal and professional work.
- Ask Oscar for the target role, experience, project evidence, resume, and public
  contact links when needed. Draft missing content as clearly marked placeholders;
  never invent achievements, employers, or metrics. Resolve placeholders before launch.
- After the static build works, retire portfolio dependencies on CRUD routes,
  PostgreSQL, and Gunicorn. Remove obsolete preview/deployment code and tests only
  when their replacements work. Do not delete stored data.

Done when: the complete site builds from editable content with working internal links.
Suggested commit: `feat: build portfolio pages from content`

**3. Create the dark blue visual foundation**

| Role | Starting color |
| --- | --- |
| Page background | Midnight blue `#0B1220` |
| Cards and panels | Slate navy `#121E33` |
| Primary text | Cool white `#E8EEF8` |
| Secondary text | Blue gray `#A6B4CC` |
| Links and primary actions | Soft blue `#7AA2FF` |

- Use an editorial layout: strong typography, generous spacing, selected work as
  the focal point, and concise descriptions. Avoid a generic dashboard appearance.
- Use one well-chosen, properly licensed font family and a small type/spacing scale.
  Use real screenshots and purposeful diagrams instead of decorative stock graphics.
- Design the homepage and one case study first. Show desktop and mobile previews
  for feedback before applying the visual system to the remaining pages.
- Prioritize readable contrast, visible keyboard focus, comfortable tap targets,
  and reduced-motion support. Start with one excellent dark theme.

Done when: the homepage and case study feel cohesive and polished on phone and desktop.
Suggested commit: `feat: introduce midnight blue portfolio design`

**4. Add a few premium interactions**

- Clear project navigation, smooth detail transitions, and subtle hover/focus feedback.
- One interactive architecture diagram with keyboard-accessible explanations.
  Provide a readable fallback without JavaScript.
- A visible resume link, useful social/contact links, and a small deployed-version
  link on the technical page. Publish only intentional public information.
- Use lightweight JavaScript for these interactions. Add HTMX only if a real
  server-backed interaction is introduced later.
- Optimize images, reserve their layout space, and keep the site useful without
  animation. Use email links for the first release.

Done when: each interaction helps visitors understand the work or contact Oscar.
Suggested commit: `feat: polish portfolio interactions`

**5. Simplify preview and CI**

- Adapt the existing start/status/stop preview commands to serve the static output.
  Keep the named Compose project, loopback-only port, and 30-minute auto-stop.
- On pushes to `dev` and `main`, and pull requests targeting `main`: install from
  the lockfile, run Ruff, build the site, and check content/internal links.
- Use a few focused tests only for meaningful build behavior: invalid content,
  missing templates, and broken local links. Avoid tests that duplicate markup.
- Review desktop/mobile rendering, keyboard navigation, and browser errors once
  the main layouts settle. Repeat only affected checks after subsequent changes.
- Save the built site as a workflow artifact. Production deployment consumes that
  tested artifact. Do not add a separate hosted preview environment for every PR yet.

Done when: content and code updates get useful feedback without a slow or noisy pipeline.
Suggested commit: `ci: validate and package portfolio updates`

**6. Host on AWS and finish the delivery workflow**

- Use one small CloudFormation template for a private S3 bucket, CloudFront with
  Origin Access Control, and the required narrowly scoped deployment permissions.
- Add a custom domain and HTTPS certificate when Oscar supplies the domain.
  Keep initial paths simple; introduce edge URL rewriting only if needed.
- Authenticate GitHub Actions to AWS through OIDC. Restrict access to this repository
  and the intended deployment environment. Use AWS profile `brewmaster` locally.
- Configure the GitHub `production` environment before enabling deployment. Perform
  the first launch deliberately; after setup, successful `main` updates deploy the site.
- Upload assets before HTML, set appropriate cache headers, and refresh changed
  cached pages. Retain the previous successful build and document manual rollback.
- Verify the homepage, a case study, HTTPS, and the deployed version after release.
- Confirm the current regional pricing and a small budget with Oscar before creating
  billable resources. Keep backup/artifact retention and logs bounded.

Done when: an update can move from `dev` through review to a verified production release,
and the previous version can be restored using a documented procedure.
Suggested commit: `feat: deploy portfolio to AWS`

**Working rules**

- Implement one phase at a time. Keep commits short and focused on `dev`.
- Keep documentation to a short README plus the existing local-development and
  deployment guides. Update them in place; do not add a document for every feature.
- No CMS, user accounts, database, AI chatbot, background workers, or additional
  frontend framework for the first portfolio release.
- No production changes or service startup during this planning stage.
- During execution, report any service started and verify it stops after checks.
- Check this plan against the current repository before execution; preserve work
  made after the plan was written.
