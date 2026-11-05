---
title: Engineering handbook
description: Practical notes on identity, delivery, recovery, and useful automation.
lastUpdated: 2026-11-04
---

The decisions behind the work. These notes connect implementation evidence with
the constraints, tradeoffs, and checks that make a practice useful.

## AWS and delivery

[GitHub Actions to AWS, without stored keys](/handbook/aws/github-actions-oidc.html)

Establish workflow identity, scope permissions, and separate publishing from
infrastructure approval. Based on this portfolio’s delivery configuration.

## Infrastructure as code

[Review the change before applying it](/handbook/iac/change-set-review.html)

Use a CloudFormation change set to make an infrastructure update reviewable.
Understand what the preview can tell you and what still needs verification.

## Kubernetes

[Investigate before recovering](/handbook/kubernetes/recovery.html)

Distinguish scheduling, image, readiness, and routing failures before choosing a
recovery action. A practice note from my independent EKS and Helm lab.

## Python

[Build a CLI an operator can trust](/handbook/python/operator-cli.html)

Make account context, partial results, and the transition to a write operation
visible. Lessons from BotoToolkit’s Amplify operations workflow.

## Read alongside the projects

The [BotoToolkit case study](/projects/bototoolkit.html) explains my independent
Python work. [BrewMaster](/projects/brewmaster.html) describes my contributions to
a collaborative application. [The portfolio’s delivery](/engineering.html)
shows how these practices fit together in this site.
