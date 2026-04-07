import { App, TFile, requestUrl } from "obsidian";
import { Suggestion, DendriteSettings } from "./types";

import PROMPT_SUGGESTIONS from "./prompts/generate-suggestions.md";
import PROMPT_ZETTEL from "./prompts/generate-zettel.md";

function fillTemplate(template: string, vars: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), value);
  }
  return result;
}

function nodesBasePath(settings: DendriteSettings): string {
  return settings.rootFolder ? `${settings.rootFolder}/${settings.nodesFolder}` : settings.nodesFolder;
}

export async function gatherMapContext(app: App, settings: DendriteSettings): Promise<string> {
  const base = nodesBasePath(settings);
  const files = app.vault.getMarkdownFiles().filter(f => f.path.startsWith(base + "/"));
  if (files.length === 0) return "(empty map)";
  const summaries: string[] = [];
  for (const file of files) {
    const content = await app.vault.read(file);
    const m = content.match(/^>\s*(.+)$/m);
    summaries.push(`- ${file.basename}: ${m ? m[1] : "(no summary)"}`);
  }
  return summaries.join("\n");
}

async function getNodeContent(app: App, settings: DendriteSettings, title: string): Promise<string> {
  const base = nodesBasePath(settings);
  const path = `${base}/${title}.md`;
  const file = app.vault.getAbstractFileByPath(path);
  if (file instanceof TFile) return await app.vault.read(file);
  return "";
}

const NEW_PARAM_MODELS = ["gpt-4.1", "gpt-5", "gpt-5."];
function usesNewTokenParam(model: string): boolean {
  return NEW_PARAM_MODELS.some(m => model.startsWith(m));
}

async function callOpenAI(apiKey: string, model: string, prompt: string): Promise<string> {
  const key = apiKey.trim();
  if (!key) throw new Error("No OpenAI API key configured");
  const body: any = { model, messages: [{ role: "user", content: prompt }], temperature: 0.8 };
  if (usesNewTokenParam(model)) body.max_completion_tokens = 2000;
  else body.max_tokens = 2000;

  let response;
  try {
    response = await requestUrl({
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST", contentType: "application/json",
      headers: { "Authorization": `Bearer ${key}` },
      body: JSON.stringify(body), throw: false,
    });
  } catch (err: any) { throw new Error(`Network error: ${err.message || err}`); }

  if (response.status === 401) throw new Error("Invalid API key (401). Check Dendrite settings.");
  if (response.status === 404) throw new Error(`Model "${model}" not found (404).`);
  if (response.status === 429) throw new Error("Rate limit (429). Wait and retry.");
  if (response.status !== 200) throw new Error(`OpenAI error (${response.status}): ${(response.text || "").substring(0, 300)}`);

  const content = response.json?.choices?.[0]?.message?.content?.trim();
  if (!content) throw new Error("Empty response from OpenAI");
  return content;
}

function parseJSON<T>(raw: string): T | null {
  const cleaned = raw.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(cleaned) as T; } catch {}
  const m = cleaned.match(/[\[{][\s\S]*[\]}]/);
  if (m) { try { return JSON.parse(m[0]) as T; } catch {} }
  return null;
}

export async function generateZettelAI(
  app: App, settings: DendriteSettings, nodeTitle: string, parentTitle: string, suggestionSubtitle: string
): Promise<{ subtitle: string; body: string; suggestions: Suggestion[] }> {
  const existingNodes = await gatherMapContext(app, settings);
  const prompt = fillTemplate(PROMPT_ZETTEL, {
    mission: settings.mission, existing_nodes: existingNodes,
    node_label: nodeTitle, parent_label: parentTitle || "(root)",
    suggestion_summary: suggestionSubtitle || "(initial creation)",
  });
  const raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
  const parsed = parseJSON<{ subtitle: string; body: string; suggestions: Suggestion[] }>(raw);
  if (!parsed || !parsed.subtitle) throw new Error("Failed to parse zettel from OpenAI");
  const suggestions = (parsed.suggestions || [])
    .filter(s => s.title && s.subtitle)
    .map(s => ({ title: String(s.title), subtitle: String(s.subtitle) }));
  return { subtitle: String(parsed.subtitle), body: String(parsed.body || ""), suggestions };
}

export async function generateSuggestionsAI(
  app: App, settings: DendriteSettings, nodeTitle: string
): Promise<Suggestion[]> {
  const existingNodes = await gatherMapContext(app, settings);
  const nodeContent = await getNodeContent(app, settings, nodeTitle);
  const prompt = fillTemplate(PROMPT_SUGGESTIONS, {
    mission: settings.mission, existing_nodes: existingNodes,
    node_label: nodeTitle, node_content: nodeContent || "(no content yet)",
  });
  const raw = await callOpenAI(settings.openaiApiKey, settings.openaiModel, prompt);
  const parsed = parseJSON<Suggestion[]>(raw);
  if (!parsed || !Array.isArray(parsed)) throw new Error("Failed to parse suggestions from OpenAI");
  return parsed.filter(s => s.title && s.subtitle).map(s => ({ title: String(s.title), subtitle: String(s.subtitle) }));
}
