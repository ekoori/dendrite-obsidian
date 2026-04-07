import {
  App, Menu, MenuItem, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile, TAbstractFile,
} from "obsidian";
import {
  CanvasNode, CanvasEdge, CanvasData, Suggestion, DendriteSettings, DEFAULT_SETTINGS, OPENAI_MODELS,
} from "./types";
import { getMockSuggestions, SEED_NODES, SEED_EDGES } from "./data";
import { generateSuggestionsAI, generateZettelAI } from "./openai";

function generateId(): string { return Math.random().toString(36).substring(2, 18); }

// ═══════════════════════════════════════════════════════════════════
// Frontmatter Helpers
// ═══════════════════════════════════════════════════════════════════

function parseSuggestionsFromFrontmatter(content: string): Suggestion[] {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];
  const sugMatch = fm.match(/suggestions:\n((?:\s+-[\s\S]*?)*)(?=\n\w|\n---|\s*$)/);
  if (!sugMatch) return [];
  const suggestions: Suggestion[] = [];
  const items = sugMatch[1].split(/\n\s+-\s+/).filter(s => s.trim());
  for (const item of items) {
    const clean = item.replace(/^-\s+/, "").trim();
    const tMatch = clean.match(/title:\s*"([^"]+)"/);
    const sMatch = clean.match(/subtitle:\s*"([^"]+)"/);
    if (tMatch && sMatch) suggestions.push({ title: tMatch[1], subtitle: sMatch[1] });
  }
  return suggestions;
}

function hasDendriteTag(content: string): boolean {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return false;
  return fmMatch[1].includes("dendrite");
}

