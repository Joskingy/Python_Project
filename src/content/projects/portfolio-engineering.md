---
title: "The portfolio, engineered"
subtitle: "A small site with a considered delivery process."
category: "Delivery engineering"
status: "Independent project"
summary: "A static Astro portfolio and Starlight handbook, delivered through GitHub Actions to private S3 and CloudFront."
stack: ["Astro", "Starlight", "TypeScript", "GitHub Actions", "CloudFormation"]
repository: "https://github.com/Joskingy/Python_Project"
contribution: "Site architecture and delivery"
scope: "Static portfolio and engineering handbook"
order: 3
---

## The problem

I wanted a portfolio that could explain my engineering work and demonstrate the same care in its own delivery: repeatable environments, useful checks, and a small operational footprint.

## From Flask to a static portfolio

The project began as a Flask and PostgreSQL application. I migrated its dependency management to uv and Python 3.13, then introduced a Python build that rendered Jinja templates and Markdown into static HTML.

The portfolio now uses Astro and TypeScript, with Starlight for the engineering handbook. Project content lives in typed Markdown and MDX collections. Pagefind builds one search index for projects and handbook articles. The original Flask work and its stored data remain separate from the generated site.

## A deliberate interface

Black surfaces, locally hosted Dela Gothic One headings, and Space Grotesk body text establish the visual identity. A small canvas renderer gives the homepage slow-moving 3D stars and eased cursor response. It includes pause/resume, a static reduced-motion view, and hidden-tab suspension. Reading pages use a static background.

## Delivery decisions

- **Generate content at build time.** Visitors receive static files without an application server.
- **Validate the release.** Content schemas, TypeScript, generated links, and security-policy checks run before saving the artifact.
- **Publish what was checked.** The deployment job downloads the build artifact rather than rebuilding after approval.
- **Separate responsibilities.** Content publishing and infrastructure application use separate workflows and scoped identities.

## Hosting and infrastructure review

The hosting stack is deployed on private S3 and CloudFront with HTTPS and Origin Access Control. GitHub Actions uses OIDC to assume the publishing role. Deployment verifies the active CloudFront Free subscription before uploading assets and pages.

Infrastructure changes use a manual CloudFormation change-set workflow. An environment approval gates application of the reviewed proposal. The public CloudFront URL provides the initial address; a custom domain remains a future decision.

## Evidence and limits

The repository contains the application source, hosting templates, and delivery workflows. The site keeps its runtime small because its current job is to present content. There is no CMS, user-account service, or application database on the public portfolio path.

[See how this site ships](/engineering.html) and [review the infrastructure process](/handbook/iac/change-set-review.html).
