import { Suggestion, SeedNode } from "./types";

export const MOCK_SUGGESTIONS: Record<string, Suggestion[]> = {
  "Self-Knowledge": [
    { title: "Habits & Identity", subtitle: "How daily routines sculpt who you become." },
    { title: "Relationships as Mirrors", subtitle: "Other people reveal your blind spots." },
    { title: "The Observer Self", subtitle: "Metacognition — thinking about your thinking." },
  ],
  "Body Awareness": [
    { title: "Nervous System States", subtitle: "Sympathetic vs parasympathetic — your body's two operating modes." },
    { title: "Movement as Cognition", subtitle: "Embodied cognition shows thinking isn't just in the head." },
    { title: "Sleep Architecture", subtitle: "The structure of sleep stages and why each matters." },
  ],
  "Mental Models": [
    { title: "First Principles Thinking", subtitle: "Reasoning from fundamentals rather than analogy." },
    { title: "Cognitive Biases", subtitle: "Systematic errors in thinking that everyone shares." },
    { title: "Systems Thinking", subtitle: "Seeing interconnections rather than isolated events." },
  ],
  "Emotional Intelligence": [
    { title: "Affect Labeling", subtitle: "Naming emotions precisely reduces their intensity." },
    { title: "Somatic Markers", subtitle: "How the body stores emotional memory and guides decisions." },
  ],
  "Meaning & Purpose": [
    { title: "Flow States", subtitle: "Optimal experience occurs when challenge matches skill." },
    { title: "Ikigai", subtitle: "The Japanese concept of 'a reason for being' across four dimensions." },
  ],
};

export const GENERIC_SUGGESTIONS: Suggestion[] = [
  { title: "Deeper Mechanisms", subtitle: "What underlying processes drive this phenomenon?" },
  { title: "Practical Applications", subtitle: "How can this knowledge be applied in daily life?" },
  { title: "Cross-Domain Connections", subtitle: "How does this relate to other areas of knowledge?" },
];

export function getMockSuggestions(nodeTitle: string): Suggestion[] {
  return MOCK_SUGGESTIONS[nodeTitle] || GENERIC_SUGGESTIONS;
}

export const SEED_NODES: SeedNode[] = [
  {
    title: "Self-Knowledge", subtitle: "Understanding yourself is the foundation of all growth.",
    body: "Self-knowledge spans multiple dimensions: your body's signals, your mind's patterns, your emotional landscape, and your sense of meaning. Each domain feeds the others.",
    suggestions: MOCK_SUGGESTIONS["Self-Knowledge"],
    x: 0, y: 0,
  },
  {
    title: "Body Awareness", subtitle: "Your body is your primary instrument of perception.",
    body: "Interoception — sensing internal states like heartbeat, breath, and gut feelings — is a core component of emotional regulation and decision-making.",
    suggestions: MOCK_SUGGESTIONS["Body Awareness"],
    x: -400, y: -300,
  },
  {
    title: "Mental Models", subtitle: "The frameworks you interpret reality with shape what you can see.",
    body: "Mental models are cognitive lenses. The danger is mistaking the map for the territory: every model highlights some truths while hiding others.",
    suggestions: MOCK_SUGGESTIONS["Mental Models"],
    x: 400, y: -300,
  },
  {
    title: "Emotional Intelligence", subtitle: "Emotions are data, not noise — reading them is a skill.",
    body: "Four capacities: perceiving emotions accurately, using them to facilitate thought, understanding emotional dynamics, and managing them skillfully. Trainable at any age.",
    suggestions: MOCK_SUGGESTIONS["Emotional Intelligence"],
    x: -400, y: 300,
  },
  {
    title: "Meaning & Purpose", subtitle: "Purpose isn't found — it's constructed through engagement.",
    body: "Frankl identified three sources: creative work (what you give), experiential richness (what you take), and attitudinal choice (the stance toward suffering).",
    suggestions: MOCK_SUGGESTIONS["Meaning & Purpose"],
    x: 400, y: 300,
  },
];

export const SEED_EDGES: Array<[number, number]> = [[0,1],[0,2],[0,3],[0,4],[1,3],[2,4]];