function buildZettelContent(title: string, subtitle: string, body: string, suggestions: Suggestion[]): string {
  const esc = (s: string) => s.replace(/"/g, '\\"');
  const sugYaml = suggestions.map(s =>
    `  - title: "${esc(s.title)}"\n    subtitle: "${esc(s.subtitle)}"`
  ).join("\n");
  const lines: string[] = [
    "---",
    `title: "${esc(title)}"`,
    `subtitle: "${esc(subtitle)}"`,
    `created: ${new Date().toISOString()}`,
    "tags: [dendrite]",
    suggestions.length > 0 ? `suggestions:\n${sugYaml}` : "suggestions: []",
    "---", "", `# ${title}`, "", `> ${subtitle}`, "",
  ];
  if (body) lines.push(body, "");
  if (suggestions.length > 0) {
    lines.push("## Directions to explore", "");
    for (const s of suggestions) lines.push(`- [[${s.title}]] — ${s.subtitle}`);
    lines.push("");
  }
  return lines.join("\n");
}

function updateFrontmatterSuggestions(content: string, newSuggestions: Suggestion[]): string {
  const esc = (s: string) => s.replace(/"/g, '\\"');
  const sugYaml = newSuggestions.map(s =>
    `  - title: "${esc(s.title)}"\n    subtitle: "${esc(s.subtitle)}"`
  ).join("\n");
  if (content.match(/suggestions:\n(?:\s+-[\s\S]*?)(?=\n\w|\n---)/)) {
    return content.replace(/suggestions:\n(?:\s+-[\s\S]*?)(?=\n---)/,`suggestions:\n${sugYaml}\n`);
  }
  if (content.match(/suggestions:\s*\[\]/)) {
    return content.replace(/suggestions:\s*\[\]/, `suggestions:\n${sugYaml}`);
  }
  return content.replace(/\n---\n/, `\nsuggestions:\n${sugYaml}\n---\n`);
}

function rebuildDirections(content: string, suggestions: Suggestion[]): string {
  let c = content.replace(/\n## Directions to explore\n[\s\S]*$/, "").trimEnd();
  if (suggestions.length > 0) {
    c += "\n\n## Directions to explore\n\n";
    for (const s of suggestions) c += `- [[${s.title}]] — ${s.subtitle}\n`;
  }
  return c + "\n";
}

// ═══════════════════════════════════════════════════════════════════
// Modals
// ═══════════════════════════════════════════════════════════════════

class SuggestionModal extends Modal {
  private nodeTitle: string;
  private onChoose: (s: Suggestion) => void;
  private plugin: DendritePlugin;
  private listEl: HTMLElement | null = null;

  constructor(app: App, nodeTitle: string, plugin: DendritePlugin, onChoose: (s: Suggestion) => void) {
    super(app); this.nodeTitle = nodeTitle; this.plugin = plugin; this.onChoose = onChoose;
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
      const genBtn = actionsDiv.createEl("button", { text: "✨ Generate new AI suggestions", cls: "dendrite-action-btn" });
      genBtn.addEventListener("click", async () => {
        genBtn.disabled = true; genBtn.setText("Generating...");
        try {
          const newSugs = await generateSuggestionsAI(this.plugin.app, this.plugin.settings, this.nodeTitle);
          await this.plugin.mergeSuggestionsIntoFile(this.nodeTitle, newSugs);
          for (const s of newSugs) {
            if (!existingSugs.some(e => e.title.toLowerCase() === s.title.toLowerCase())) {
              this.addSuggestionBtn(s); existingSugs.push(s);
            }
          }
          genBtn.setText("✨ Generate more");
        } catch (err: any) { genBtn.setText(`Error: ${err.message}`); }
        genBtn.disabled = false;
      });
    }

    const customDiv = contentEl.createDiv({ cls: "dendrite-custom" });
    customDiv.createEl("label", { text: "Or write your own direction:" });
    const input = customDiv.createEl("input", { type: "text", placeholder: "e.g. How does this connect to meditation?" });
    input.addClass("dendrite-custom-input");
    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && input.value.trim()) {
        this.onChoose({ title: input.value.trim(), subtitle: "User-directed exploration." }); this.close();
      }
    });
  }

  private addSuggestionBtn(s: Suggestion) {
    if (!this.listEl) return;
    const loading = this.listEl.querySelector(".dendrite-loading");
    if (loading) loading.remove();
    const btn = this.listEl.createDiv({ cls: "dendrite-suggestion" });
    btn.createEl("strong", { text: `+ ${s.title}` });
    btn.createEl("span", { text: s.subtitle });
    btn.addEventListener("click", () => { this.onChoose(s); this.close(); });
  }

  onClose() { this.contentEl.empty(); }
}

class CustomDirectionModal extends Modal {
  private nodeTitle: string; private onSubmit: (s: Suggestion) => void;
  constructor(app: App, nodeTitle: string, onSubmit: (s: Suggestion) => void) {
    super(app); this.nodeTitle = nodeTitle; this.onSubmit = onSubmit;
  }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass("dendrite-modal");
    contentEl.createEl("h3", { text: `Custom direction from "${this.nodeTitle}"` });
    const input = contentEl.createEl("input", { type: "text", placeholder: "Type and press Enter..." });
    input.addClass("dendrite-custom-input"); input.style.width = "100%"; input.style.marginTop = "8px"; input.focus();
    input.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.key === "Enter" && input.value.trim()) {
        this.onSubmit({ title: input.value.trim(), subtitle: "User-directed exploration." }); this.close();
      }
      if (e.key === "Escape") this.close();
    });
  }
  onClose() { this.contentEl.empty(); }
}

class NodePickerModal extends Modal {
  private nodes: CanvasNode[]; private plugin: DendritePlugin; private onPick: (node: CanvasNode) => void;
  constructor(app: App, nodes: CanvasNode[], plugin: DendritePlugin, onPick: (node: CanvasNode) => void) {
    super(app); this.nodes = nodes; this.plugin = plugin; this.onPick = onPick;
  }
  onOpen() {
    const { contentEl } = this; contentEl.empty(); contentEl.addClass("dendrite-modal");
    contentEl.createEl("h2", { text: "Choose a node to expand" });
    const listEl = contentEl.createDiv({ cls: "dendrite-suggestions" });
    for (const node of this.nodes) {
      const t = this.plugin.getNodeTitle(node);
      const btn = listEl.createDiv({ cls: "dendrite-suggestion" });
      btn.createEl("strong", { text: t });
      btn.addEventListener("click", () => { this.onPick(node); this.close(); });
    }
  }
  onClose() { this.contentEl.empty(); }
}

