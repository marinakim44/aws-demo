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
    buckets: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        features: z.array(z.object({ id: z.string(), name: z.string() })),
      })
    ),
  });
  const parsed = bodySchema.safeParse(req.body);

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
  // 2. Call OpenAI to recommend AWS stack
  // Just before building promptText, you already have noServerlessNote logic
  const promptText = `
Please follow the AWS Stack Selection Guide above.
${preferenceNote}

Now, given this application context and feature grouping, suggest the appropriate SDLC methodology, application architecture and AWS architecture/infrastructure.

Context (user quiz input):
${JSON.stringify(quizInput, null, 2)}

Feature buckets:
${buckets
  .map(
    (b) => `- ${b.name}: ${b.features.map((f) => f.name).join(", ") || "none"}`
  )
  .join("\n")}

Additional notes / requirements from user:
${additionalNotes}

Return a JSON object with:
- proposed software development life cycle (SDLC) methodology (string) with detailed rationale why this methodology was suggested.
- proposed web app architecture (e.g. monolith, microservices, N-tier, event-driven etc.) with detailed rationale why this architecture was suggested (string)
- additional reply for user considering any additionalNotes provided. Include here a reply to whatever user asked for (string)
- services (array of strings): list AWS services (e.g., EC2, ECS, EKS, RDS)
- detailed rationale for AWS architecture (string): why these choices fit
- dotSpec (string): a Graphviz DOT definition of the architecture
`;

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

  const fnCall = aiResp.choices[0].message.function_call!;
  const raw = JSON.parse(fnCall.arguments!);
  const awsStack = AWSStackSchema.parse(raw);

  return res.json({ awsStack });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
