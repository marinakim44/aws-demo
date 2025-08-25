import type { Feature, Bucket } from "../types/global";

export const removeFromAll = (buckets: Bucket[], feat: Feature): Bucket[] => {
  return buckets.map((b) => ({
    ...b,
    features: b.features.filter((f) => f.id !== feat.id),
  }));
};

export const addFeature = (
  newFeatureName: string,
  setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>,
  setNewFeatureName: React.Dispatch<React.SetStateAction<string>>
) => {
  const name = newFeatureName.trim();
  if (!name) return;
  const id = `f_${Date.now()}`;
  setUnassigned((u: Feature[]) => [...u, { id, name }]);
  setNewFeatureName("");
};

export const removeFeature = (
  feat: Feature,
  setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>,
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>
) => {
  setUnassigned((u) => u.filter((f) => f.id !== feat.id));
  setBuckets((all) =>
    all.map((b) => ({
      ...b,
      features: b.features.filter((f) => f.id !== feat.id),
    }))
  );
};

export const renameFeature = (
  featId: string,
  newName: string,
  setUnassigned: React.Dispatch<React.SetStateAction<Feature[]>>,
  setBuckets: React.Dispatch<React.SetStateAction<Bucket[]>>,
  setEditingFeatureId: React.Dispatch<React.SetStateAction<string | null>>
) => {
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
