---
title: Review the change before applying it
description: A small CloudFormation review workflow for this portfolio’s infrastructure.
lastUpdated: 2026-11-04
sidebar:
  label: Change-set review
---

A content update and an infrastructure update have different consequences.
Publishing a case study should not require permission to replace hosting
resources. This portfolio keeps those paths separate.

## Make the proposed change visible

The manual infrastructure workflow validates the template and creates a named
CloudFormation change set. Its summary identifies resource additions,
modifications, removals, and replacements. The planning job cannot execute it.

The apply job waits behind the `infrastructure-production` environment approval.
It executes that same reviewed change set. A workflow that rebuilds its plan
after approval could apply a different proposal from the one reviewed.

## What I review

1. Confirm the intended stack, account, and deployment parameters.
2. Read removals and replacements first, especially storage and identity resources.
3. Compare permission changes with the workload’s actual needs.
4. Check the delivery setting and the Free-only hosting constraint.
5. Approve the exact change set, then inspect stack events and the resulting behavior.

Environment approval is configured in GitHub settings. Naming an environment in
workflow YAML alone does not configure a required reviewer.

## Why keep a manual step

Automatic application would be simpler for frequent disposable environments.
For this small persistent site, the extra review gives me an opportunity to
inspect replacement and permission changes before they reach the hosting stack.
Routine content publishing still follows the protected main branch.

## Limits and recovery

A change set previews resource operations. It does not guarantee that the update
will succeed or that the application will behave correctly afterward. Stack
events, rollback status, and public page checks remain necessary.

The workflow serializes infrastructure application and site publishing. Normal
CloudFormation rollback remains enabled. Failed changes need investigation of
the actual resource state before another attempt.

## Implementation and sources

- [Portfolio infrastructure workflow](https://github.com/Joskingy/Python_Project/blob/main/.github/workflows/infrastructure.yml)
- [Hosting template](https://github.com/Joskingy/Python_Project/blob/main/infra/portfolio.yml)
- [AWS documentation on change sets](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-cfn-updating-stacks-changesets.html)

Read [how this site ships](/engineering.html) for the complete release path.
