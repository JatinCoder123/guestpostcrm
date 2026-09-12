/**
 * Everything this view lets you change about one status stat.
 *
 * Same contract-driven rule as the column inspector: a row is live only if the
 * compiled view returned a mutation for that property, and read-only with a
 * reason otherwise.
 */

import React from "react";

import { Save } from "lucide-react";

import IconInput from "@/components/IconInput";

import { GhostButton, PrimaryButton, ReadOnlyValue } from "./Primitives";
import { BoolRow, CapabilitySummary, TextRow } from "./PropertyRows";

import { STATUS_PROPERTIES } from "@/utils/tableLayout";

export default function StatusInspector({
  status,
  onPatch,
  onSetIcon,
  onUpdate,
  onReset,
  dirty,
  busy,
}) {
  const entry = (property) => status.presentation?.[property];
  const set = (property) => (value) => onPatch({ [property]: value });

  const iconValue =
    status.icon?.library && status.icon?.name
      ? { library: status.icon.library, name: status.icon.name }
      : null;

  const iconWritable = Boolean(entry("icon")?.writable);

  const labelInvalid = !String(status.label ?? "").trim();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <h3 className="truncate text-base font-semibold text-foreground">
          {status.label}
        </h3>

        <p className="mt-1 text-sm text-muted-foreground">Status settings</p>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <CapabilitySummary item={status} properties={STATUS_PROPERTIES} />

        <TextRow
          property="label"
          value={status.label}
          entry={entry("label")}
          busy={busy}
          onChange={set("label")}
          placeholder="Status name"
          hint="Shown above the count in the table's status row."
          error={labelInvalid ? "A name is required." : null}
        />

        <ReadOnlyValue
          label="Status key"
          value={status.key}
          mono
          hint="What the stat filters on. Renaming the status does not change it."
        />

        <BoolRow
          property="visible"
          value={status.visible}
          entry={entry("visible")}
          busy={busy}
          onChange={set("visible")}
          title="Show status"
          description="Hidden stats stay in the layout and can be shown again without republishing."
        />

        <div role="group" aria-labelledby="status-icon-label">
          <p
            id="status-icon-label"
            className="mb-1.5 block text-xs font-medium text-foreground"
          >
            Icon
          </p>

          <IconInput
            value={iconValue}
            onChange={(icon) => onSetIcon(status, icon)}
            placeholder="Choose an icon"
            disabled={!iconWritable || busy}
            className="[&>div]:w-full"
          />

          {!iconWritable && (
            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              Fixed by the published layout.
            </p>
          )}
        </div>

        <TextRow
          property="color"
          value={status.color}
          entry={entry("color")}
          busy={busy}
          onChange={set("color")}
          placeholder="emerald"
          hint="The accent the stat is drawn in, as the table's own color token."
        />

        <BoolRow
          property="showAmount"
          value={status.showAmount}
          entry={entry("showAmount")}
          busy={busy}
          onChange={set("showAmount")}
          title="Show amount"
          description={
            status.amountKey
              ? `Totals ${status.amountKey} beside the count.`
              : "Totals a currency field beside the count, when the layout names one."
          }
        />
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border p-4">
        {dirty && (
          <span role="status" className="mr-auto text-xs text-muted-foreground">
            Unsaved changes
          </span>
        )}

        <GhostButton onClick={onReset} disabled={!dirty || busy}>
          Reset
        </GhostButton>

        <PrimaryButton
          icon={Save}
          onClick={onUpdate}
          disabled={!dirty || labelInvalid}
          busy={busy}
        >
          Update Status
        </PrimaryButton>
      </div>
    </div>
  );
}