// ═══════════════════════════════════════════════════════════════════
// Main Plugin
// ═══════════════════════════════════════════════════════════════════

export default class DendritePlugin extends Plugin {
  settings: DendriteSettings = DEFAULT_SETTINGS;
  private suggestionsCache: Map<string, Suggestion[]> = new Map();

  get hasApiKey(): boolean { return !!this.settings.openaiApiKey?.trim(); }
  get nodesBasePath(): string {
    return this.settings.rootFolder
      ? `${this.settings.rootFolder}/${this.settings.nodesFolder}`
      : this.settings.nodesFolder;
  }
  get canvasPath(): string {
    return this.settings.rootFolder
      ? `${this.settings.rootFolder}/${this.settings.canvasName}.canvas`
      : `${this.settings.canvasName}.canvas`;
  }
  notePath(title: string): string { return `${this.nodesBasePath}/${title}.md`; }

  async onload() {
    await this.loadSettings();

    this.addCommand({ id: "dendrite-init", name: "Initialize knowledge map", callback: () => this.initializeMap() });
    this.addCommand({ id: "dendrite-expand", name: "Expand selected node", callback: () => this.expandSelectedNode() });
    this.addRibbonIcon("brain", "Dendrite: Expand node", () => this.expandSelectedNode());
    this.addSettingTab(new DendriteSettingTab(this.app, this));

    // Cache suggestions on file change
    this.registerEvent(this.app.vault.on("modify", (file: TAbstractFile) => {
      if (file instanceof TFile && file.path.startsWith(this.nodesBasePath + "/")) {
        this.cacheSuggestionsForFile(file);
      }
    }));

    // Cache all on startup
    this.app.workspace.onLayoutReady(() => this.cacheAllSuggestions());

    // Context menu (SYNC — uses cache)
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu: Menu, file: TAbstractFile) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        if (!file.path.startsWith(this.nodesBasePath + "/")) return;
        const title = file.basename;
        const cached = this.suggestionsCache.get(file.path) || [];

