# Security

## Reporting a vulnerability

Do not open a public issue for a suspected vulnerability. Use GitHub's private vulnerability reporting feature when enabled, or contact the repository owner privately. Include affected versions, reproduction steps, impact, and any suggested remediation.

## Security model

The Apex controller is declared `with sharing` and filters SObjects and fields through Salesforce describe accessibility checks. Access to the controller and Visualforce bridge is granted by the included `Flow_Config_Editor_Access` permission set; assign it only to trusted Flow builders.

`with sharing` governs record access, not object permissions, so Apex-defined type inspection additionally requires the running user to hold **Manage Flow** (`PermissionsManageInteraction`). Assigning the framework permission set on its own therefore does not grant a way to read Apex source. SObject path and hierarchy-setting describes remain governed by the running user's object and field accessibility.

### Apex-defined type bridge

Flow Builder does not consistently expose the members of Apex-defined types in `builderContext`. To fill that gap, `FlowConfigApexTypeBridge.page` runs in the authenticated Salesforce origin and queries the Tooling API for an Apex class symbol table.

Important properties of the bridge:

- The Salesforce session ID remains inside the Visualforce page and is never returned to the LWC.
- The `parentOrigin` parameter is untrusted input. The page validates it against an HTTPS Salesforce-domain allowlist **before installing its message listener**, re-checks the origin of every inbound message, and stays inert when the check fails. The picker applies the same check to the bridge's own origin before trusting it.
- Class names are normalized and validated before they are placed in SOQL.
- Only Aura-enabled fields/properties are returned to the picker.
- Browser and Salesforce session controls remain the ultimate trust boundary.

Review this bridge before deploying into a security-sensitive environment. Organizations that prohibit session-backed Tooling API access can remove the Visualforce page and page permission; SObject traversal and resources already described by Flow Builder continue to work, while unresolved Apex-defined members will not be available.

## Operational guidance

- Use least-privilege permission-set assignment.
- Keep the Salesforce API version and dependencies current.
- Run static analysis and all tests before packaging.
- Never add debug logging that prints session IDs, Flow resource values, or metadata payloads.
- Validate changes in a sandbox or scratch org before production deployment.

Supported security fixes should target the latest release. Maintainers will document material security changes in the changelog without publishing exploit details prematurely.
