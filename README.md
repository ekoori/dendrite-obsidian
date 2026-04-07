# Dendrite — AI-Powered Knowledge Mind Mapping for Obsidian

Dendrite turns your Obsidian vault into a living knowledge graph. Each note is a condensed zettel (knowledge card) with AI-suggested expansion directions. Click a suggestion to grow your map — the AI generates contextual content based on everything you've already explored.

## Features

- **Canvas-based mind map** — Uses Obsidian's native Canvas for spatial visualization
- **AI-generated content** — Each zettel gets a subtitle, dense body text, and expansion suggestions via OpenAI
- **Suggestions in frontmatter** — Stored as YAML arrays, accessible from context menus and the expand modal
- **Click-to-create** — Click any `[[unresolved link]]` in a dendrite note to auto-create a new zettel with AI content
- **Context menu integration** — Right-click any node in the file explorer to see suggestions and expand
- **Mission-driven** — A configurable mission statement guides the AI toward holistic, cross-domain connections
- **Works without AI** — Falls back to curated mock suggestions when no API key is configured

## Getting Started

1. Enable the plugin in Settings → Community Plugins
2. (Optional) Add your OpenAI API key in Settings → Dendrite
3. Open the command palette (`Ctrl+P`) and run **Dendrite: Initialize knowledge map**
4. Explore the canvas — click nodes, right-click for suggestions, click `[[links]]` to grow

## Zettel Format

Each note follows a consistent structure:

```yaml
---
title: "Systems Thinking"
subtitle: "Seeing interconnections rather than isolated events."
created: 2026-04-07T10:00:00Z
tags: [dendrite]
suggestions:
  - title: "Feedback Loops"
    subtitle: "How circular causality creates emergent behavior."
  - title: "Leverage Points"
    subtitle: "Where small changes produce large systemic effects."
---

# Systems Thinking

> Seeing interconnections rather than isolated events.

Body text — concise, dense, opinionated. Can include [[wiki-links]] to other nodes,
bullet lists, or multiple paragraphs as the content demands.

## Directions to explore

- [[Feedback Loops]] — How circular causality creates emergent behavior.
- [[Leverage Points]] — Where small changes produce large systemic effects.
```

## Settings

| Setting | Description | Default |
|---------|-------------|---------|
| OpenAI API Key | Your API key for content generation | (empty — mock mode) |
| OpenAI Model | Which model to use | gpt-4.1-mini |
| Root folder | Base folder for all Dendrite files | Dendrite |
| Nodes folder | Subfolder for zettel notes (within root) | Nodes |
| Canvas name | Name of the canvas file (within root) | Knowledge Map |
| Mission | Guiding mission used as LLM context | Grow holistically... |

## Development

```bash
cd dendrite-plugin
npm install --include=dev
npm run dev     # watch mode, outputs to vault plugin folder
npm run build   # production build
```

## License

MIT
