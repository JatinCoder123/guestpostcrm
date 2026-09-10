import React from "react";
import { Save } from "lucide-react";
import { GhostButton, PrimaryButton, SwitchRow } from "./Primitives";
import FieldTypeIcon from "./FieldTypeIcon";

export default function ColumnInspector({ column, onToggleVisible, onUpdate, onReset, dirty, busy }) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <FieldTypeIcon type={column.type} />
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-foreground">{column.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">Column settings</p>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-4 p-5">
        <SwitchRow title="Show column" checked={column.visible}
          disabled={!column.presentation?.visible?.writable || busy}
          onChange={() => onToggleVisible(column)} />
        {!column.presentation?.visible?.writable && (
          <p className="text-sm text-muted-foreground">Visibility is fixed for this column.</p>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
        {dirty && <span role="status" className="mr-auto text-xs text-muted-foreground">Unsaved changes</span>}
        <GhostButton onClick={onReset} disabled={!dirty || busy}>Reset</GhostButton>
        <PrimaryButton icon={Save} onClick={onUpdate} disabled={!dirty} busy={busy}>Update Column</PrimaryButton>
      </div>
    </div>
  );
}
