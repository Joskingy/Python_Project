## The problem

I wanted a portfolio that could explain my engineering work and demonstrate the same care in its own delivery: repeatable environments, useful checks, and a small operational footprint.

## The implementation so far

The project began as a Flask and PostgreSQL application. I migrated dependency management to uv and stable Python 3.13, retained a lockfile, and introduced development tools separately from production dependencies.

The portfolio now has a Python build step that renders Jinja templates and Markdown case studies into static HTML. Profile and project metadata live in one JSON file. The generated output is independent of the original application database.

## Delivery decisions

- **Generate content at build time.** Visitors do not need a running Python process to read the finished pages.
- **Keep content editable.** A project description can change without editing page layouts.
- **Check the output.** The build validates required content and local links before reporting success.
- **Keep checks focused.** Test build failures that matter rather than maintaining assertions about every visual element.

## Current state and next steps

The existing repository workflow builds container images and includes page and deployment checks. Moving it to static-site artifacts, finalizing the midnight-blue UI, and adding AWS hosting are upcoming phases. This portfolio is **not yet presented as deployed to S3 or CloudFront**.

The intended hosting design is private S3 behind CloudFront, with GitHub OIDC for deployment access. Infrastructure setup, a domain, and a first production release remain to be completed.

[See how this site is being built](../engineering.html)
