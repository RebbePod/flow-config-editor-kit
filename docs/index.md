---
layout: default
title: Home
description: Reusable Lightning Web Components for polished Salesforce Flow custom property editors.
home: true
---

<section class="hero">
  <div class="hero__copy">
    <p class="eyebrow">Salesforce Flow developer framework</p>
    <h1><span>Build better</span><span>Flow configuration</span><span>panels.</span></h1>
    <p class="hero__lede">Reusable Lightning Web Components for resource, value, object, and field selection—complete with Flow Builder events, validation, metadata discovery, and accessible picker behavior.</p>
    <div class="button-row hero__actions">
      <a class="button button--primary" href="{{ '/GETTING_STARTED/' | relative_url }}">Get started</a>
      <a class="button button--secondary" href="{{ '/COMPONENT_API/' | relative_url }}">Browse components</a>
    </div>
    <ul class="signal-list" aria-label="Project baselines">
      <li>Salesforce API 67.0</li>
      <li>Node 22</li>
      <li>Apache-2.0</li>
    </ul>
  </div>
  <div class="hero__panel" aria-label="Declarative editor example">
    <div class="code-window__bar"><span></span><span></span><span></span></div>
    <pre><code><span class="code-keyword">export default class</span> MyEditor
  <span class="code-keyword">extends</span> FlowConfigEditorBase {
  <span class="code-keyword">static</span> flowProperties = {
    records: {
      type: <span class="code-string">"SObject"</span>,
      collection: <span class="code-boolean">true</span>,
      genericType: <span class="code-string">"T"</span>
    },
    displayField: {
      type: <span class="code-string">"field"</span>,
      dependsOn: <span class="code-string">"records"</span>
    }
  };
}</code></pre>
  </div>
</section>

<section class="screenshot-showcase">
  <div class="section-heading">
    <p class="eyebrow">Inside Flow Builder</p>
    <h2>Familiar controls, richer configuration</h2>
    <p>The pickers fit directly into the standard properties panel while adding searchable metadata, relationship browsing, and multi-selection.</p>
  </div>
  <div class="screenshot-grid">
    <figure class="screenshot-card">
      <a class="screenshot-card__link" href="{{ '/assets/images/screenshots/Object%20Name%20Picker.png' | relative_url }}" aria-label="Open the full-size object picker screenshot">
        <span class="screenshot-card__frame">
          <img src="{{ '/assets/images/screenshots/Object%20Name%20Picker.png' | relative_url }}" width="1282" height="1290" loading="lazy" decoding="async" alt="Object picker open in Salesforce Flow Builder with standard objects and a Show all objects toggle">
        </span>
      </a>
      <figcaption><strong>Object discovery</strong><span>Common objects first, with specialized metadata on demand.</span><a href="{{ '/COMPONENT_API/#c-flow-config-object-picker' | relative_url }}">Component details →</a></figcaption>
    </figure>
    <figure class="screenshot-card">
      <a class="screenshot-card__link" href="{{ '/assets/images/screenshots/Multi%20Field%20Selection.png' | relative_url }}" aria-label="Open the full-size multi-field picker screenshot">
        <span class="screenshot-card__frame">
          <img src="{{ '/assets/images/screenshots/Multi%20Field%20Selection.png' | relative_url }}" width="1306" height="1554" loading="lazy" decoding="async" alt="Multi-field picker with selected fields, ordering controls, and relationship fields">
        </span>
      </a>
      <figcaption><strong>Multi-field selection</strong><span>Review, reorder, remove, and browse relationships.</span><a href="{{ '/COMPONENT_API/#c-flow-config-field-picker' | relative_url }}">Component details →</a></figcaption>
    </figure>
    <figure class="screenshot-card">
      <a class="screenshot-card__link" href="{{ '/assets/images/screenshots/Text%20Input%202.png' | relative_url }}" aria-label="Open the full-size Flow resource screenshot">
        <span class="screenshot-card__frame">
          <img src="{{ '/assets/images/screenshots/Text%20Input%202.png' | relative_url }}" width="1310" height="1332" loading="lazy" decoding="async" alt="Text value input browsing subflow outputs, global constants, and global variables">
        </span>
      </a>
      <figcaption><strong>Flow resources</strong><span>Browse outputs, constants, globals, and compatible values.</span><a href="{{ '/COMPONENT_API/#c-flow-config-value-input' | relative_url }}">Component details →</a></figcaption>
    </figure>
  </div>
</section>

