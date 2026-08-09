---
name: validate-flow-config-kit
description: Validate changes to the Flow Config Editor Kit for Salesforce before handoff, pull request, packaging, deployment, or release. Use for local lint/test/coverage/format checks, Apex tests, independent core and example validation, manifest review, secret scanning, generated-artifact cleanup, and release-readiness reporting.
---

# Validate Flow Config Kit

Prove the core package is reusable independently and report evidence concisely.

## Local verification

From the repository root:

```bash
npm ci
npm run verify
```

`verify` must pass ESLint, all LWC Jest suites, configured coverage thresholds, and Prettier. Do not weaken thresholds or suppress failures to make a change pass.

For a narrow iteration, run focused tests first, but run the full command before final handoff.

## Version and dependency currency

Run:

```bash
npm run check:api-version
npm run check:dependencies
```

- Confirm the configured Salesforce API version is supported by the target org and is identical in `sfdx-project.json`, all metadata XML, both manifests, the Visualforce Tooling API bridge, and the README.
- Check the registry rather than relying on remembered package versions.
- Inspect `engines` and `peerDependencies` before accepting upgrades.
- Keep the local Node engine and GitHub Actions Node version compatible with the strictest dependency.
- Regenerate and commit `package-lock.json` with `package.json` changes.
- An intentionally held dependency must have a concrete compatibility reason in the handoff or pull request.

## Salesforce validation

Validate core independently when Salesforce metadata changed:

```bash
sf project deploy validate \
  --source-dir force-app \
  --target-org <alias> \
  --test-level RunSpecifiedTests \
  --tests FlowConfigApexTypeControllerTest \
  --wait 30
```

Validate `examples` separately after core exists in the target org:

```bash
sf project deploy validate \
  --source-dir examples \
  --target-org <alias> \
  --test-level RunSpecifiedTests \
  --tests FlowConfigApexTypeControllerTest \
  --wait 30
```

Do not deploy merely to validate. Deploy only when the user explicitly requests it. Never assume a production target.

## Package integrity

- Confirm `force-app` contains no example bundles and imports nothing from `examples`.
- Confirm `manifest/package.xml` lists every core metadata component and excludes examples.
- Confirm `manifest/examples-package.xml` contains only optional example metadata.
- Confirm `sfdx-project.json` keeps `force-app` as the default package directory.
- Confirm public metadata retains the `FlowConfig`/`flowConfig` prefix.
- Run the core validation even when the example already exists in the target org.

## Public repository safety

Search tracked candidates for org IDs, usernames, aliases, instance URLs, emails, tokens, session IDs, customer names, and hard-coded metadata. The Visualforce bridge may contain the runtime `$Api.Session_ID` expression and an in-page variable name, but it must never contain a literal session value or transmit it to the parent LWC.

Keep `node_modules`, coverage output, Salesforce caches, logs, and editor-local files untracked. Preserve `LICENSE`, `NOTICE`, and `Apache-2.0` package metadata.

## Handoff report

Report:

- Commands run and pass/fail totals
- Coverage summary when tests changed
- Salesforce validation or deployment IDs when applicable
- Core/example package independence
- Any platform behavior that could not be validated
- Files intentionally generated or removed

Do not commit, tag, publish, create a package version, or create a GitHub release unless explicitly requested.
