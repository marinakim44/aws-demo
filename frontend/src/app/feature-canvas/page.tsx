"use client";

import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useState, useRef, useEffect } from "react";

// mini helper
function removeFromAll(buckets: Bucket[], feat: Feature): Bucket[] {
  return buckets.map((b) => ({
    ...b,
    features: b.features.filter((f) => f.id !== feat.id),
  }));
}

type Feature = {
  id: string;
  name: string;
};
type Bucket = {
  id: string;
  name: string;
  features: Feature[];
};

const initialFeatures: Feature[] = [
  { id: "f1", name: "User Authentication" },
  { id: "f2", name: "Real-Time Chat" },
  { id: "f3", name: "Reporting" },
  { id: "f4", name: "Public API" },
];

const initialBuckets: Bucket[] = [
  { id: "interactive", name: "Interactive", features: [] },
  { id: "async", name: "Async", features: [] },
  { id: "batch", name: "Batch", features: [] },
  { id: "public", name: "Public API", features: [] },
];

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

  // Editing state
  const [editingFeatureId, setEditingFeatureId] = useState<string | null>(null);
  const [editingFeatureName, setEditingFeatureName] = useState("");
  const [loading, setLoading] = useState(false);

  const addFeature = () => {
    const name = newFeatureName.trim();
    if (!name) return;
    const id = `f_${Date.now()}`;
    setUnassigned((u) => [...u, { id, name }]);
    setNewFeatureName("");
  };

  const removeFeature = (feat: Feature) => {
    setUnassigned((u) => u.filter((f) => f.id !== feat.id));
    setBuckets((all) =>
      all.map((b) => ({
        ...b,
        features: b.features.filter((f) => f.id !== feat.id),
      }))
    );
  };

  const renameFeature = (featId: string, newName: string) => {
    setUnassigned((u) =>
      u.map((f) => (f.id === featId ? { ...f, name: newName } : f))
    );
    setBuckets((all) =>
      all.map((b) => ({
        ...b,
        features: b.features.map((f) =>
          f.id === featId ? { ...f, name: newName } : f
        ),
      }))
    );
    setEditingFeatureId(null);
  };

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

  // Reusable draggable feature with edit/remove
  type DraggableFeatureProps = {
    feature: Feature;
    onRemove?: (feat: Feature) => void;
    isEditing?: boolean;
    editingName?: string;
    onRenameStart?: (feat: Feature) => void;
    onEditingNameChange?: (val: string) => void;
    onRenameCancel?: () => void;
    onRenameConfirm?: (feat: Feature, newName: string) => void;
  };

  const DraggableFeature = ({
    feature,
    onRemove,
    isEditing,
    editingName,
    onRenameStart,
    onEditingNameChange,
    onRenameCancel,
    onRenameConfirm,
  }: DraggableFeatureProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const [, dragRef] = useDrag<Feature, void, unknown>(() => ({
      type: "FEATURE",
      item: feature,
    }));

    // attach drag to root
    useEffect(() => {
      const node = rootRef.current;
      if (!node) return;
      if (!isEditing) dragRef(node);
      return () => {
        dragRef(null);
      };
    }, [dragRef, isEditing]);

    // focus input when editing
    useEffect(() => {
      if (isEditing && inputRef.current) {
        inputRef.current.focus();
        const len = inputRef.current.value.length;
        inputRef.current.setSelectionRange(len, len);
      }
    }, [isEditing, editingName]);

    return (
      <div
        ref={rootRef}
        className="p-2 mb-2 bg-gray-100 rounded flex items-center justify-between text-sm"
      >
        {isEditing ? (
          <div className="flex-1 flex space-x-2">
            <input
              ref={inputRef}
              className="flex-1 p-1 border rounded"
              value={editingName}
              onChange={(e) => onEditingNameChange?.(e.target.value)}
            />
            <button
              onClick={() => onRenameConfirm?.(feature, editingName!)}
              className="text-green-600 hover:text-green-800"
            >
              ✓
            </button>
            <button
              onClick={onRenameCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              ✕
            </button>
          </div>
        ) : (
          <>
            <span>{feature.name}</span>
            <div className="flex space-x-1">
              <button
                onClick={() => onRenameStart?.(feature)}
                className="text-blue-600 hover:text-blue-800"
              >
                ✎
              </button>
              {onRemove && (
                <button
                  onClick={() => onRemove(feature)}
                  className="text-red-500 hover:text-red-700"
                >
                  ✕
                </button>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  const BucketColumn = ({
    bucket,
    setBuckets,
    setUnassigned,
  }: {
    bucket: Bucket;
    setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
    setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>;
  }) => {
    const [, dropRef] = useDrop<Feature, void, unknown>(() => ({
      accept: "FEATURE",
      drop: (feat) => {
        setBuckets((all) => removeFromAll(all, feat));
        setUnassigned((u) => u.filter((f) => f.id !== feat.id));
        setBuckets((all) =>
          all.map((b) =>
            b.id === bucket.id ? { ...b, features: [...b.features, feat] } : b
          )
        );
      },
    }));

    return (
      <div
        ref={(node) => {
          dropRef(node);
        }}
        className="col-span-1 p-4 border rounded min-h-[200px]"
      >
        <h2 className="font-bold mb-2">{bucket.name}</h2>
        {bucket.features.map((feat) => (
          <DraggableFeature
            key={feat.id}
            feature={feat}
            onRemove={removeFeature}
            onRenameStart={(f) => {
              setEditingFeatureId(f.id);
              setEditingFeatureName(f.name);
            }}
            isEditing={editingFeatureId === feat.id}
            editingName={editingFeatureName}
            onEditingNameChange={setEditingFeatureName}
            onRenameCancel={() => setEditingFeatureId(null)}
            onRenameConfirm={(f, newName) => renameFeature(f.id, newName)}
          />
        ))}
      </div>
    );
  };

  const UnassignedPanel = ({
    unassigned,
    setUnassigned,
    setBuckets,
  }: {
    unassigned: Feature[];
    setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>;
    setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
  }) => {
    const [, dropRef] = useDrop<Feature, void, unknown>(() => ({
      accept: "FEATURE",
      drop: (feat) => {
        setBuckets((all) => removeFromAll(all, feat));
        setUnassigned((u) =>
          u.some((f) => f.id === feat.id) ? u : [...u, feat]
        );
      },
    }));

    return (
      <div
        ref={(node) => {
          dropRef(node);
        }}
        className="col-span-1 p-4 border rounded min-h-[200px]"
      >
        <h2 className="font-bold mb-2">Features</h2>
        <p className="text-xs italic mb-2">
          Add your features here before distributing them into feature buckets.
          Examples added for you
        </p>
        {unassigned.map((feat) => (
          <DraggableFeature
            key={feat.id}
            feature={feat}
            onRemove={removeFeature}
            onRenameStart={(f) => {
              setEditingFeatureId(f.id);
              setEditingFeatureName(f.name);
            }}
            isEditing={editingFeatureId === feat.id}
            editingName={editingFeatureName}
            onEditingNameChange={setEditingFeatureName}
            onRenameCancel={() => setEditingFeatureId(null)}
            onRenameConfirm={(f, newName) => renameFeature(f.id, newName)}
          />
        ))}
      </div>
    );
  };

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
    <div className="max-w-[1200px] m-auto">
      <div className="flex space-x-2 w-[300px] pt-10 pl-8">
        <input
          type="text"
          placeholder="New feature…"
          value={newFeatureName}
          onChange={(e) => setNewFeatureName(e.target.value)}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={addFeature}
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
          />

          {buckets.map((bucket) => (
            <BucketColumn
              key={bucket.id}
              bucket={bucket}
              setBuckets={setBuckets}
              setUnassigned={setUnassigned}
            />
          ))}
        </div>

        {/* Additional notes input */}
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
          <div className="mt-8 p-4 border rounded bg-gray-50">
            <h2 className="text-xl font-semibold mb-2">
              AWS Stack Recommendation
            </h2>

            <p className="font-semibold">SDLC:</p>
            <p className="mb-4">{awsStack.sdlc}</p>

            <p className="font-semibold">Architecture:</p>
            <p className="mb-4">{awsStack.architecture}</p>

            <p className="font-semibold">Additional Reply:</p>
            <p className="mb-4">{awsStack.additionalReply}</p>

            <p className="font-semibold">Services:</p>
            <ul className="list-disc list-inside mb-4">
              {awsStack.services.map((svc) => (
                <li key={svc}>{svc}</li>
              ))}
            </ul>

            <p className="font-semibold">Rationale:</p>
            <p className="mb-4">{awsStack.rationale}</p>

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
