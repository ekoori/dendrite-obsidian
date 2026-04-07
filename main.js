var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// main.ts
var main_exports = {};
__export(main_exports, {
  default: () => DendritePlugin
});
module.exports = __toCommonJS(main_exports);
var import_obsidian2 = require("obsidian");

// types.ts
var DEFAULT_SETTINGS = {
  rootFolder: "Dendrite",
  nodesFolder: "Nodes",
  canvasName: "Knowledge Map",
  mission: "Grow your knowledge and personhood holistically \u2014 from physical to spiritual dimensions.",
  openaiApiKey: "",
  openaiModel: "gpt-5.2"
};
var OPENAI_MODELS = [
  { value: "gpt-5.4", label: "GPT-5.4 (flagship)" },
  { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { value: "gpt-5.4-nano", label: "GPT-5.4 Nano" },
  { value: "gpt-5.2", label: "GPT-5.2 (recommended)" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "gpt-5-nano", label: "GPT-5 Nano" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "gpt-4o", label: "GPT-4o (legacy)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (legacy)" }
];

// data.ts
var MOCK_SUGGESTIONS = {
  "Self-Knowledge": [
    { title: "Habits & Identity", subtitle: "How daily routines sculpt who you become." },
    { title: "Relationships as Mirrors", subtitle: "Other people reveal your blind spots." },
    { title: "The Observer Self", subtitle: "Metacognition \u2014 thinking about your thinking." }
  ],
  "Body Awareness": [
    { title: "Nervous System States", subtitle: "Sympathetic vs parasympathetic \u2014 your body's two operating modes." },
    { title: "Movement as Cognition", subtitle: "Embodied cognition shows thinking isn't just in the head." },
    { title: "Sleep Architecture", subtitle: "The structure of sleep stages and why each matters." }
  ],
  "Mental Models": [
    { title: "First Principles Thinking", subtitle: "Reasoning from fundamentals rather than analogy." },
    { title: "Cognitive Biases", subtitle: "Systematic errors in thinking that everyone shares." },
    { title: "Systems Thinking", subtitle: "Seeing interconnections rather than isolated events." }
  ],
  "Emotional Intelligence": [
    { title: "Affect Labeling", subtitle: "Naming emotions precisely reduces their intensity." },
    { title: "Somatic Markers", subtitle: "How the body stores emotional memory and guides decisions." }
  ],
  "Meaning & Purpose": [
    { title: "Flow States", subtitle: "Optimal experience occurs when challenge matches skill." },
    { title: "Ikigai", subtitle: "The Japanese concept of 'a reason for being' across four dimensions." }
  ]
};
var GENERIC_SUGGESTIONS = [
  { title: "Deeper Mechanisms", subtitle: "What underlying processes drive this phenomenon?" },
  { title: "Practical Applications", subtitle: "How can this knowledge be applied in daily life?" },
  { title: "Cross-Domain Connections", subtitle: "How does this relate to other areas of knowledge?" }
];
function getMockSuggestions(nodeTitle) {
  return MOCK_SUGGESTIONS[nodeTitle] || GENERIC_SUGGESTIONS;
}
var SEED_NODES = [
  {
    title: "Self-Knowledge",
    subtitle: "Understanding yourself is the foundation of all growth.",
    body: "Self-knowledge spans multiple dimensions: your body's signals, your mind's patterns, your emotional landscape, and your sense of meaning. Each domain feeds the others.",
    suggestions: MOCK_SUGGESTIONS["Self-Knowledge"],
    x: 0,
    y: 0
  },
  {
    title: "Body Awareness",
    subtitle: "Your body is your primary instrument of perception.",
    body: "Interoception \u2014 sensing internal states like heartbeat, breath, and gut feelings \u2014 is a core component of emotional regulation and decision-making.",
    suggestions: MOCK_SUGGESTIONS["Body Awareness"],
    x: -400,
    y: -300
  },
  {
    title: "Mental Models",
    subtitle: "The frameworks you interpret reality with shape what you can see.",
    body: "Mental models are cognitive lenses. The danger is mistaking the map for the territory: every model highlights some truths while hiding others.",
    suggestions: MOCK_SUGGESTIONS["Mental Models"],
    x: 400,
    y: -300
  },
  {
    title: "Emotional Intelligence",
    subtitle: "Emotions are data, not noise \u2014 reading them is a skill.",
    body: "Four capacities: perceiving emotions accurately, using them to facilitate thought, understanding emotional dynamics, and managing them skillfully. Trainable at any age.",
    suggestions: MOCK_SUGGESTIONS["Emotional Intelligence"],
    x: -400,
    y: 300
  },
  {
    title: "Meaning & Purpose",
    subtitle: "Purpose isn't found \u2014 it's constructed through engagement.",
    body: "Frankl identified three sources: creative work (what you give), experiential richness (what you take), and attitudinal choice (the stance toward suffering).",
    suggestions: MOCK_SUGGESTIONS["Meaning & Purpose"],
    x: 400,
    y: 300
  }
];
var SEED_EDGES = [[0, 1], [0, 2], [0, 3], [0, 4], [1, 3], [2, 4]];

// openai.ts
var import_obsidian = require("obsidian");

// prompts/generate-suggestions.md
var generate_suggestions_default = '# Generate Suggestions\r\n\r\nYou are Dendrite, a knowledge expansion assistant embedded in an Obsidian vault.\r\n\r\n## Context\r\n\r\nMission: {{mission}}\r\n\r\nExisting nodes:\r\n{{existing_nodes}}\r\n\r\n## Task\r\n\r\nGenerate 3-5 new expansion suggestions for: **{{node_label}}**\r\n\r\nCurrent node content:\r\n{{node_content}}\r\n\r\n## Requirements\r\n\r\n- Each suggestion needs a short title (2-5 words) and a one-sentence subtitle.\r\n- Must be meaningfully different from existing nodes in the map.\r\n- Connect to the parent concept in non-obvious but valuable ways.\r\n- Consider the mission for cross-domain connections.\r\n- Titles should work as Obsidian note names (no special characters like / or :).\r\n\r\n## Output Format\r\n\r\nReturn ONLY a JSON array:\r\n```json\r\n[\r\n  {"title": "Short Title", "subtitle": "One sentence explaining this direction."}\r\n]\r\n```\r\n';

// prompts/generate-zettel.md
var generate_zettel_default = '# Generate Zettel\r\n\r\nYou are Dendrite, a knowledge expansion assistant embedded in an Obsidian vault.\r\n\r\n## Context\r\n\r\nMission: {{mission}}\r\n\r\nExisting nodes in the knowledge map:\r\n{{existing_nodes}}\r\n\r\n## Task\r\n\r\nCreate a zettel (knowledge card) for: **{{node_label}}**\r\nParent node: **{{parent_label}}**\r\nContext: {{suggestion_summary}}\r\n\r\n## Requirements\r\n\r\n### Subtitle\r\nOne sentence (max 15 words) capturing the core insight.\r\n\r\n### Body\r\nWrite concise, dense content. This is a zettelkasten card, not an encyclopedia entry.\r\n- Default to 2-3 sentences of insight.\r\n- If the topic benefits from structure, use a short bullet list instead.\r\n- Use newlines between paragraphs for readability.\r\n- Reference connections to existing nodes using Obsidian wiki-links: [[Node Title]].\r\n- Be opinionated and useful, not encyclopedic.\r\n\r\n### Suggestions\r\nGenerate 3-5 directions this concept could expand into.\r\n- Each needs a short title (2-5 words) and a one-sentence subtitle.\r\n- Must be meaningfully different from existing nodes.\r\n- Consider the mission for cross-domain connections.\r\n- Titles should work as Obsidian note names (no special characters like / or :).\r\n\r\n## Output Format\r\n\r\nReturn ONLY a JSON object:\r\n```json\r\n{\r\n  "subtitle": "Core insight in one sentence.",\r\n  "body": "Dense content.\\n\\nCan have multiple paragraphs.\\n\\n- Or bullet lists if appropriate.",\r\n  "suggestions": [\r\n    {"title": "Short Title", "subtitle": "One sentence explaining this direction."}\r\n  ]\r\n}\r\n```\r\n';

// openai.ts
function fillTemplate(template, vars) {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}
function nodesBasePath(settings) {
  return settings.rootFolder ? `${settings.rootFolder}/${settings.nodesFolder}` : settings.nodesFolder;
}
async function gatherMapContext(app, settings) {
  const base = nodesBasePath(settings);
  const files = app.vault.getMarkdownFiles().filter((f) => f.path.startsWith(base + "/"));
  if (files.length === 0) return "(empty map)";
  const summaries = [];
  for (const file of files) {
    const content = await app.vault.read(file);
    const m = content.match(/^>\s*(.+)$/m);
    summaries.push(`- ${file.basename}: ${m ? m[1] : "(no summary)"}`);
  }
  return summaries.join("\n");
}
async function getNodeContent(app, settings, title) {
  const base = nodesBasePath(settings);
  const path = `${base}/${title}.md`;
  const file = app.vault.getAbstractFileByPath(path);
  if (file instanceof import_obsidian.TFile) return await app.vault.read(file);
  return "";
}
var NEW_PARAM_MODELS = ["gpt-4.1", "gpt-5", "gpt-5."];
function usesNewTokenParam(model) {
  return NEW_PARAM_MODELS.some((m) => model.startsWith(m));
}
async function callOpenAI(apiKey, model, prompt) {
  var _a, _b, _c, _d, _e;
  const key = apiKey.trim();
  if (!key) throw new Error("No OpenAI API key configured");
  const body = { model, messages: [{ role: "user", content: prompt }], temperature: 0.8 };
  if (usesNewTokenParam(model)) body.max_completion_tokens = 2e3;
  else body.max_tokens = 2e3;
  let response;
  try {
    response = await (0, import_obsidian.requestUrl)({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      contentType: "application/json",
      headers: { "Authorization": `Bearer ${key}` },
      body: JSON.stringify(body),
      throw: false
    });
  } catch (err) {
    throw new Error(`Network error: ${err.message || err}`);
  }
  if (response.status === 401) throw new Error("Invalid API key (401). Check Dendrite settings.");
  if (response.status === 404) throw new Error(`Model "${model}" not found (404).`);
  if (response.status === 429) throw new Error("Rate limit (429). Wait and retry.");
  if (response.status !== 200) throw new Error(`OpenAI error (${response.status}): ${(response.text || "").substring(0, 300)}`);
  const content = (_e = (_d = (_c = (_b = (_a = response.json) == null ? void 0 : _a.choices) == null ? void 0 : _b[0]) == null ? void 0 : _c.message) == null ? void 0 : _d.content) == null ? void 0 : _e.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}
function parseJSON(raw) {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try {
    return JSON.parse(cleaned);
  } catch (e) {
  }
  const m = cleaned.match(/[\[{][\s\S]*[\]}]/);
  if (m) {
    try {
      return JSON.parse(m[0]);
    } catch (e) {
    }
  }
  return null;
}
async function generateZettelAI(app, settings, nodeTitle, parentTitle, suggestionSubtitle) {
  const existingNodes = await gatherMapContext(app, settings);
  const prompt = fillTemplate(generate_zettel_default, {
    mission: settings.mission,
    existing_nodes: existingNodes,
    node_label: nodeTitle,
    parent_label: parentTitle || "(root)",
    suggestion_summary: suggestionSubtitle || "(initial creation)"
  });
  const raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
  const parsed = parseJSON(raw);
  if (!parsed || !parsed.subtitle) throw new Error("Failed to parse zettel from OpenAI");
  const suggestions = (parsed.suggestions || []).filter((s) => s.title && s.subtitle).map((s) => ({ title: String(s.title), subtitle: String(s.subtitle) }));
  return { subtitle: String(parsed.subtitle), body: String(parsed.body || ""), suggestions };
}
async function generateSuggestionsAI(app, settings, nodeTitle) {
  const existingNodes = await gatherMapContext(app, settings);
  const nodeContent = await getNodeContent(app, settings, nodeTitle);
  const prompt = fillTemplate(generate_suggestions_default, {
    mission: settings.mission,
    existing_nodes: existingNodes,
    node_label: nodeTitle,
    node_content: nodeContent || "(no content yet)"
  });
  const raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
  const parsed = parseJSON(raw);
  if (!parsed || !Array.isArray(parsed)) throw new Error("Failed to parse suggestions from OpenAI");
  return parsed.filter((s) => s.title && s.subtitle).map((s) => ({ title: String(s.title), subtitle: String(s.subtitle) }));
}

// main.ts
function generateId() {
  return Math.random().toString(36).substring(2, 18);
}
function parseSuggestionsFromFrontmatter(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];
  const sugMatch = fm.match(/suggestions:\n((?:\s+-[\s\S]*?)*)(?=\n\w|\n---|\s*$)/);
  if (!sugMatch) return [];
  const suggestions = [];
  const items = sugMatch[1].split(/\n\s+-\s+/).filter((s) => s.trim());
  for (const item of items) {
    const clean = item.replace(/^-\s+/, "").trim();
    const tMatch = clean.match(/title:\s*"([^"]+)"/);
    const sMatch = clean.match(/subtitle:\s*"([^"]+)"/);
    if (tMatch && sMatch) suggestions.push({ title: tMatch[1], subtitle: sMatch[1] });
  }
  return suggestions;
}
function hasDendriteTag(content) {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return false;
  return fmMatch[1].includes("dendrite");
}
function buildZettelContent(title, subtitle, body, suggestions) {
  const esc = (s) => s.replace(/"/g, '\\"');
  const sugYaml = suggestions.map(
    (s) => `  - title: "${esc(s.title)}"
    subtitle: "${esc(s.subtitle)}"`
  ).join("\n");
  const lines = [
    "---",
    `title: "${esc(title)}"`,
    `subtitle: "${esc(subtitle)}"`,
    `created: ${(/* @__PURE__ */ new Date()).toISOString()}`,
    "tags: [dendrite]",
    suggestions.length > 0 ? `suggestions:
${sugYaml}` : "suggestions: []",
    "---",
    "",
    `# ${title}`,
    "",
    `> ${subtitle}`,
    ""
  ];
  if (body) lines.push(body, "");
  if (suggestions.length > 0) {
    lines.push("## Directions to explore", "");
    for (const s of suggestions) lines.push(`- [[${s.title}]] \u2014 ${s.subtitle}`);
    lines.push("");
  }
  return lines.join("\n");
}
function updateFrontmatterSuggestions(content, newSuggestions) {
  const esc = (s) => s.replace(/"/g, '\\"');
  const sugYaml = newSuggestions.map(
    (s) => `  - title: "${esc(s.title)}"
    subtitle: "${esc(s.subtitle)}"`
  ).join("\n");
  if (content.match(/suggestions:\n(?:\s+-[\s\S]*?)(?=\n\w|\n---)/)) {
    return content.replace(/suggestions:\n(?:\s+-[\s\S]*?)(?=\n---)/, `suggestions:
${sugYaml}
`);
  }
  if (content.match(/suggestions:\s*\[\]/)) {
    return content.replace(/suggestions:\s*\[\]/, `suggestions:
${sugYaml}`);
  }
  return content.replace(/\n---\n/, `
suggestions:
${sugYaml}
---
`);
}
function rebuildDirections(content, suggestions) {
  let c = content.replace(/\n## Directions to explore\n[\s\S]*$/, "").trimEnd();
  if (suggestions.length > 0) {
    c += "\n\n## Directions to explore\n\n";
    for (const s of suggestions) c += `- [[${s.title}]] \u2014 ${s.subtitle}
`;
  }
  return c + "\n";
}
var SuggestionModal = class extends import_obsidian2.Modal {
  constructor(app, nodeTitle, plugin, onChoose) {
    super(app);
    this.listEl = null;
    this.nodeTitle = nodeTitle;
    this.plugin = plugin;
    this.onChoose = onChoose;
  }
  async onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("dendrite-modal");
    contentEl.createEl("h2", { text: `Expand: ${this.nodeTitle}` });
    this.listEl = contentEl.createDiv({ cls: "dendrite-suggestions" });
    const existingSugs = await this.plugin.getExistingSuggestions(this.nodeTitle);
    if (existingSugs.length > 0) {
      for (const s of existingSugs) this.addSuggestionBtn(s);
    } else {
      this.listEl.createDiv({ cls: "dendrite-loading", text: "No existing suggestions." });
    }
    const actionsDiv = contentEl.createDiv({ cls: "dendrite-actions" });
    if (this.plugin.hasApiKey) {
      const genBtn = actionsDiv.createEl("button", { text: "\u2728 Generate new AI suggestions", cls: "dendrite-action-btn" });
      genBtn.addEventListener("click", async () => {
        genBtn.disabled = true;
        genBtn.setText("Generating...");
        try {
          const newSugs = await generateSuggestionsAI(this.plugin.app, this.plugin.settings, this.nodeTitle);
          await this.plugin.mergeSuggestionsIntoFile(this.nodeTitle, newSugs);
          for (const s of newSugs) {
            if (!existingSugs.some((e) => e.title.toLowerCase() === s.title.toLowerCase())) {
              this.addSuggestionBtn(s);
              existingSugs.push(s);
            }
          }
          genBtn.setText("\u2728 Generate more");
        } catch (err) {
          genBtn.setText(`Error: ${err.message}`);
        }
        genBtn.disabled = false;
      });
    }
    const customDiv = contentEl.createDiv({ cls: "dendrite-custom" });
    customDiv.createEl("label", { text: "Or write your own direction:" });
    const input = customDiv.createEl("input", { type: "text", placeholder: "e.g. How does this connect to meditation?" });
    input.addClass("dendrite-custom-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        this.onChoose({ title: input.value.trim(), subtitle: "User-directed exploration." });
        this.close();
      }
    });
  }
  addSuggestionBtn(s) {
    if (!this.listEl) return;
    const loading = this.listEl.querySelector(".dendrite-loading");
    if (loading) loading.remove();
    const btn = this.listEl.createDiv({ cls: "dendrite-suggestion" });
    btn.createEl("strong", { text: `+ ${s.title}` });
    btn.createEl("span", { text: s.subtitle });
    btn.addEventListener("click", () => {
      this.onChoose(s);
      this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var CustomDirectionModal = class extends import_obsidian2.Modal {
  constructor(app, nodeTitle, onSubmit) {
    super(app);
    this.nodeTitle = nodeTitle;
    this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("dendrite-modal");
    contentEl.createEl("h3", { text: `Custom direction from "${this.nodeTitle}"` });
    const input = contentEl.createEl("input", { type: "text", placeholder: "Type and press Enter..." });
    input.addClass("dendrite-custom-input");
    input.style.width = "100%";
    input.style.marginTop = "8px";
    input.focus();
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        this.onSubmit({ title: input.value.trim(), subtitle: "User-directed exploration." });
        this.close();
      }
      if (e.key === "Escape") this.close();
    });
  }
  onClose() {
    this.contentEl.empty();
  }
};
var NodePickerModal = class extends import_obsidian2.Modal {
  constructor(app, nodes, plugin, onPick) {
    super(app);
    this.nodes = nodes;
    this.plugin = plugin;
    this.onPick = onPick;
  }
  onOpen() {
    const { contentEl } = this;
    contentEl.empty();
    contentEl.addClass("dendrite-modal");
    contentEl.createEl("h2", { text: "Choose a node to expand" });
    const listEl = contentEl.createDiv({ cls: "dendrite-suggestions" });
    for (const node of this.nodes) {
      const t = this.plugin.getNodeTitle(node);
      const btn = listEl.createDiv({ cls: "dendrite-suggestion" });
      btn.createEl("strong", { text: t });
      btn.addEventListener("click", () => {
        this.onPick(node);
        this.close();
      });
    }
  }
  onClose() {
    this.contentEl.empty();
  }
};
var DendritePlugin = class extends import_obsidian2.Plugin {
  constructor() {
    super(...arguments);
    this.settings = DEFAULT_SETTINGS;
    this.suggestionsCache = /* @__PURE__ */ new Map();
  }
  get hasApiKey() {
    var _a;
    return !!((_a = this.settings.openaiApiKey) == null ? void 0 : _a.trim());
  }
  get nodesBasePath() {
    return this.settings.rootFolder ? `${this.settings.rootFolder}/${this.settings.nodesFolder}` : this.settings.nodesFolder;
  }
  get canvasPath() {
    return this.settings.rootFolder ? `${this.settings.rootFolder}/${this.settings.canvasName}.canvas` : `${this.settings.canvasName}.canvas`;
  }
  notePath(title) {
    return `${this.nodesBasePath}/${title}.md`;
  }
  async onload() {
    await this.loadSettings();
    this.addCommand({ id: "dendrite-init", name: "Initialize knowledge map", callback: () => this.initializeMap() });
    this.addCommand({ id: "dendrite-expand", name: "Expand selected node", callback: () => this.expandSelectedNode() });
    this.addRibbonIcon("brain", "Dendrite: Expand node", () => this.expandSelectedNode());
    this.addSettingTab(new DendriteSettingTab(this.app, this));
    this.registerEvent(this.app.vault.on("modify", (file) => {
      if (file instanceof import_obsidian2.TFile && file.path.startsWith(this.nodesBasePath + "/")) {
        this.cacheSuggestionsForFile(file);
      }
    }));
    this.app.workspace.onLayoutReady(() => this.cacheAllSuggestions());
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, file) => {
        if (!(file instanceof import_obsidian2.TFile) || file.extension !== "md") return;
        if (!file.path.startsWith(this.nodesBasePath + "/")) return;
        const title = file.basename;
        const cached = this.suggestionsCache.get(file.path) || [];
        menu.addItem((item) => {
          item.setTitle("Dendrite: Expand node").setIcon("brain");
          const submenu = item.setSubmenu();
          if (cached.length > 0) {
            for (const s of cached) {
              submenu.addItem((sub) => {
                sub.setTitle(`${s.title} \u2014 ${s.subtitle}`).onClick(() => this.handleSuggestionClick(file, s));
              });
            }
            submenu.addSeparator();
          }
          submenu.addItem((sub) => {
            sub.setTitle("\u2728 Generate new AI suggestions...").setIcon("sparkles").onClick(() => this.expandNodeByFile(file));
          });
          submenu.addItem((sub) => {
            sub.setTitle("\u270E Write your own direction...").onClick(() => new CustomDirectionModal(this.app, title, (chosen) => this.handleSuggestionClick(file, chosen)).open());
          });
        });
      })
    );
    this.registerEvent(
      this.app.vault.on("create", async (file) => {
        if (!(file instanceof import_obsidian2.TFile) || file.extension !== "md") return;
        await new Promise((r) => setTimeout(r, 300));
        let content;
        try {
          content = await this.app.vault.read(file);
        } catch (e) {
          return;
        }
        if (content.trim().length > 0) return;
        const title = file.basename;
        let parentTitle = "";
        let isLinkedFromDendrite = false;
        for (const f of this.app.vault.getMarkdownFiles()) {
          if (f.path === file.path) continue;
          if (!f.path.startsWith(this.nodesBasePath + "/")) continue;
          try {
            const c = await this.app.vault.read(f);
            if (!hasDendriteTag(c)) continue;
            if (c.includes(`[[${title}]]`)) {
              parentTitle = f.basename;
              isLinkedFromDendrite = true;
              break;
            }
          } catch (e) {
            continue;
          }
        }
        if (!isLinkedFromDendrite && !file.path.startsWith(this.nodesBasePath + "/")) return;
        let targetFile = file;
        if (!file.path.startsWith(this.nodesBasePath + "/")) {
          const targetPath = this.notePath(title);
          if (!this.app.vault.getAbstractFileByPath(targetPath)) {
            const folder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
            if (!folder) await this.app.vault.createFolder(this.nodesBasePath);
            await this.app.fileManager.renameFile(file, targetPath);
            const moved = this.app.vault.getAbstractFileByPath(targetPath);
            if (!(moved instanceof import_obsidian2.TFile)) return;
            targetFile = moved;
          }
        }
        try {
          if (this.hasApiKey) {
            new import_obsidian2.Notice(`Dendrite: Generating "${title}"...`);
            const zettel = await generateZettelAI(this.app, this.settings, title, parentTitle, "");
            await this.app.vault.modify(targetFile, buildZettelContent(title, zettel.subtitle, zettel.body, zettel.suggestions));
          } else {
            await this.app.vault.modify(targetFile, buildZettelContent(title, `Expand on: ${title}`, "", getMockSuggestions(title)));
          }
        } catch (err) {
          new import_obsidian2.Notice(`Dendrite: AI error \u2014 ${err.message}`);
          await this.app.vault.modify(targetFile, buildZettelContent(title, `Expand on: ${title}`, "", getMockSuggestions(title)));
        }
        await this.addFileToCanvasIfMissing(targetFile, title);
        this.cacheSuggestionsForFile(targetFile);
        new import_obsidian2.Notice(`Dendrite: Created "${title}".`);
      })
    );
  }
  onunload() {
    this.suggestionsCache.clear();
  }
  // ─── Suggestions Cache ─────────────────────────────────────────
  async cacheAllSuggestions() {
    for (const file of this.app.vault.getMarkdownFiles()) {
      if (!file.path.startsWith(this.nodesBasePath + "/")) continue;
      await this.cacheSuggestionsForFile(file);
    }
  }
  async cacheSuggestionsForFile(file) {
    try {
      const content = await this.app.vault.read(file);
      this.suggestionsCache.set(file.path, parseSuggestionsFromFrontmatter(content));
    } catch (e) {
    }
  }
  async getExistingSuggestions(nodeTitle) {
    const path = this.notePath(nodeTitle);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian2.TFile)) return [];
    const content = await this.app.vault.read(file);
    return parseSuggestionsFromFrontmatter(content);
  }
  async mergeSuggestionsIntoFile(nodeTitle, newSugs) {
    const path = this.notePath(nodeTitle);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof import_obsidian2.TFile)) return;
    let content = await this.app.vault.read(file);
    const existing = parseSuggestionsFromFrontmatter(content);
    const existingTitles = new Set(existing.map((s) => s.title.toLowerCase()));
    const merged = [...existing];
    for (const s of newSugs) {
      if (!existingTitles.has(s.title.toLowerCase())) merged.push(s);
    }
    content = updateFrontmatterSuggestions(content, merged);
    content = rebuildDirections(content, merged);
    await this.app.vault.modify(file, content);
    this.suggestionsCache.set(file.path, merged);
  }
  // ─── Actions ───────────────────────────────────────────────────
  async handleSuggestionClick(file, suggestion) {
    const result = await this.readCanvas();
    if (!result) return;
    const node = result.data.nodes.find((n) => n.type === "file" && n.file === file.path);
    if (node) await this.addNodeToCanvas(node, suggestion, result.file, result.data);
    else await this.createAndAddOrphan(file, suggestion);
  }
  async expandNodeByFile(file) {
    new SuggestionModal(this.app, file.basename, this, async (chosen) => {
      const r = await this.readCanvas();
      if (!r) return;
      const fn = r.data.nodes.find((n) => n.type === "file" && n.file === file.path);
      if (fn) await this.addNodeToCanvas(fn, chosen, r.file, r.data);
      else await this.createAndAddOrphan(file, chosen);
    }).open();
  }
  async expandSelectedNode() {
    const r = await this.readCanvas();
    if (!r) return;
    const an = this.findActiveNodeInCanvas(r.data);
    if (!an) {
      new NodePickerModal(this.app, r.data.nodes, this, (n) => this.showSuggestionsForNode(n, r.file, r.data)).open();
      return;
    }
    this.showSuggestionsForNode(an, r.file, r.data);
  }
  showSuggestionsForNode(node, cf, cd) {
    new SuggestionModal(this.app, this.getNodeTitle(node), this, async (chosen) => {
      await this.addNodeToCanvas(node, chosen, cf, cd);
    }).open();
  }
  // ─── Settings ──────────────────────────────────────────────────
  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }
  async saveSettings() {
    await this.saveData(this.settings);
  }
  // ─── Zettel CRUD ───────────────────────────────────────────────
  async createZettel(title, subtitle, body, suggestions, parentTitle) {
    const path = this.notePath(title);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof import_obsidian2.TFile) return existing;
    const folder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
    if (!folder) await this.app.vault.createFolder(this.nodesBasePath);
    let finalSub = subtitle, finalBody = body, sugs = suggestions;
    try {
      if (this.hasApiKey && parentTitle) {
        const z = await generateZettelAI(this.app, this.settings, title, parentTitle, subtitle);
        finalSub = z.subtitle;
        finalBody = z.body;
        sugs = z.suggestions;
      }
    } catch (e) {
    }
    const file = await this.app.vault.create(path, buildZettelContent(title, finalSub, finalBody, sugs));
    this.suggestionsCache.set(path, sugs);
    return file;
  }
  // ─── Canvas Operations ─────────────────────────────────────────
  async initializeMap() {
    if (this.settings.rootFolder) {
      const root = this.app.vault.getAbstractFileByPath(this.settings.rootFolder);
      if (!root) await this.app.vault.createFolder(this.settings.rootFolder);
    }
    const nodesFolder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
    if (!nodesFolder) await this.app.vault.createFolder(this.nodesBasePath);
    const existing = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (existing) {
      new import_obsidian2.Notice("Map exists. Opening.");
      await this.app.workspace.openLinkText(this.canvasPath, "", false);
      return;
    }
    new import_obsidian2.Notice("Dendrite: Creating knowledge map...");
    const nodeIds = [], canvasNodes = [];
    for (const seed of SEED_NODES) {
      const path = this.notePath(seed.title);
      if (!(this.app.vault.getAbstractFileByPath(path) instanceof import_obsidian2.TFile)) {
        let sugs = seed.suggestions;
        try {
          if (this.hasApiKey) {
            const z = await generateZettelAI(this.app, this.settings, seed.title, "", seed.subtitle);
            sugs = z.suggestions;
          }
        } catch (e) {
        }
        await this.app.vault.create(path, buildZettelContent(seed.title, seed.subtitle, seed.body, sugs));
        this.suggestionsCache.set(path, sugs);
      }
      const id = generateId();
      nodeIds.push(id);
      canvasNodes.push({ id, type: "file", file: this.notePath(seed.title), x: seed.x, y: seed.y, width: 300, height: 200 });
    }
    const edges = SEED_EDGES.map(([f, t]) => ({
      id: generateId(),
      fromNode: nodeIds[f],
      toNode: nodeIds[t],
      fromSide: "bottom",
      toSide: "top"
    }));
    await this.app.vault.create(this.canvasPath, JSON.stringify({ nodes: canvasNodes, edges }, null, 2));
    new import_obsidian2.Notice("Dendrite: Map created!");
    await this.app.workspace.openLinkText(this.canvasPath, "", false);
  }
  async readCanvas() {
    const file = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (!(file instanceof import_obsidian2.TFile)) {
      new import_obsidian2.Notice("No map. Run 'Initialize knowledge map'.");
      return null;
    }
    return { file, data: JSON.parse(await this.app.vault.read(file)) };
  }
  async writeCanvas(file, data) {
    await this.app.vault.modify(file, JSON.stringify(data, null, 2));
  }
  async addFileToCanvasIfMissing(file, title) {
    const result = await this.readCanvas();
    if (!result) return;
    const { file: cf, data } = result;
    if (data.nodes.some((n) => n.type === "file" && n.file === file.path)) return;
    let pn = null;
    for (const node of data.nodes) {
      if (node.type !== "file" || !node.file) continue;
      const nf = this.app.vault.getAbstractFileByPath(node.file);
      if (nf instanceof import_obsidian2.TFile) {
        try {
          if ((await this.app.vault.read(nf)).includes(`[[${title}]]`)) {
            pn = node;
            break;
          }
        } catch (e) {
        }
      }
    }
    const bx = pn ? pn.x : Math.random() * 800 - 400;
    const by = pn ? pn.y : Math.random() * 600 - 300;
    const a = Math.random() * Math.PI * 2, d = 350 + Math.random() * 100, nid = generateId();
    data.nodes.push({
      id: nid,
      type: "file",
      file: file.path,
      x: Math.round(bx + Math.cos(a) * d),
      y: Math.round(by + Math.sin(a) * d),
      width: 300,
      height: 200
    });
    if (pn) data.edges.push({ id: generateId(), fromNode: pn.id, toNode: nid, fromSide: "bottom", toSide: "top" });
    await this.writeCanvas(cf, data);
  }
  async addNodeToCanvas(pn, s, cf, cd) {
    const pt = this.getNodeTitle(pn);
    new import_obsidian2.Notice(`Dendrite: Creating "${s.title}"...`);
    await this.createZettel(s.title, s.subtitle, "", getMockSuggestions(s.title), pt);
    const a = Math.random() * Math.PI * 2, d = 350 + Math.random() * 100, nid = generateId();
    cd.nodes.push({
      id: nid,
      type: "file",
      file: this.notePath(s.title),
      x: Math.round(pn.x + Math.cos(a) * d),
      y: Math.round(pn.y + Math.sin(a) * d),
      width: 300,
      height: 200
    });
    cd.edges.push({ id: generateId(), fromNode: pn.id, toNode: nid, fromSide: "bottom", toSide: "top" });
    await this.writeCanvas(cf, cd);
    new import_obsidian2.Notice(`Added "${s.title}"!`);
    await this.app.workspace.openLinkText(this.notePath(s.title), "", false);
  }
  async createAndAddOrphan(file, s) {
    const r = await this.readCanvas();
    if (!r) return;
    await this.addNodeToCanvas(
      { id: "orphan", type: "file", file: file.path, x: 0, y: 0, width: 300, height: 200 },
      s,
      r.file,
      r.data
    );
  }
  // ─── Helpers ───────────────────────────────────────────────────
  getNodeTitle(node) {
    var _a;
    if (node.type === "file" && node.file) return ((_a = node.file.split("/").pop()) == null ? void 0 : _a.replace(".md", "")) || "Unknown";
    if (node.type === "text" && node.text) return node.text.split("\n")[0].replace(/^#+ /, "");
    return "Unknown";
  }
  findActiveNodeInCanvas(data) {
    const af = this.app.workspace.getActiveFile();
    if (!af) return null;
    for (const n of data.nodes) {
      if (n.type === "file" && n.file === af.path) return n;
    }
    if (af.path === this.canvasPath && data.nodes.length > 0) return data.nodes[0];
    return null;
  }
};
var DendriteSettingTab = class extends import_obsidian2.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("dendrite-settings");
    containerEl.createEl("h2", { text: "Dendrite" });
    containerEl.createEl("p", { text: "AI-powered knowledge mind mapping for Obsidian.", cls: "dendrite-settings-subtitle" });
    containerEl.createEl("h3", { text: "AI Configuration" });
    new import_obsidian2.Setting(containerEl).setName("OpenAI API Key").setDesc("Your OpenAI API key for generating content and suggestions. Leave empty to use built-in mock suggestions.").addText((t) => {
      t.inputEl.type = "password";
      t.inputEl.style.width = "300px";
      t.setPlaceholder("sk-proj-...").setValue(this.plugin.settings.openaiApiKey).onChange(async (v) => {
        this.plugin.settings.openaiApiKey = v;
        await this.plugin.saveSettings();
      });
    });
    new import_obsidian2.Setting(containerEl).setName("OpenAI Model").setDesc("Which model to use. GPT-5.2 is recommended as default. GPT-5.4 for highest quality.").addDropdown((d) => {
      for (const m of OPENAI_MODELS) d.addOption(m.value, m.label);
      d.setValue(this.plugin.settings.openaiModel).onChange(async (v) => {
        this.plugin.settings.openaiModel = v;
        await this.plugin.saveSettings();
      });
    });
    containerEl.createEl("h3", { text: "Folder Structure" });
    new import_obsidian2.Setting(containerEl).setName("Root folder").setDesc("Base folder for all Dendrite files. Canvas and Nodes folder live inside this. Leave empty for vault root.").addText((t) => t.setPlaceholder("Dendrite").setValue(this.plugin.settings.rootFolder).onChange(async (v) => {
      this.plugin.settings.rootFolder = v;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Nodes subfolder").setDesc("Where zettel notes are stored (inside the root folder).").addText((t) => t.setPlaceholder("Nodes").setValue(this.plugin.settings.nodesFolder).onChange(async (v) => {
      this.plugin.settings.nodesFolder = v;
      await this.plugin.saveSettings();
    }));
    new import_obsidian2.Setting(containerEl).setName("Canvas name").setDesc("Name of the canvas file (inside the root folder).").addText((t) => t.setPlaceholder("Knowledge Map").setValue(this.plugin.settings.canvasName).onChange(async (v) => {
      this.plugin.settings.canvasName = v;
      await this.plugin.saveSettings();
    }));
    containerEl.createEl("h3", { text: "Knowledge Map" });
    const missionSetting = new import_obsidian2.Setting(containerEl).setName("Mission statement").setDesc("The guiding mission for your knowledge map. The AI uses this to suggest meaningful, cross-domain connections.");
    missionSetting.addTextArea((t) => {
      t.setPlaceholder("e.g. Grow my understanding of systems thinking across technology, biology, and philosophy...").setValue(this.plugin.settings.mission).onChange(async (v) => {
        this.plugin.settings.mission = v;
        await this.plugin.saveSettings();
      });
      t.inputEl.rows = 4;
      t.inputEl.style.width = "100%";
      t.inputEl.style.minHeight = "100px";
      t.inputEl.style.resize = "vertical";
    });
    missionSetting.settingEl.style.flexDirection = "column";
    missionSetting.settingEl.style.alignItems = "flex-start";
    missionSetting.settingEl.style.gap = "8px";
    const missionControl = missionSetting.settingEl.querySelector(".setting-item-control");
    if (missionControl) {
      missionControl.style.width = "100%";
    }
  }
};
