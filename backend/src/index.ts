import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import {
  ContextQuizSchema,
  ContextQuiz,
  AppArchSchema,
  AppArchJsonSchema,
  AWSStackSchema,
  AWSStackJsonSchema,
} from "./schemas";
import { z } from "zod";
import { awsSelectionGuide } from "../awsGuide";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// initialise OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// health check endpoint
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// app.post("/api/context-quiz", async (req, res) => {
//   console.log("INVOKED");
//   // 1. Validate the incoming quiz payload
//   const quizParse = ContextQuizSchema.safeParse(req.body);
//   console.log("Parsed quiz data:", quizParse.error);
//   if (!quizParse.success) {
//     return res.status(400).json({ error: quizParse.error.errors });
//   }
//   const quizData: ContextQuiz = quizParse.data;

//   // 2. Prepare the AI prompt
//   const promptText = `
// Based on this project context (including cost model, time-to-market, scalability needs, ops overhead, flexibility, latency profile, cold-start tolerance, compliance level, scope stability, and other details), suggest a web-application architecture PATTERN. Choose from:
//   • monolithic
//   • layered/N-tier
//   • microservices
//   • event-driven
//   • serverless

// Return exactly a JSON object with the following properties:
//   - pattern (string): the chosen architecture pattern
//   - rationale (string): why this pattern best fits the context
//   - keyBuildingBlocks (array of strings): the major modules or components
// `;

//   // 3. Call OpenAI with function-calling
//   const archResp = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [
//       { role: "user", content: promptText },
//       { role: "user", content: JSON.stringify(quizData) },
//     ],
//     functions: [
//       {
//         name: "suggestAppArchitecture",
//         description: "Suggest an architecture PATTERN for the web application",
//         parameters: AppArchJsonSchema, // JSON Schema describing the expected output
//       },
//     ],
//     function_call: { name: "suggestAppArchitecture" },
//   });

//   // 4. Parse and validate the AI’s response
//   const fnCall = archResp.choices[0].message.function_call!;
//   const rawOutput = JSON.parse(fnCall.arguments!);
//   const suggestion = AppArchSchema.parse(rawOutput);

//   // 5. Return the suggestion to the frontend
//   return res.json({ suggestedAppArch: suggestion });
// });

app.post("/api/recommend-stack", async (req, res) => {
  // 1. Validate body shape
  const bodySchema = z.object({
    quizInput: ContextQuizSchema,
    additionalNotes: z.string().optional(),
    buckets: z
      .array(
        z.object({
          id: z.string(),
          name: z.string(),
          features: z.array(z.object({ id: z.string(), name: z.string() })),
        })
      )
      .min(1),
  });
  const parsed = bodySchema.safeParse(req.body);
  console.log("Parsed request body:", parsed);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.errors });
  }
  const { quizInput, buckets, additionalNotes } = parsed.data;
  let preferenceNote = "";
  if (
    quizInput.opsOverhead === "high" &&
    quizInput.flexibility === "maximum" &&
    quizInput.complianceLevel === "strict"
  ) {
    preferenceNote =
      "PREFER: For high-ops-overhead + max-flexibility + strict-compliance scenarios, favor EC2 (ASG) or ECS/EKS over serverless (Lambda/FaaS).";
  }

  const promptText = `
Please follow the AWS Stack Selection Guide above.
${preferenceNote}

Now, given this application context and feature grouping, suggest:
1. An appropriate software development life cycle (SDLC) methodology.
2. A web app architecture (e.g. monolith, microservices, N-tier, event-driven).
3. A detailed AWS infrastructure diagram that clearly labels:
   - For a monolith: where the single deployable runs (e.g., ECS service, EC2 Auto Scaling Group).
   - For N-tier: where the frontend lives (static pages on S3/CloudFront vs dynamic pages), where the API/backend runs (Lambda, Fargate/ECS, EC2), and how they connect.
   - For any specialized buckets (User-Interactive, Public API, Static Content, Async, Batch, Other), which AWS services host each, and any edge or caching layers.
   - Add deployment specifics for edge-optimized vs regional endpoints, and any IaC hints (e.g. CDK/CloudFormation modules).

Context (user quiz input):
${JSON.stringify(quizInput, null, 2)}

Feature buckets:
${buckets
  .map(
    (b) => `- ${b.name}: ${b.features.map((f) => f.name).join(", ") || "none"}`
  )
  .join("\n")}

Additional notes / requirements from user:
${additionalNotes || "none"}

Return a JSON object with these properties:
- **sdlc** (string): proposed SDLC methodology, with rationale.
- **appArchitecture** (string): chosen web app architecture, with rationale.
- **additionalReply** (string): reply to any specific user questions from ${additionalNotes}.
- **approximateCost** (string): estimated cost of the proposed AWS architecture, even if it's hard to estimate you can use assumptions, but must give an estimated monthly cost in GBP.
- **services** (array of strings): list of suggested AWS services. Make sure it is aligned with the dotSpec, architecture and other input data you have access to. For each service include the required specifications, make assumptions if necessary (e.g. if you suggest EC2, then suggest instance type, if you suggest S3 then suggest storage etc.)
- **rationale** (string): detailed rationale for these AWS choices.
- **dotSpec** (string): a Graphviz DOT definition, where each node is labeled with the component name and type (e.g., 'Frontend_S3 [label="Frontend\\nS3/CloudFront"]'). Make sure that definition includes all the services you suggested.
`;

  console.log("Before AI call");
  const aiResp = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: awsSelectionGuide },
      { role: "user", content: promptText },
    ],
    functions: [
      {
        name: "suggestAWSStack",
        description: "Generate AWS infrastructure recommendation",
        parameters: AWSStackJsonSchema,
      },
    ],
    function_call: { name: "suggestAWSStack" },
  });
  console.log("AI response:", aiResp);

  const fnCall = aiResp.choices[0].message.function_call!;
  console.log("Function call:", fnCall);
  if (!fnCall || !fnCall.arguments) {
    return res
      .status(500)
      .json({ error: "AI did not return a function call with arguments" });
  }
  const raw = JSON.parse(fnCall.arguments!);
  console.log("Parsed AI arguments:", raw);

  // Validate against your strict AWSStackSchema
  let awsStack;
  try {
    awsStack = AWSStackSchema.parse(raw);
    console.log("Validated AWS stack:", awsStack);
    return res.json({ awsStack });
  } catch (err) {
    console.error("Error validating AWS stack:", err);
    if (err instanceof z.ZodError) {
      const missingFields = err.issues
        .filter((i) => i.code === "invalid_type" && i.message === "Required")
        .map((i) => i.path.join("."));
      return res.status(500).json({
        error: `AI response missing required field${
          missingFields.length > 1 ? "s" : ""
        }: ${missingFields.join(", ")}`,
      });
    }

    // fallback:
    return res
      .status(500)
      .json({ error: "AI response validation failed", details: err });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