        menu.addItem((item: MenuItem) => {
          item.setTitle("Dendrite: Expand node").setIcon("brain");
          const submenu = (item as any).setSubmenu() as Menu;
          if (cached.length > 0) {
            for (const s of cached) {
              submenu.addItem((sub: MenuItem) => {
                sub.setTitle(`${s.title} — ${s.subtitle}`)
                  .onClick(() => this.handleSuggestionClick(file, s));
              });
            }
            submenu.addSeparator();
          }
          submenu.addItem((sub: MenuItem) => {
            sub.setTitle("✨ Generate new AI suggestions...").setIcon("sparkles")
              .onClick(() => this.expandNodeByFile(file));
          });
          submenu.addItem((sub: MenuItem) => {
            sub.setTitle("✎ Write your own direction...")
              .onClick(() => new CustomDirectionModal(this.app, title, (chosen) => this.handleSuggestionClick(file, chosen)).open());
          });
        });
      })
    );

    // Intercept new file creation from [[link]] clicks
    this.registerEvent(
      this.app.vault.on("create", async (file: TAbstractFile) => {
        if (!(file instanceof TFile) || file.extension !== "md") return;
        await new Promise(r => setTimeout(r, 300));

        let content: string;
        try { content = await this.app.vault.read(file); } catch { return; }
        if (content.trim().length > 0) return;

        const title = file.basename;

        // Check if linked from any dendrite note
        let parentTitle = "";
        let isLinkedFromDendrite = false;
        for (const f of this.app.vault.getMarkdownFiles()) {
          if (f.path === file.path) continue;
          if (!f.path.startsWith(this.nodesBasePath + "/")) continue;
          try {
            const c = await this.app.vault.read(f);
            if (!hasDendriteTag(c)) continue;
            if (c.includes(`[[${title}]]`)) { parentTitle = f.basename; isLinkedFromDendrite = true; break; }
          } catch { continue; }
        }

        if (!isLinkedFromDendrite && !file.path.startsWith(this.nodesBasePath + "/")) return;

        // Move to Nodes folder if created elsewhere
        let targetFile = file;
        if (!file.path.startsWith(this.nodesBasePath + "/")) {
          const targetPath = this.notePath(title);
          if (!this.app.vault.getAbstractFileByPath(targetPath)) {
            // Ensure nodes folder exists
            const folder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
            if (!folder) await this.app.vault.createFolder(this.nodesBasePath);
            await this.app.fileManager.renameFile(file, targetPath);
            const moved = this.app.vault.getAbstractFileByPath(targetPath);
            if (!(moved instanceof TFile)) return;
            targetFile = moved;
          }
        }

        // Populate with content
        try {
          if (this.hasApiKey) {
            new Notice(`Dendrite: Generating "${title}"...`);
            const zettel = await generateZettelAI(this.app, this.settings, title, parentTitle, "");
            await this.app.vault.modify(targetFile, buildZettelContent(title, zettel.subtitle, zettel.body, zettel.suggestions));
          } else {
            await this.app.vault.modify(targetFile, buildZettelContent(title, `Expand on: ${title}`, "", getMockSuggestions(title)));
          }
        } catch (err: any) {
          new Notice(`Dendrite: AI error — ${err.message}`);
          await this.app.vault.modify(targetFile, buildZettelContent(title, `Expand on: ${title}`, "", getMockSuggestions(title)));
        }
        await this.addFileToCanvasIfMissing(targetFile, title);
        this.cacheSuggestionsForFile(targetFile);
        new Notice(`Dendrite: Created "${title}".`);
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

  async cacheSuggestionsForFile(file: TFile) {
    try {
      const content = await this.app.vault.read(file);
      this.suggestionsCache.set(file.path, parseSuggestionsFromFrontmatter(content));
    } catch {}
  }

  async getExistingSuggestions(nodeTitle: string): Promise<Suggestion[]> {
    const path = this.notePath(nodeTitle);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return [];
    const content = await this.app.vault.read(file);
    return parseSuggestionsFromFrontmatter(content);
  }

  async mergeSuggestionsIntoFile(nodeTitle: string, newSugs: Suggestion[]) {
    const path = this.notePath(nodeTitle);
    const file = this.app.vault.getAbstractFileByPath(path);
    if (!(file instanceof TFile)) return;
    let content = await this.app.vault.read(file);
    const existing = parseSuggestionsFromFrontmatter(content);
    const existingTitles = new Set(existing.map(s => s.title.toLowerCase()));
    const merged = [...existing];
    for (const s of newSugs) { if (!existingTitles.has(s.title.toLowerCase())) merged.push(s); }
    content = updateFrontmatterSuggestions(content, merged);
    content = rebuildDirections(content, merged);
    await this.app.vault.modify(file, content);
    this.suggestionsCache.set(file.path, merged);
  }

  // ─── Actions ───────────────────────────────────────────────────
  async handleSuggestionClick(file: TFile, suggestion: Suggestion) {
    const result = await this.readCanvas(); if (!result) return;
    const node = result.data.nodes.find(n => n.type === "file" && n.file === file.path);
    if (node) await this.addNodeToCanvas(node, suggestion, result.file, result.data);
    else await this.createAndAddOrphan(file, suggestion);
  }

  async expandNodeByFile(file: TFile) {
    new SuggestionModal(this.app, file.basename, this, async (chosen) => {
      const r = await this.readCanvas(); if (!r) return;
      const fn = r.data.nodes.find(n => n.type === "file" && n.file === file.path);
      if (fn) await this.addNodeToCanvas(fn, chosen, r.file, r.data);
      else await this.createAndAddOrphan(file, chosen);
    }).open();
  }

  async expandSelectedNode() {
    const r = await this.readCanvas(); if (!r) return;
    const an = this.findActiveNodeInCanvas(r.data);
    if (!an) { new NodePickerModal(this.app, r.data.nodes, this, n => this.showSuggestionsForNode(n, r.file, r.data)).open(); return; }
    this.showSuggestionsForNode(an, r.file, r.data);
  }

  showSuggestionsForNode(node: CanvasNode, cf: TFile, cd: CanvasData) {
    new SuggestionModal(this.app, this.getNodeTitle(node), this, async (chosen) => {
      await this.addNodeToCanvas(node, chosen, cf, cd);
    }).open();
  }

  // ─── Settings ──────────────────────────────────────────────────
  async loadSettings() { this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData()); }
  async saveSettings() { await this.saveData(this.settings); }

  // ─── Zettel CRUD ───────────────────────────────────────────────
  async createZettel(title: string, subtitle: string, body: string, suggestions: Suggestion[], parentTitle?: string): Promise<TFile> {
    const path = this.notePath(title);
    const existing = this.app.vault.getAbstractFileByPath(path);
    if (existing instanceof TFile) return existing;

    // Ensure folder exists
    const folder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
    if (!folder) await this.app.vault.createFolder(this.nodesBasePath);

    let finalSub = subtitle, finalBody = body, sugs = suggestions;
    try {
      if (this.hasApiKey && parentTitle) {
        const z = await generateZettelAI(this.app, this.settings, title, parentTitle, subtitle);
        finalSub = z.subtitle; finalBody = z.body; sugs = z.suggestions;
      }
    } catch {}
    const file = await this.app.vault.create(path, buildZettelContent(title, finalSub, finalBody, sugs));
    this.suggestionsCache.set(path, sugs);
    return file;
  }

  // ─── Canvas Operations ─────────────────────────────────────────
  async initializeMap() {
    // Ensure root folder exists
    if (this.settings.rootFolder) {
      const root = this.app.vault.getAbstractFileByPath(this.settings.rootFolder);
      if (!root) await this.app.vault.createFolder(this.settings.rootFolder);
    }
    const nodesFolder = this.app.vault.getAbstractFileByPath(this.nodesBasePath);
    if (!nodesFolder) await this.app.vault.createFolder(this.nodesBasePath);

    const existing = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (existing) {
      new Notice("Map exists. Opening.");
      await this.app.workspace.openLinkText(this.canvasPath, "", false);
      return;
    }

    new Notice("Dendrite: Creating knowledge map...");
    const nodeIds: string[] = [], canvasNodes: CanvasNode[] = [];
    for (const seed of SEED_NODES) {
      const path = this.notePath(seed.title);
      if (!(this.app.vault.getAbstractFileByPath(path) instanceof TFile)) {
        let sugs = seed.suggestions;
        try {
          if (this.hasApiKey) {
            const z = await generateZettelAI(this.app, this.settings, seed.title, "", seed.subtitle);
            sugs = z.suggestions;
          }
        } catch {}
        await this.app.vault.create(path, buildZettelContent(seed.title, seed.subtitle, seed.body, sugs));
        this.suggestionsCache.set(path, sugs);
      }
      const id = generateId(); nodeIds.push(id);
      canvasNodes.push({ id, type: "file", file: this.notePath(seed.title), x: seed.x, y: seed.y, width: 300, height: 200 });
    }
    const edges: CanvasEdge[] = SEED_EDGES.map(([f, t]) => ({
      id: generateId(), fromNode: nodeIds[f], toNode: nodeIds[t], fromSide: "bottom", toSide: "top",
    }));
    await this.app.vault.create(this.canvasPath, JSON.stringify({ nodes: canvasNodes, edges }, null, 2));
    new Notice("Dendrite: Map created!");
    await this.app.workspace.openLinkText(this.canvasPath, "", false);
  }

  async readCanvas(): Promise<{ file: TFile; data: CanvasData } | null> {
    const file = this.app.vault.getAbstractFileByPath(this.canvasPath);
    if (!(file instanceof TFile)) { new Notice("No map. Run 'Initialize knowledge map'."); return null; }
    return { file, data: JSON.parse(await this.app.vault.read(file)) };
  }

  async writeCanvas(file: TFile, data: CanvasData) {
    await this.app.vault.modify(file, JSON.stringify(data, null, 2));
  }

  async addFileToCanvasIfMissing(file: TFile, title: string) {
    const result = await this.readCanvas(); if (!result) return;
    const { file: cf, data } = result;
    if (data.nodes.some(n => n.type === "file" && n.file === file.path)) return;

    let pn: CanvasNode | null = null;
    for (const node of data.nodes) {
      if (node.type !== "file" || !node.file) continue;
      const nf = this.app.vault.getAbstractFileByPath(node.file);
      if (nf instanceof TFile) {
        try {
          if ((await this.app.vault.read(nf)).includes(`[[${title}]]`)) { pn = node; break; }
        } catch {}
      }
    }
    const bx = pn ? pn.x : Math.random() * 800 - 400;
    const by = pn ? pn.y : Math.random() * 600 - 300;
    const a = Math.random() * Math.PI * 2, d = 350 + Math.random() * 100, nid = generateId();
    data.nodes.push({ id: nid, type: "file", file: file.path,
      x: Math.round(bx + Math.cos(a) * d), y: Math.round(by + Math.sin(a) * d), width: 300, height: 200 });
    if (pn) data.edges.push({ id: generateId(), fromNode: pn.id, toNode: nid, fromSide: "bottom", toSide: "top" });
    await this.writeCanvas(cf, data);
  }

  async addNodeToCanvas(pn: CanvasNode, s: Suggestion, cf: TFile, cd: CanvasData) {
    const pt = this.getNodeTitle(pn);
    new Notice(`Dendrite: Creating "${s.title}"...`);
    await this.createZettel(s.title, s.subtitle, "", getMockSuggestions(s.title), pt);
    const a = Math.random() * Math.PI * 2, d = 350 + Math.random() * 100, nid = generateId();
    cd.nodes.push({ id: nid, type: "file", file: this.notePath(s.title),
      x: Math.round(pn.x + Math.cos(a) * d), y: Math.round(pn.y + Math.sin(a) * d), width: 300, height: 200 });
    cd.edges.push({ id: generateId(), fromNode: pn.id, toNode: nid, fromSide: "bottom", toSide: "top" });
    await this.writeCanvas(cf, cd);
    new Notice(`Added "${s.title}"!`);
    await this.app.workspace.openLinkText(this.notePath(s.title), "", false);
  }

  async createAndAddOrphan(file: TFile, s: Suggestion) {
    const r = await this.readCanvas(); if (!r) return;
    await this.addNodeToCanvas(
      { id: "orphan", type: "file", file: file.path, x: 0, y: 0, width: 300, height: 200 } as CanvasNode,
      s, r.file, r.data
    );
  }

  // ─── Helpers ───────────────────────────────────────────────────
  getNodeTitle(node: CanvasNode): string {
    if (node.type === "file" && node.file) return node.file.split("/").pop()?.replace(".md", "") || "Unknown";
    if (node.type === "text" && node.text) return node.text.split("\n")[0].replace(/^#+ /, "");
    return "Unknown";
  }

  findActiveNodeInCanvas(data: CanvasData): CanvasNode | null {
    const af = this.app.workspace.getActiveFile(); if (!af) return null;
    for (const n of data.nodes) { if (n.type === "file" && n.file === af.path) return n; }
    if (af.path === this.canvasPath && data.nodes.length > 0) return data.nodes[0];
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════════
// Settings Tab
// ═══════════════════════════════════════════════════════════════════

class DendriteSettingTab extends PluginSettingTab {
  plugin: DendritePlugin;
  constructor(app: App, plugin: DendritePlugin) { super(app, plugin); this.plugin = plugin; }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.addClass("dendrite-settings");

    containerEl.createEl("h2", { text: "Dendrite" });
    containerEl.createEl("p", { text: "AI-powered knowledge mind mapping for Obsidian.", cls: "dendrite-settings-subtitle" });

    // ─── AI Configuration ────────────────────────────────────────
    containerEl.createEl("h3", { text: "AI Configuration" });

    new Setting(containerEl)
      .setName("OpenAI API Key")
      .setDesc("Your OpenAI API key for generating content and suggestions. Leave empty to use built-in mock suggestions.")
      .addText((t) => {
        t.inputEl.type = "password";
        t.inputEl.style.width = "300px";
        t.setPlaceholder("sk-proj-...")
          .setValue(this.plugin.settings.openaiApiKey)
          .onChange(async (v) => { this.plugin.settings.openaiApiKey = v; await this.plugin.saveSettings(); });
      });

    new Setting(containerEl)
      .setName("OpenAI Model")
      .setDesc("Which model to use. GPT-4.1 Mini is recommended for speed and cost. GPT-5.4 for highest quality.")
      .addDropdown((d) => {
        for (const m of OPENAI_MODELS) d.addOption(m.value, m.label);
        d.setValue(this.plugin.settings.openaiModel)
          .onChange(async (v) => { this.plugin.settings.openaiModel = v; await this.plugin.saveSettings(); });
      });

    // ─── Folder Structure ────────────────────────────────────────
    containerEl.createEl("h3", { text: "Folder Structure" });

    new Setting(containerEl)
      .setName("Root folder")
      .setDesc("Base folder for all Dendrite files. Canvas and Nodes folder live inside this. Leave empty for vault root.")
      .addText((t) => t
        .setPlaceholder("Dendrite")
        .setValue(this.plugin.settings.rootFolder)
        .onChange(async (v) => { this.plugin.settings.rootFolder = v; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName("Nodes subfolder")
      .setDesc("Where zettel notes are stored (inside the root folder).")
      .addText((t) => t
        .setPlaceholder("Nodes")
        .setValue(this.plugin.settings.nodesFolder)
        .onChange(async (v) => { this.plugin.settings.nodesFolder = v; await this.plugin.saveSettings(); }));

    new Setting(containerEl)
      .setName("Canvas name")
      .setDesc("Name of the canvas file (inside the root folder).")
      .addText((t) => t
        .setPlaceholder("Knowledge Map")
        .setValue(this.plugin.settings.canvasName)
        .onChange(async (v) => { this.plugin.settings.canvasName = v; await this.plugin.saveSettings(); }));

    // ─── Knowledge Map ───────────────────────────────────────────
    containerEl.createEl("h3", { text: "Knowledge Map" });

    const missionSetting = new Setting(containerEl)
      .setName("Mission statement")
      .setDesc("The guiding mission for your knowledge map. The AI uses this to suggest meaningful, cross-domain connections.");

    missionSetting.addTextArea((t) => {
      t.setPlaceholder("e.g. Grow my understanding of systems thinking across technology, biology, and philosophy...")
        .setValue(this.plugin.settings.mission)
        .onChange(async (v) => { this.plugin.settings.mission = v; await this.plugin.saveSettings(); });
      t.inputEl.rows = 4;
      t.inputEl.style.width = "100%";
      t.inputEl.style.minHeight = "100px";
      t.inputEl.style.resize = "vertical";
    });

    // Make mission setting full-width
    missionSetting.settingEl.style.flexDirection = "column";
    missionSetting.settingEl.style.alignItems = "flex-start";
    missionSetting.settingEl.style.gap = "8px";
    const missionControl = missionSetting.settingEl.querySelector(".setting-item-control") as HTMLElement;
    if (missionControl) { missionControl.style.width = "100%"; }
  }
}
