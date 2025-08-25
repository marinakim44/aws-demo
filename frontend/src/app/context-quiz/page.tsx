"use client";

import { data } from "./data.js";
import { useState } from "react";

export default function ContextQuizPage() {
  const [quiz, setQuiz] = useState({
    costModel: "idle",
    timeToMarket: "prototype-speed",
    scalabilityNeeds: "low",
    opsOverhead: "minimal",
    flexibility: "constrained",
    latencyProfile: "low-p95",
    coldStartTolerance: "cold-start-ok",
    complianceLevel: "none",
    teamSkills: "serverless",
    scopeStability: "fixed",
    otherDetails: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Call the API with the quiz data
    localStorage.setItem("quizInputData", JSON.stringify(quiz));
    window.location.href = "/feature-canvas";
  };

  return (
    <div className="p-10 max-w-[1200px] m-auto text-sm">
      <h1 className="font-bold text-2xl mb-8">
        Demo: AI assistant to identify the AWS architecture
      </h1>
      <form className="flex flex-col space-y-4" onSubmit={handleSubmit}>
        {data.map((item) => (
          <div key={item.name}>
            <label className="font-semibold" htmlFor={item.name}>
              {item.label}
            </label>
            <select
              id={item.name}
              className="bg-white border border-gray-300 rounded p-2 w-full mt-1"
              value={
                quiz[item.name as keyof typeof quiz] ||
                item.options[0]?.value ||
                ""
              }
              onChange={(e) =>
                setQuiz((q) => ({
                  ...q,
                  [item.name]: e.target.value,
                }))
              }
            >
              {item.options.map((option, idx) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
        <div>
          <label className="font-semibold" htmlFor="otherDetails">
            Other Details
          </label>
          <textarea
            id="otherDetails"
            value={quiz.otherDetails}
            onChange={(e) =>
              setQuiz((q) => ({ ...q, otherDetails: e.target.value }))
            }
            className="w-full mt-1 p-2 border rounded"
            placeholder="Anything else useful…"
          />
        </div>
        <div className="mt-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Next: Identify Features
          </button>
        </div>
      </form>
    </div>
  );
}
