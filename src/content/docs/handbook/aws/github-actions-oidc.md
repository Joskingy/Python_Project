---
title: GitHub Actions to AWS, without stored keys
description: Workflow identity, scoped permissions, and infrastructure approval in this portfolio.
lastUpdated: 2026-11-04
sidebar:
  label: GitHub Actions identity
---

The portfolio needs to publish tested files to AWS. A publishing job should
receive the permissions needed for that release, with an identity tied to the
repository and deployment environment.

## Establish the workflow’s identity

The publishing job requests a GitHub OIDC token and exchanges it for temporary
AWS credentials. The role’s trust policy checks the token audience and the
subject for this repository’s `production` environment.

This is the condition excerpt from the hosting template. It is illustrative
on its own; the complete role also defines the provider, assume-role action,
permissions, and permissions boundary.

```json title="Trust-policy condition"
{
  "StringEquals": {
    "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
    "token.actions.githubusercontent.com:sub": "repo:Joskingy/Python_Project:environment:production"
  }
}
```

An environment-based subject identifies the environment. Restricting that
environment to `main` is a separate GitHub environment setting. Both the trust
policy and the environment’s deployment rules need review.

## Keep permissions tied to the task

The publishing role uploads the generated site and requests a CloudFront
invalidation. Planning and applying infrastructure use separate roles and a
manual workflow.

- **Publish** consumes the tested site artifact.
- **Plan** prepares a CloudFormation change set for inspection.
- **Apply** executes the reviewed change set after environment approval.

The workflow also checks the expected account and active CloudFront Free
subscription before uploading. Those checks are part of this project’s delivery
constraints, alongside scoped permissions.

## Why this approach

Stored access keys would require rotation and create another long-lived secret
to manage. OIDC gives the workflow temporary credentials tied to its identity.
It still depends on careful trust conditions, role permissions, and protection
of the workflow code.

## Verify the boundaries

1. Match the repository, audience, and environment in the trust policy to the workflow.
2. Check that the production environment permits the intended deployment branch.
3. Review the publishing permissions against the site’s bucket and distribution.
4. Confirm infrastructure application waits for approval of the reviewed change set.
5. After publication, check the public pages, search assets, and HTTPS responses.

Exercise denied-access scenarios in a separate test environment. A successful
deployment proves the permitted path works; it does not prove every unwanted
path is blocked.

## Implementation and sources

- [Hosting and publishing role template](https://github.com/Joskingy/Python_Project/blob/main/infra/portfolio.yml)
- [Infrastructure review workflow](https://github.com/Joskingy/Python_Project/blob/main/.github/workflows/infrastructure.yml)
- [GitHub’s OIDC guidance for AWS](https://docs.github.com/en/actions/how-tos/secure-your-work/security-harden-deployments/oidc-in-aws)

Continue with [change-set review](/handbook/iac/change-set-review.html) or
[BotoToolkit’s local operator workflow](/projects/bototoolkit.html).
