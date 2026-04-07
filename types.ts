export interface CanvasNode {
  id: string;
  type: "text" | "file" | "link" | "group";
  x: number; y: number; width: number; height: number;
  color?: string; text?: string; file?: string;
  [key: string]: any;
}

export interface CanvasEdge {
  id: string;
  fromNode: string; toNode: string;
  fromSide?: string; toSide?: string;
  fromEnd?: string; toEnd?: string;
  color?: string; label?: string;
  [key: string]: any;
}

export interface CanvasData {
  nodes: CanvasNode[]; edges: CanvasEdge[];
  [key: string]: any;
}

export interface Suggestion {
  title: string;
  subtitle: string;
}

export interface SeedNode {
  title: string; subtitle: string; body: string;
  suggestions: Suggestion[];
  x: number; y: number;
}

export interface DendriteSettings {
  rootFolder: string;
  nodesFolder: string;
  canvasName: string;
  mission: string;
  openaiApiKey: string;
  openaiModel: string;
}

export const DEFAULT_SETTINGS: DendriteSettings = {
  rootFolder: "Dendrite",
  nodesFolder: "Nodes",
  canvasName: "Knowledge Map",
  mission: "Grow your knowledge and personhood holistically — from physical to spiritual dimensions.",
  openaiApiKey: "",
  openaiModel: "gpt-4.1-mini",
};

export const OPENAI_MODELS: { value: string; label: string }[] = [
  { value: "gpt-5.4", label: "GPT-5.4 (flagship)" },
  { value: "gpt-5.4-mini", label: "GPT-5.4 Mini" },
  { value: "gpt-5.4-nano", label: "GPT-5.4 Nano" },
  { value: "gpt-5.2", label: "GPT-5.2" },
  { value: "gpt-5-mini", label: "GPT-5 Mini" },
  { value: "gpt-5-nano", label: "GPT-5 Nano" },
  { value: "gpt-4.1", label: "GPT-4.1" },
  { value: "gpt-4.1-mini", label: "GPT-4.1 Mini (recommended)" },
  { value: "gpt-4.1-nano", label: "GPT-4.1 Nano" },
  { value: "gpt-4o", label: "GPT-4o (legacy)" },
  { value: "gpt-4o-mini", label: "GPT-4o Mini (legacy)" },
];
