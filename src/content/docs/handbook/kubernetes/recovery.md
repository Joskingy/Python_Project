---
title: Investigate before recovering
description: Evidence-led troubleshooting from an independent EKS and Helm lab.
lastUpdated: 2026-11-04
sidebar:
  label: Troubleshooting and recovery
---

This note comes from my independent Kubernetes lab. It describes a diagnostic
approach, separate from client production experience. I have not published a
measured recovery-time or availability result for these exercises.

## Start with the failing boundary

A failed rollout can have several causes. An image that cannot be pulled, a pod
that cannot be scheduled, and a running application that fails readiness checks
need different investigations.

I begin with Deployment status, pod events, and application logs. Then I trace
the request through Service endpoints, ingress, and target health as needed.
For network-policy exercises, I check both an allowed client and a denied one.

## Keep the context explicit

These are read-only examples. Replace the namespace and Deployment with the lab’s
actual values, and inspect the current context before running them.

```sh title="Initial lab investigation"
kubectl config current-context
kubectl get deployments,pods,services -n lab
kubectl describe deployment example-app -n lab
kubectl get events -n lab --sort-by=.lastTimestamp
```

Events are transient evidence. Capture the relevant context while it is available,
and avoid treating a single status snapshot as a complete diagnosis.

## Choose a recovery that fits the evidence

In the lab, I introduced a failed release, restored a known-good Helm revision,
and verified pod and application recovery. Rollback is one option when a release
caused the failure. It does not correct an unrelated network, capacity, or external
dependency problem.

Before a rollback, check the release history and whether the earlier application
version can work with the current data and dependencies. A rollback of manifests
does not automatically reverse every external change.

## Verify the user-facing path

- Check the Deployment and pod state.
- Confirm the expected Service endpoints and ingress target health.
- Exercise the application route through the same access path used by a visitor.
- Recheck the allowed and denied network cases relevant to the change.

## Scope and sources

My lab also covered autoscaling, a minor-version upgrade, and private EKS worker
nodes. Public logs and a reproducible lab repository are not linked yet.

- [Kubernetes operations case study](/projects/kubernetes-operations.html)
- [Kubernetes application troubleshooting](https://kubernetes.io/docs/tasks/debug/debug-application/)
- [Helm rollback command](https://helm.sh/docs/helm/helm_rollback/)
