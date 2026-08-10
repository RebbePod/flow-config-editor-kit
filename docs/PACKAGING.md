# Packaging and releases

The framework ships as a **no-namespace unlocked package**. No namespace is deliberate: consuming org code imports these components as `c/flowConfigEditorBase` and `c-flow-config-resource-picker`, and a namespace would change every one of those references for adopters.

`examples` is a separate package directory and is never part of the package.

## One-time bootstrap

The package must exist in a Dev Hub before any version can be built. This is done once, by a maintainer, and it writes to the Dev Hub — pick the right one deliberately.

```bash
sf package create \
  --name "Flow Config Editor Kit" \
  --package-type Unlocked \
  --path force-app \
  --target-dev-hub <your-dev-hub>
```

The command writes the resulting `0Ho…` id into `packageAliases` in `sfdx-project.json`. Commit that change — the id is not a secret, and CI needs it.

To undo before any version is promoted:

```bash
sf package delete --package "Flow Config Editor Kit" --target-dev-hub <your-dev-hub>
```

A package with a **promoted** version cannot be deleted. Promotion is the point of no return, not creation.

## Building a version

```bash
npm run package:version          # build a beta version
npm run package:promote -- --package "Flow Config Editor Kit@0.1.0-1"
```

Version creation takes roughly 10–40 minutes and runs the Apex tests. A beta version installs into scratch orgs and sandboxes; only a promoted version installs into production.

Always install a beta into a scratch org and exercise it in Flow Builder before promoting.

## Install URLs

```text
https://login.salesforce.com/packaging/installPackage.apexp?p0=<04t…>
https://test.salesforce.com/packaging/installPackage.apexp?p0=<04t…>   (sandbox)
```

After installing, assign the permission set:

```bash
sf org assign permset --name Flow_Config_Editor_Access --target-org my-org
```

## Automated releases

`.github/workflows/release.yml` runs on a `v*` tag. It creates a package version, installs it into a fresh scratch org to prove it is installable, promotes it, and opens a GitHub Release containing the install URL.

It requires a `DEVHUB_SFDX_URL` repository secret:

```bash
sf org display --target-org <your-dev-hub> --verbose --json
```

Copy the `sfdxAuthUrl` value into the secret. It grants full access to that Dev Hub — use a Dev Hub you are willing to expose to CI, and rotate it if the repository's collaborators change.

Without the secret the workflow fails fast with a clear message rather than half-releasing.

## Version numbering

`versionNumber` uses `major.minor.patch.NEXT`; `NEXT` auto-increments the build number per version. Bump `versionNumber` and `versionName` in `sfdx-project.json` for each release, and tag to match:

```bash
git tag v0.1.0 && git push origin v0.1.0
```

Follow semantic versioning against the **public contract**: component attributes, event `detail` shapes, the `flowProperties` schema, the base class methods, and stored value formats. Anything documented in `docs/COMPONENT_API.md` or `docs/llms.txt` is public. A breaking change to any of it is a major bump with a migration note in `CHANGELOG.md`.
