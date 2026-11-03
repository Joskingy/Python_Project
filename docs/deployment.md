# AWS portfolio deployment

The prepared setup uses private S3, CloudFront OAC, HTTPS, and the CloudFront
Free flat-rate plan. Local administration uses `--profile default` in `us-east-1`.
GitHub Actions uses a separate scoped OIDC role and the `production` environment.

## Preparation status

Account checks on November 3, 2026 found no CloudFront distributions, flat-rate
subscriptions, or GitHub OIDC provider in the default account. The IAM identity
predates the newer AWS Free account plan. The account-plan API returned no record
for this legacy account. These checks found no obvious enrollment blocker.

Final eligibility is confirmed when AWS accepts the subscription and its status
becomes `ACTIVE`. The template requests only `FREE`. Enrollment requires creating
both a distribution and a dedicated WAF web ACL. Resources remain unprovisioned
until the infrastructure change set is executed.

The Free plan covers its associated CloudFront/WAF usage and provides S3 storage
credits. S3 requests, storage beyond credits, and any future domain registration
can incur charges. WAF can incur prorated charges before enrollment activates.
Confirm the bootstrap cost before executing the change set. Keep the distribution
disabled until the subscription is active. The Free plan omits access logging.

## One-time workflow access

Local bootstrap uses the `default` profile in the verified account. The separate
access stack creates the GitHub OIDC provider, a planning role, an apply role,
and a permissions boundary for the site's publishing role.

```powershell
aws sts get-caller-identity --profile default
$accountId = aws sts get-caller-identity --profile default --query Account --output text
aws cloudformation deploy --profile default --region us-east-1 --stack-name oscar-portfolio-access --template-file infra/infrastructure-access.yml --capabilities CAPABILITY_IAM --parameter-overrides "ExpectedAccountId=$accountId"
aws cloudformation describe-stacks --profile default --region us-east-1 --stack-name oscar-portfolio-access --query 'Stacks[0].Outputs' --output table
```

If a GitHub OIDC provider already exists, pass `ExistingGitHubProviderArn` to the
bootstrap. The provider and publishing boundary are retained on stack deletion.
The workflow manages only the hosting stack. Manage this access stack locally
with `default`, so the workflow cannot change its own roles or boundary.

Set these **repository variables** from the access stack outputs.

| Variable | Value |
| --- | --- |
| `AWS_ACCOUNT_ID` | Verified default account ID |
| `AWS_INFRA_PLAN_ROLE_ARN` | `PlanRoleArn` output |
| `AWS_GITHUB_PROVIDER_ARN` | `GitHubProviderArn` output |
| `AWS_DEPLOY_BOUNDARY_ARN` | `DeployBoundaryArn` output |

Create the `infrastructure-production` GitHub environment before running the
workflow. Add Oscar as a required reviewer, restrict deployment branches to the
selected branch `main`, and disable administrator bypass. Leave prevention of
self-review off when Oscar starts and approves his own deployment. Store
`AWS_INFRA_APPLY_ROLE_ARN` as an **environment variable** using `ApplyRoleArn`.
This keeps the apply role configuration behind the approval gate.

GitHub environment protection is configured in repository Settings, under
Environments. Merely naming an environment in YAML does not configure reviewers.
GitHub plan support for required reviewers depends on repository visibility.

## Review and apply infrastructure

Merge the reviewed workflow and templates into `main`. In GitHub Actions, run
**Portfolio infrastructure** on `main` with delivery set to `preserve`.

1. The plan job validates the template and creates a change set for
   `oscar-portfolio`. On the first run, delivery starts disabled.
2. Review the Actions summary and its AWS link. Check resource additions,
   modifications, deletions, and replacements. Planning cannot execute the changes.
3. Approve the pending `infrastructure-production` deployment to execute that
   exact change set. Reject it to leave the proposed changes unapplied.
4. The apply job waits for CloudFormation, checks the active Free subscription,
   and lists stack outputs in its summary.

Subsequent runs preserve delivery by default. Select `enable` only after the
initial stack has an active Free subscription. Select `disable` to stop delivery.
A no-change run finishes without an approval request. If a first creation was
planned but never executed, the next run can create a fresh initial change set.
A failed stack needs its CloudFormation error resolved before retrying.

Infrastructure runs are serialized. Applying infrastructure and publishing the
site share a deployment lock. Normal CloudFormation rollback stays enabled.
If a subscription check fails after the stack completes, inspect its status and
resolve enrollment or clean up the resources before leaving WAF on usage pricing.

Use the generated `cloudfront.net` URL for the first release. A custom domain can
be added after its name and registration cost are agreed.

## Connect GitHub Actions

Create the GitHub `production` environment and restrict deployments to `main`.
Set its environment variables from the hosting stack outputs in the infrastructure run summary.

| Variable | Value |
| --- | --- |
| `AWS_ACCOUNT_ID` | Verified default account ID |
| `AWS_DEPLOY_ROLE_ARN` | `DeployRoleArn` output |
| `AWS_SITE_BUCKET` | `SiteBucketName` output |
| `AWS_DISTRIBUTION_ID` | `DistributionId` output |
| `AWS_FREE_PLAN_ARN` | `FreePlanArn` output |
| `AWS_SITE_URL` | `SiteUrl` output |

Set the repository-level variable `AWS_DEPLOY_ENABLED` to `true` only after the
stack, Free subscription, and environment branch restriction have been checked.
Its repository scope is important because job selection happens before environment
variables are available. Run Portfolio CI manually on `main` for the first release.

The workflow builds and checks all pages, saves `dist/` as
`portfolio-<commit SHA>`, and publishes that tested artifact. It checks the expected
AWS account and active Free subscription, uploads assets before HTML, refreshes
the CDN, and verifies the homepage plus both featured case studies. Deployments run
serially. Artifact retention is seven days.

The upload keeps existing objects so cached pages can still load their assets.
Review unused current objects during occasional maintenance. S3 retains prior
versions for 30 days. A publication is a sequence of object uploads. A failed upload
can leave a partial release, so rerun the failed workflow to finish it.

## Rollback

Revert the problematic portfolio change through a pull request to `main`. Its
successful CI run rebuilds and publishes the previous content through the same
workflow. Keep the last successful workflow artifact for reference during recovery.
The global `AWS_DEPLOY_ENABLED` switch pauses future publishing while investigating.

References are the [CloudFront plan constraints](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html),
[subscription resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-pricingplanmanager-subscription.html),
and [subscription API](https://docs.aws.amazon.com/PricingPlanManager/latest/UserGuide/getting-started-pricingplanmanager-api.html).