<section class="section-block">
  <div class="section-heading">
    <p class="eyebrow">The useful parts are already built</p>
    <h2>One coherent picker system</h2>
    <p>Every control shares the same resource model, interaction rules, validation language, progressive loading, and viewport-aware popover behavior.</p>
  </div>
  <div class="feature-grid">
    <article class="feature-card">
      <span class="feature-card__index">01</span>
      <h3>Flow resources</h3>
      <p>Search variables, globals, records, collections, screen outputs, actions, subflows, labels, settings, and Apex-defined values.</p>
    </article>
    <article class="feature-card">
      <span class="feature-card__index">02</span>
      <h3>Fields and relationships</h3>
      <p>Choose one field or many, traverse relationships, control ordering, and optionally switch to a custom Flow value.</p>
    </article>
    <article class="feature-card">
      <span class="feature-card__index">03</span>
      <h3>Salesforce objects</h3>
      <p>Discover accessible objects with a focused default list, an all-object toggle, searchable labels, and progressive results.</p>
    </article>
    <article class="feature-card">
      <span class="feature-card__index">04</span>
      <h3>Flow-native contracts</h3>
      <p>Persist exact reference syntax, coordinate generic SObject mappings, dispatch standard configuration events, and report contextual errors.</p>
    </article>
  </div>
</section>

<section class="path-section">
  <div>
    <p class="eyebrow">Choose the right level</p>
    <h2>Declarative first. Imperative when needed.</h2>
  </div>
  <div class="path-grid">
    <article>
      <p class="path-label">Start here</p>
      <h3>Schema-driven editor</h3>
      <p>Declare common String, Number, SObject collection, and dependent field properties. The base class renders and coordinates the complete editor.</p>
      <a href="{{ '/GETTING_STARTED/' | relative_url }}">Build your first editor →</a>
    </article>
    <article>
      <p class="path-label">Extend carefully</p>
      <h3>Composable component API</h3>
      <p>Use individual pickers and inherited methods for migration, reset notices, conditional rules, or other behavior outside the schema.</p>
      <a href="{{ '/COMPONENT_API/' | relative_url }}">Read the public API →</a>
    </article>
  </div>
</section>

<section class="architecture-strip">
  <div>
    <p class="eyebrow">Designed for reuse</p>
    <h2>Consumer editor</h2>
    <p>Owns only its properties and business rules.</p>
  </div>
  <span aria-hidden="true">→</span>
  <div>
    <h2>Framework components</h2>
    <p>Own picker presentation, interaction, events, and validation.</p>
  </div>
  <span aria-hidden="true">→</span>
  <div>
    <h2>Shared services</h2>
    <p>Normalize Flow metadata and cache Salesforce discovery.</p>
  </div>
</section>

<section id="agent-setup" class="agent-section">
  <div class="agent-section__intro">
    <p class="eyebrow">Agent-ready documentation</p>
    <h2>Give your coding agent the complete contract.</h2>
    <p>Start with one purpose-built instruction file. It contains the exact metadata, component APIs, events, value formats, recipes, and constraints an agent needs.</p>
    <a class="button button--primary" href="{{ '/llms.txt' | relative_url }}">Open llms.txt</a>
  </div>
  <div class="agent-paths">
    <article>
      <span>Using the kit</span>
      <h3>Build a Flow editor</h3>
      <p>Point the agent at <code>docs/llms.txt</code>, then describe the screen component and configuration inputs you need.</p>
      <pre><code>Read docs/llms.txt, then add a custom
property editor for my Flow component.</code></pre>
      <a href="https://github.com/RebbePod/flow-config-editor-kit/tree/main/.agents/skills/build-flow-config-editor">Use the consumer skill →</a>
    </article>
    <article>
      <span>Changing the kit</span>
      <h3>Contribute to the framework</h3>
      <p>Start with the repository’s contributor instructions, which route the agent to the right extension, picker-UI, and validation skills.</p>
      <pre><code>Read AGENTS.md and load every skill
relevant to the framework change.</code></pre>
      <a href="https://github.com/RebbePod/flow-config-editor-kit/blob/main/AGENTS.md">Open AGENTS.md →</a>
    </article>
  </div>
</section>

<section class="final-cta">
  <div>
    <p class="eyebrow">Ready to build?</p>
    <h2>Deploy the core. Keep your editor small.</h2>
  </div>
  <div class="button-row">
    <a class="button button--primary" href="{{ '/GETTING_STARTED/' | relative_url }}">Installation guide</a>
    <a class="button button--secondary" href="https://github.com/RebbePod/flow-config-editor-kit/tree/main/examples">View examples</a>
  </div>
</section>
