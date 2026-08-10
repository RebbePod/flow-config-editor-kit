# Contributing

Contributions are welcome. Keep changes focused, reusable, and independent of any one Salesforce org.

AI-assisted contributions must follow [`AGENTS.md`](AGENTS.md) and the relevant repository-local skills in [`.agents/skills`](.agents/skills). Human contributors can use the same files as concise architecture and validation checklists.

## Local setup

1. Install a current Salesforce CLI and Node.js 22 or later.
2. Run `npm ci`.
3. Authenticate a development org with `sf org login web --alias flow-config-dev`.
4. Deploy `force-app`, then optionally deploy `examples`.
5. Assign `Flow_Config_Editor_Access` to users who build Flows with the framework.

## Before opening a pull request

Run:

```bash
npm run verify
sf project deploy validate --source-dir force-app --target-org flow-config-dev --test-level RunLocalTests --wait 30
```

For UI changes, test inside the Flow Builder property panel at narrow and wide panel sizes. Exercise keyboard navigation, click-out behavior, saved-value restoration, and deeply nested navigation.

## Project conventions

- Core reusable code belongs in `force-app`; demos belong in `examples`.
- Prefix public metadata with `FlowConfig` or `flowConfig` to reduce collisions in the unnamespaced `c` namespace.
- Add Jest coverage for behavior changes and Apex tests for server changes.
- Use shared utilities instead of duplicating resource normalization, icons, breadcrumbs, popover placement, or Flow event construction.
- Do not hard-code org-specific object names, Apex classes, subflows, or screen components.
- Do not log Flow values, session IDs, or Tooling API payloads.
- Preserve backwards-compatible public attributes and event shapes whenever practical.

## Pull requests

Describe the user-visible behavior, the platform contexts tested, and any compatibility impact. Include screenshots for UI changes. Breaking changes should include a migration note and a major version proposal.

Unless explicitly stated otherwise, contributions intentionally submitted for inclusion are licensed under the Apache License 2.0, consistent with the repository license.
