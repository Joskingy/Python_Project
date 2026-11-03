## The project and my role

BrewMaster is a collaborative coffee recipe application built with React, TypeScript, and AWS Amplify Gen 2. The application combines recipe discovery and publishing with Cognito authentication and an AppSync data API backed by DynamoDB.

My work focused on the AWS delivery and access paths. I contributed GitHub Actions deployment workflows, OIDC permissions, environment-specific frontend configuration, and AppSync troubleshooting. The project also includes contributions from other team members across the application and its design.

## AWS architecture

Amplify Gen 2 defines the backend in TypeScript. Cognito supplies authentication, AppSync exposes the recipe API, and the data model defines owner and administrator access. The development branch adds public recipe reads through the Cognito identity pool and image storage through Amplify Storage.

The architecture illustration summarizes the reviewed development branch. Development and main have diverged, so the features described here have branch-specific scope. The source repository is private.

## Deployment workflow

I contributed deployment workflows for development and main, with validation before the deployment job and deployment limited to push events. I added the GitHub OIDC permissions used by the AWS credentials action to assume a role.

I also corrected the frontend build sequence. The deployment job deploys the selected Amplify backend, generates that environment's outputs, verifies the configuration file exists, and builds the frontend against those outputs. It then triggers Amplify Hosting through an environment-specific webhook.

The development branch's hosting configuration generates backend outputs before building the frontend. This gives the delivery process a clear order between backend deployment, frontend configuration, and hosting.

## Troubleshooting AppSync recovery

I worked on a deployment problem involving a missing AppSync API key after rollback recovery. The recovery change replaced the missing key by changing its infrastructure logical ID. A later change restored the default logical ID after recovery.

This work required distinguishing the deployed resource state from the state the deployment expected. The sequence of recovery and restoration is recorded in my commits. It provides a concrete example of diagnosing infrastructure state and keeping a recovery workaround bounded.

## Public access and rollout

I added Cognito guest access for public recipe reads. The frontend chooses identity-pool access for visitors and user-pool access for signed-in readers. The change includes checks for public recipe loading across session and route changes.

The data model retains API-key read access for the previous frontend during rollout. This transition lets the updated frontend adopt the new access path while supporting the earlier client. The case study describes that development implementation.

## Evidence and verification

My source history records the [OIDC permissions change](https://github.com/Brewology-Society/react-brew-master/commit/cb5fd4f15e88b16a73babefd00bfda756b13c027), [environment-specific build fix](https://github.com/Brewology-Society/react-brew-master/commit/05d20e7d9db80a14c1d4062dcf1ce01e77f1c2c0), [AppSync recovery](https://github.com/Brewology-Society/react-brew-master/commit/ea0d6b90b6dfdee1db02d2d3dae885d992043fa9), and [guest-access implementation](https://github.com/Brewology-Society/react-brew-master/commit/496e65f5e60a4baeaa98e151b229dda35a97d7c3). These links require repository access.

The development workflow inspected during the portfolio review completed validation and backend deployment successfully on October 15, 2026. This is a recorded workflow result. Live application behavior and availability require a separate check.

[Development workflow evidence](https://github.com/Brewology-Society/react-brew-master/actions/runs/38660637577) is available to repository collaborators.

## Engineering lessons

Frontend configuration is part of the release. Its environment and generation order matter as much as the build command itself.

Infrastructure recovery also needs a clear end state. Replacing a missing resource and then restoring the standard definition keeps the recovery steps understandable. During authentication changes, preserving the earlier client's access path can support a staged rollout.
