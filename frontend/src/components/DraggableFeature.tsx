import type { Feature } from "@/app/types/global";
import { useRef, useEffect } from "react";
import { useDrag } from "react-dnd";

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

export const DraggableFeature = ({
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
