import type { Feature, Bucket } from "@/app/types/global";
import {
  removeFromAll,
  removeFeature,
  renameFeature,
} from "@/app/feature-canvas/crud";
import { useDrop } from "react-dnd";
import { DraggableFeature } from "./DraggableFeature";

export const UnassignedPanel = ({
  unassigned,
  setUnassigned,
  setBuckets,
  setEditingFeatureId,
  setEditingFeatureName,
  editingFeatureId,
  editingFeatureName,
}: {
  unassigned: Feature[];
  setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>;
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>;
  setEditingFeatureId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingFeatureName: React.Dispatch<React.SetStateAction<string>>;
  editingFeatureId: string | null;
  editingFeatureName: string;
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
