---
title: Build a CLI an operator can trust
description: Identity, explicit scope, and honest results in BotoToolkit.
lastUpdated: 2026-11-04
sidebar:
  label: Operator-focused CLIs
---

A useful operations CLI helps someone decide what to do next. BotoToolkit’s
`amplify-ops` combines Python, Boto3, Typer, and Rich around that purpose.

## Make context an input

The operator supplies an AWS profile, expected account, and selected regions.
An STS identity check runs before operational reads. This makes account selection
an explicit part of the investigation rather than an invisible terminal setting.

The CLI focuses on Amplify Hosting operations. It does not claim to discover every
backend dependency attached to an application.

## Distinguish an empty result from a failed read

No matching resources and insufficient evidence are different outcomes. Contextual
errors and meaningful exit codes help an operator judge whether the report is
complete. Partial reads remain visible instead of silently becoming empty lists.

Rich supports readable terminal reports, while Typer supplies the command
interface. The useful design decision is to keep scope and error context visible
in both successful and incomplete investigations.

## Separate investigation from a write

Configuration comparisons report differences while withholding the values.
The deployment command submits an explicitly reviewed retry. Read-only commands
remain useful without crossing that boundary.

A one-command automatic repair could reduce interaction, but it would also hide
the decision between gathering evidence and changing a deployment. This tool
keeps that transition deliberate.

## Verify the behaviors that matter

The repository contains pytest checks, a uv lockfile, and CI covering Linux and
Windows, sensitive-information checks, and distribution smoke checks. These are
implementation checks, not a claim of production reliability or measured
productivity improvement.

Review the documented commands and current test results before adopting the tool.
CI authentication support is documented as future work; local profile identity
is separate from this portfolio’s GitHub OIDC workflow.

## Implementation and sources

- [BotoToolkit documentation](https://github.com/Joskingy/BotoToolkit#readme)
- [BotoToolkit CI](https://github.com/Joskingy/BotoToolkit/blob/main/.github/workflows/ci.yml)
- [BotoToolkit case study](/projects/bototoolkit.html)
- [The portfolio’s workflow identity](/handbook/aws/github-actions-oidc.html)
