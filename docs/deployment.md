# AWS portfolio deployment

The prepared setup uses private S3, CloudFront OAC, HTTPS, and the CloudFront
Free flat-rate plan. Local administration uses `--profile default` in `us-east-1`.
GitHub Actions uses a separate scoped OIDC role and the `production` environment.

## Hosting and release status

The portfolio is hosted on private S3 and CloudFront with HTTPS and Origin
Access Control. The Free subscription and delivery were enabled during bootstrap.
The default AWS profile was used for that portfolio account; verify identity
before any future administration. Publishing continues to require the active
Free subscription. The Astro migration itself does not change infrastructure.

The site is static. No application server, database, or additional hosting service
is needed. Custom domains remain a separate registration and configuration step.
The Free plan omits access logging. S3 requests and storage outside covered
credits can incur charges; spending alerts remain separate from deployment checks.

The Free plan uses AWS-managed security headers. Astro generates a CSP meta tag;
`npm run build` adds hashes for Starlight’s final inline scripts and places the
policy before executable content. JavaScript eval and arbitrary inline scripts
remain blocked. Pagefind’s WebAssembly and code-highlighting style attributes
are allowed explicitly.

## Astro release checks

Use `npm ci`, `npm run check`, and `npm run build` with the Node version in
`.node-version`. The build preserves the existing six public pages and generates
the handbook as exact `.html` objects. The private S3 origin does not resolve
nested directory indexes. All internal links use generated file paths, so this
migration requires no CloudFront routing function or infrastructure update.

Search uses one Starlight-generated Pagefind index for the whole site. Check it
with `npm run preview` or the timed static preview after building. Review the
homepage, both featured projects, handbook navigation, search, and motion controls
before merging the migration to main.

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

Set these **repository secrets** from the access stack outputs.

| Repository secret | Value |
| --- | --- |
| `AWS_ACCOUNT_ID` | Verified default account ID |
| `AWS_INFRA_PLAN_ROLE_ARN` | `PlanRoleArn` output |
| `AWS_GITHUB_PROVIDER_ARN` | `GitHubProviderArn` output |
| `AWS_DEPLOY_BOUNDARY_ARN` | `DeployBoundaryArn` output |

Create the `infrastructure-production` GitHub environment before running the
workflow. Add Oscar as a required reviewer, restrict deployment branches to the
selected branch `main`, and disable administrator bypass. Leave prevention of
self-review off when Oscar starts and approves his own deployment. Store
`AWS_INFRA_APPLY_ROLE_ARN` as an **environment secret** using `ApplyRoleArn`.
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
   and reports completion in its summary. Retrieve stack outputs privately in the AWS console.

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
Configure its secrets and variables from the hosting stack outputs in the AWS console.

| Setting | Storage | Value |
| --- | --- | --- |
| `AWS_ACCOUNT_ID` | Repository secret | Verified default account ID |
| `AWS_DEPLOY_ROLE_ARN` | Production environment secret | `DeployRoleArn` output |
| `AWS_FREE_PLAN_ARN` | Production environment secret | `FreePlanArn` output |
| `AWS_SITE_BUCKET` | Production environment variable | `SiteBucketName` output |
| `AWS_DISTRIBUTION_ID` | Production environment variable | `DistributionId` output |
| `AWS_SITE_URL` | Production environment variable | `SiteUrl` output |

Set the repository-level variable `AWS_DEPLOY_ENABLED` to `true` only after the
stack, Free subscription, and environment branch restriction have been checked.
Its repository scope is important because job selection happens before environment
variables are available. Run Portfolio CI manually on `main` for the first release.

The workflow builds and checks all pages, saves `dist/` as
`portfolio-<commit SHA>`, and publishes that tested artifact. It checks the expected
AWS account and active Free subscription, uploads assets before HTML, refreshes
the CDN, and verifies the homepage, featured case studies, handbook deep link, and search entry files. Deployments run
serially. Artifact retention is seven days.

Hashed `_astro/` assets use a one-year immutable cache. Fonts, search files,
and other public assets use five minutes; HTML uses one minute with revalidation.
All assets are uploaded before HTML.

The upload keeps existing objects so cached pages can still load their assets.
Review unused current objects during occasional maintenance. S3 retains prior
versions for 30 days. A publication is a sequence of object uploads. A failed upload
can leave a partial release, so rerun the failed workflow to finish it.

## Actions output privacy

Account IDs and configured ARNs use GitHub secrets so GitHub can mask them before
step inputs and environment values are logged. Credential actions also enable
account masking, and each AWS job masks its assumed-role ARN before further calls.
Migrate any matching existing GitHub variables to the secret locations above.

The infrastructure summary shows logical resource changes and the change-set name.
The apply summary reports completion. Full stack outputs stay in the AWS console.
The workflow passes a change-set name between jobs so masking does not block the
approval job's input. Historical logs retain their previous visibility.

## Rollback

Revert the problematic portfolio change through a pull request to `main`. Its
successful CI run rebuilds and publishes the previous content through the same
workflow. Keep the last successful workflow artifact for reference during recovery.
The global `AWS_DEPLOY_ENABLED` switch pauses future publishing while investigating.

References are the [CloudFront plan constraints](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/flat-rate-pricing-plan.html),
[subscription resource](https://docs.aws.amazon.com/AWSCloudFormation/latest/TemplateReference/aws-resource-pricingplanmanager-subscription.html),
and [subscription API](https://docs.aws.amazon.com/PricingPlanManager/latest/UserGuide/getting-started-pricingplanmanager-api.html).
