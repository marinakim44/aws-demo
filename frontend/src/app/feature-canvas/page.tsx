"use client";

import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, useRef, useEffect } from "react";
import type { Feature, Bucket } from "@/app/types/global.js";
import { initialFeatures, initialBuckets } from "./data";
import { addFeature } from "./crud";
import { BucketColumn } from "@/components/BucketColumn";
import { UnassignedPanel } from "@/components/UnassignedPanel";

export default function FeatureCanvasPage() {
  const [unassigned, setUnassigned] = useState<Feature[]>(initialFeatures);
  const [buckets, setBuckets] = useState<Bucket[]>(initialBuckets);
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [awsStack, setAwsStack] = useState<{
    sdlc: string;
    architecture: string;
    additionalReply: string;
    services: string[];
    rationale: string;
    dotSpec: string;
  } | null>(null);
  const [newFeatureName, setNewFeatureName] = useState("");
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureName, setEditingFeatureName] = useState("");
  const [loading, setLoading] = useState(false);

  const diagramRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!awsStack?.dotSpec || !diagramRef.current) return;

    (async () => {
      try {
        const [{ default: Viz }, { render, Module }] = await Promise.all([
          import("viz.js"),
          import("viz.js/full.render"),
        ]);
        const viz = new Viz({ Module, render });
        const svgElem = await viz.renderSVGElement(awsStack.dotSpec);
        diagramRef.current!.innerHTML = "";
        diagramRef.current!.appendChild(svgElem);
      } catch (err) {
        console.error(err);
        diagramRef.current!.textContent = "Error rendering diagram.";
      }
    })();
  }, [awsStack]);

  const getSuggestion = async () => {
    setLoading(true);
    const quizInput = JSON.parse(localStorage.getItem("quizInputData") || "{}");
    const res = await fetch("http://localhost:4000/api/recommend-stack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizInput, buckets, additionalNotes }),
    });
    if (!res.ok) return;
    const { awsStack } = await res.json();
    setAwsStack(awsStack);
    localStorage.setItem("awsRecommendation", JSON.stringify(awsStack));
    setLoading(false);
  };

  return (
    <div className="max-w-[1500px] m-auto">
      <div className="flex space-x-2 w-[300px] pt-10 pl-8">
        <input
          type="text"
          placeholder="New feature…"
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={() =>
            addFeature(newFeatureName, setUnassigned, setNewFeatureName)
          }
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Add Feature
        </button>
      </div>

      <DndProvider backend={HTML5Backend}>
        <div className="p-8 grid grid-cols-5 gap-4">
          <UnassignedPanel
            unassigned={unassigned}
            setUnassigned={setUnassigned}
            setBuckets={setBuckets}
            setEditingFeatureId={setEditingFeatureId}
            setEditingFeatureName={setEditingFeatureName}
            editingFeatureId={editingFeatureId}
            editingFeatureName={editingFeatureName}
          />

          {buckets.map((bucket) => (
            <BucketColumn
              key={bucket.id}
              bucket={bucket}
              setBuckets={setBuckets}
              setUnassigned={setUnassigned}
              setEditingFeatureId={setEditingFeatureId}
              setEditingFeatureName={setEditingFeatureName}
              editingFeatureId={editingFeatureId}
              editingFeatureName={editingFeatureName}
            />
          ))}
        </div>

        <div className="p-8">
          <label className="block font-semibold mb-2">
            Additional notes / requirements:
          </label>
          <textarea
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            className="w-full p-2 border rounded"
            rows={3}
            placeholder="Any extra context for the AI..."
          />
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={getSuggestion}
            className="px-6 py-3 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Loading..." : "Get AWS Stack Recommendation"}
          </button>
        </div>

        {awsStack && (
          <div className="mt-8 mb-20 p-8 m-8 border rounded bg-gray-50">
            <div className="max-w-[500px]">
              <h2 className="text-xl font-semibold mb-2">
                AWS Stack Recommendation
              </h2>

              <div className="flex space-x-4">
                <div>
                  <p className="font-semibold">SDLC:</p>
                  <p className="mb-4">{awsStack.sdlc}</p>
                </div>

                <div>
                  <p className="font-semibold">Architecture:</p>
                  <p className="mb-4">{awsStack.architecture}</p>
                </div>
              </div>

              <p className="font-semibold">Additional info:</p>
              <p className="mb-4">{awsStack.additionalReply}</p>

              <p className="font-semibold">Services:</p>
              <ul className="list-disc list-inside mb-4">
                {awsStack.services.map((svc) => (
                  <li key={svc}>{svc}</li>
                ))}
              </ul>

              <p className="font-semibold">Rationale:</p>
              <p className="mb-4">{awsStack.rationale}</p>
            </div>

            <p className="font-semibold">Architecture Diagram:</p>
            <div
              ref={diagramRef}
              className="mt-4 border rounded bg-gray-100 p-4"
            >
              {awsStack.dotSpec ? (
                <pre className="whitespace-pre-wrap">{awsStack.dotSpec}</pre>
              ) : (
                <p>No diagram available</p>
              )}
            </div>
          </div>
        )}
      </DndProvider>
    </div>
  );
}
