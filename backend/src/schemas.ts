import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

// Multiple-choice enums
const CostModel = z.enum(["idle", "pay-per-use", "predictable", "variable"]);
const TimeToMarket = z.enum([
  "prototype-speed",
  "moderate-setup",
  "full-control",
]);
const ScalabilityNeeds = z.enum(["low", "auto-scaling", "global-scale"]);
const OpsOverhead = z.enum(["minimal", "some", "high"]);
const Flexibility = z.enum(["constrained", "moderate", "maximum"]);
const LatencyProfile = z.enum(["low-p95", "medium-p95", "high-p95"]);
const ColdStartTolerance = z.enum(["cold-start-ok", "cold-start-minimal"]);
const ComplianceLevel = z.enum(["none", "basic", "strict"]);
const ScopeStability = z.enum(["fixed", "evolving"]);

// Quiz Zod schema
export const ContextQuizSchema = z.object({
  costModel: CostModel,
  timeToMarket: TimeToMarket,
  scalabilityNeeds: ScalabilityNeeds,
  opsOverhead: OpsOverhead,
  flexibility: Flexibility,
  latencyProfile: LatencyProfile,
  coldStartTolerance: ColdStartTolerance,
  complianceLevel: ComplianceLevel,
  scopeStability: ScopeStability,
  otherDetails: z.string().optional(),
});
export type ContextQuiz = z.infer<typeof ContextQuizSchema>;

// Convert and pull out the actual definition
const rawQuiz = zodToJsonSchema(ContextQuizSchema, "ContextQuiz");
export const ContextQuizJsonSchema = rawQuiz.definitions!.ContextQuiz as Record<
  string,
  any
>;

// App-Arch Zod schema
export const AppArchSchema = z.object({
  architectureStyle: z.string().min(1),
  rationale: z.string().min(1),
  components: z.array(z.string()).optional(),
});
export type AppArch = z.infer<typeof AppArchSchema>;

// Convert and extract
const rawAppArchSchema = zodToJsonSchema(AppArchSchema, "AppArch");
export const AppArchJsonSchema = rawAppArchSchema.definitions!
  .AppArch as Record<string, any>;

// AWS Stack suggestion schema
export const AWSStackSchema = z.object({
  sdlc: z.string().min(1), // proposed SDLC methodology
  architecture: z.string().min(1), // proposed web app architecture
  additionalReply: z.string().optional(), // additional reply for user
  services: z.array(z.string()).min(1), // list of AWS services
  rationale: z.string().min(1), // why these services
  dotSpec: z.string().min(1), // e.g. Mermaid or JSON for diagram
});
export type AWSStack = z.infer<typeof AWSStackSchema>;

// JSON Schema for function-calling
const rawAWS = zodToJsonSchema(AWSStackSchema, "AWSStack");
export const AWSStackJsonSchema = rawAWS.definitions!.AWSStack as Record<
  string,
  any
>;
