## The problem

A successful deployment is only part of operating a platform. I wanted practical experience diagnosing failed releases, validating network boundaries, and recovering an application after a change goes wrong.

## The environment

In my independent cloud work, I provisioned Amazon EKS clusters with managed node groups and private worker nodes, published images to ECR, and maintained an application Helm chart. ALB ingress with TLS and Kubernetes Services provided application routing.

## Operational exercises

- Investigated readiness-probe, image-pull, and scheduling failures using events, logs, Deployment status, and Service endpoints.
- Validated routing, target health, and NetworkPolicies with allowed and denied clients.
- Tested Horizontal Pod Autoscaling under controlled load.
- Rehearsed a Kubernetes minor-version upgrade.
- Introduced a failed application release, restored a known-good Helm revision, and verified application and pod recovery.

## The engineering emphasis

The work centered on reading the platform's evidence before changing it: distinguishing an unhealthy application from an unavailable image or an unschedulable workload, then choosing the relevant recovery action.

## Evidence and scope

This is an independent lab described in my résumé. It is presented separately from client production experience. A public repository, screenshots, and measured results have not been linked here; I do not claim an uptime or recovery-time result for these exercises.
