---
layout: default
title: Platform boundaries
description: Salesforce metadata, Flow Builder, packaging, and security constraints.
---

# Known platform boundaries

The framework can only discover metadata Salesforce makes available to a custom property editor or to the authenticated metadata bridge.

## Unsaved screen component outputs

Flow Builder's native resource picker may see newly added screen components before the public custom-editor `builderContext` is refreshed. Custom editors do not have a supported command that forces Flow Builder to republish all sibling outputs. Closing/reopening the element or saving the screen can refresh the context.

The framework requests a state-neutral automatic-output refresh after the picker shell has painted so Flow Builder metadata work does not block the interaction. This remains best effort: Flow Builder may republish the same stale context, and a save or editor reopen can still be required.

## Apex-defined types

Member discovery uses an Apex controller first and an authenticated Visualforce/Tooling API bridge when necessary. Access depends on the Flow builder's permissions, Salesforce session behavior, API availability, and the Apex class exposing Aura-enabled members. Organizations may disable the bridge as described in [Security](../SECURITY.md).

## Subflows and component outputs

Output types depend on the metadata present in `builderContext`, including generic type mappings. The framework does not hard-code known subflows or LWCs. An output without usable type information can be browsed but may be filtered out for a typed input.

## Globals

Salesforce does not provide every global as a uniform dynamic list. Stable globals are modeled by API version and data type. Versioned `$Api` Enterprise and Partner URLs are generated through the current Flow API version; session ID globals are intentionally not offered.

## Custom Labels and hierarchy settings

Visibility follows the current user's metadata and object/field access. Custom Hierarchy Settings are returned only when a setting and its custom fields are accessible.

## Relationship traversal

Polymorphic relationships can expose multiple targets. Resolution chooses an accessible target consistent with the next path segment. The field picker defaults to a maximum depth of five to prevent accidental unbounded traversal.
