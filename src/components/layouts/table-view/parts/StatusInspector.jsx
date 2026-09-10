import React from "react";
import { Save } from "lucide-react";
import IconInput from "@/components/IconInput";
import { GhostButton, PrimaryButton, SwitchRow } from "./Primitives";

export default function StatusInspector({ status, onToggleVisible, onSetIcon, onUpdate, onReset, dirty, busy }) {
  const iconValue = status.icon?.library && status.icon?.name
    ? { library: status.icon.library, name: status.icon.name } : null;
  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <h3 className="text-base font-semibold text-foreground">{status.label}</h3>
        <p className="mt-1 text-sm text-muted-foreground">Status settings</p>
      </div>
      <div className="flex-1 space-y-5 p-5">
        <SwitchRow title="Show status" checked={status.visible}
          disabled={!status.presentation?.visible?.writable || busy}
          onChange={() => onToggleVisible(status)} />
        <div role="group" aria-labelledby="status-icon-label">
          <p id="status-icon-label" className="mb-2 text-sm font-medium text-foreground">Icon</p>
          <IconInput value={iconValue} onChange={(icon) => onSetIcon(status, icon)}
            placeholder="Choose an icon" disabled={!status.presentation?.icon?.writable || busy}
            className="[&>div]:w-full" />
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
        {dirty && <span role="status" className="mr-auto text-xs text-muted-foreground">Unsaved changes</span>}
        <GhostButton onClick={onReset} disabled={!dirty || busy}>Reset</GhostButton>
        <PrimaryButton icon={Save} onClick={onUpdate} disabled={!dirty} busy={busy}>Update Status</PrimaryButton>
      </div>
    </div>
  );
}
