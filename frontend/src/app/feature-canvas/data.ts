import type { Feature, Bucket } from "../types/global";

export const initialFeatures: Feature[] = [
  { id: "f1", name: "User Authentication" },
  { id: "f2", name: "Real-Time Chat" },
  { id: "f3", name: "Reporting" },
  { id: "f4", name: "Public API" },
];

export const initialBuckets: Bucket[] = [
  { id: "interactive", name: "Interactive", features: [] },
  { id: "async", name: "Async", features: [] },
  { id: "batch", name: "Batch", features: [] },
  { id: "public", name: "Public API", features: [] },
  { id: "static", name: "Static content", features: [] },
  { id: "realtime", name: "Real-time / streaming", features: [] },
  { id: "other", name: "Other", features: [] },
];
