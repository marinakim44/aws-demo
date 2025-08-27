import type { Feature, Bucket } from "@/app/types/global";
import { DraggableFeature } from "./DraggableFeature";
import { useDrop } from "react-dnd";
import {
  removeFromAll,
  removeFeature,
  renameFeature,
} from "@/app/feature-canvas/crud";

export const BucketColumn = ({
  bucket,
  setBuckets,
  setUnassigned,
  setEditingFeatureId,
  setEditingFeatureName,
  editingFeatureId,
  editingFeatureName,
}: {
  bucket: Bucket;
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
  setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>;
  setEditingFeatureId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingFeatureName: React.Dispatch<React.SetStateAction<string>>;
  editingFeatureId: string | null;
  editingFeatureName: string;
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
      <p className="text-xs italic mb-2">
        {bucket.name === "Interactive"
          ? "Features that respond immediately to authenticated user actions in the UI. E.g. User Authentication, Dashboard Updates"
          : bucket.name === "Public API"
          ? "Unauthenticated HTTP endpoints exposed to external clients or partner systems. E.g. Gift-card lookup API, Third-Party Integrations"
          : bucket.name === "Static content"
          ? "Immutable assets served globally for websites or SPAs. E.g. Marketing pages, Landing page assets"
          : bucket.name === "Async"
          ? "Event-driven or background jobs that run in response to events, but don’t block the user. E.g. Send Email, QR Code Generation"
          : bucket.name === "Batch"
          ? "Scheduled or large-volume jobs that run on a timer or on demand for bulk data. E.g. Daily Reports Generation, Data Export"
          : bucket.name === "Real-time / streaming"
          ? "Real-time data processing and streaming workloads. E.g. Live user activity tracking, Video streaming"
          : bucket.name === "Other"
          ? "Miscellaneous workloads or DevOps tasks that don’t fit other buckets. E.g. CI/CD pipelines, Monitoring & Log Analysis"
          : null}
      </p>

      {bucket.features.map((feat) => (
        <DraggableFeature
          key={feat.id}
          feature={feat}
          onRemove={() => removeFeature(feat, setUnassigned, setBuckets)}
          onRenameStart={(f) => {
            setEditingFeatureId(f.id);
            setEditingFeatureName(f.name);
          }}
          isEditing={editingFeatureId === feat.id}
          editingName={editingFeatureName}
          onEditingNameChange={setEditingFeatureName}
          onRenameCancel={() => setEditingFeatureId(null)}
          onRenameConfirm={(f, newName) =>
            renameFeature(
              f.id,
              newName,
              setUnassigned,
              setBuckets,
              setEditingFeatureId
            )
          }
        />
      ))}
    </div>
  );
};
