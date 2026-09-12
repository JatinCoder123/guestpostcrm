/**
 * Everything this view lets you change about one column.
 *
 * The controls are driven by the contract, not by this file: each row is live
 * only if Flexibility returned a mutation for that property on this column, and
 * read-only with a reason if it did not. So the same inspector correctly
 * describes a view where only visibility is overridable and one where the name,
 * the flags and the width bounds all are.
 *
 * Edits go into the draft layer and are published by Update Column, which is
 * what lets several properties of one column go out together instead of firing
 * a write per keystroke.
 */

import React from "react";

import { Save } from "lucide-react";

import { GhostButton, PrimaryButton, ReadOnlyValue } from "./Primitives";
import { BoolRow, CapabilitySummary, NumberRow, TextRow } from "./PropertyRows";
import FieldTypeIcon from "./FieldTypeIcon";

import { COLUMN_PROPERTIES, WIDTH_MAX, WIDTH_MIN } from "@/utils/tableLayout";

export default function ColumnInspector({
  column,
  onPatch,
  onUpdate,
  onReset,
  dirty,
  busy,
}) {
  const entry = (property) => column.presentation?.[property];
  const set = (property) => (value) => onPatch({ [property]: value });

  /*
   * A blank header is refused before it is staged rather than after. The
   * mutation builder throws on an empty label, and a toast at publish time is a
   * worse place to learn it than the field itself.
   */
  const labelInvalid = !String(column.label ?? "").trim();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <FieldTypeIcon type={column.type} />

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">
              {column.label}
            </h3>

            <p className="mt-1 text-sm text-muted-foreground">Column settings</p>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        <CapabilitySummary item={column} properties={COLUMN_PROPERTIES} />

        <TextRow
          property="label"
          value={column.label}
          entry={entry("label")}
          busy={busy}
          onChange={set("label")}
          placeholder="Column header"
          hint="Shown in the table's column header."
          error={labelInvalid ? "A name is required." : null}
        />

        <ReadOnlyValue
          label="Source field"
          value={column.accessor}
          mono
          hint={`Read as ${column.type}. The field a column reads from is set when it is added.`}
        />

        <BoolRow
          property="visible"
          value={column.visible}
          entry={entry("visible")}
          busy={busy}
          onChange={set("visible")}
          title="Show column"
          description="Hidden columns stay in the layout and can be shown again without republishing."
        />

        <BoolRow
          property="sortable"
          value={column.sortable}
          entry={entry("sortable")}
          busy={busy}
          onChange={set("sortable")}
          description="Lets the header be clicked to sort, and lists the column in the sort menu."
        />

        <BoolRow
          property="searchable"
          value={column.searchable}
          entry={entry("searchable")}
          busy={busy}
          onChange={set("searchable")}
          description="Includes the column in the table's search box."
        />

        <BoolRow
          property="editable"
          value={column.editable}
          entry={entry("editable")}
          busy={busy}
          onChange={set("editable")}
          title="Editable inline"
          description="Allows the cell to be edited from the table by double-clicking it."
        />

        <BoolRow
          property="resizable"
          value={column.resizable}
          entry={entry("resizable")}
          busy={busy}
          onChange={set("resizable")}
          description="Allows the column's edge to be dragged in the table."
        />

        <NumberRow
          property="width"
          value={column.width}
          entry={entry("width")}
          busy={busy}
          onCommit={set("width")}
          min={column.minWidth ?? WIDTH_MIN}
          max={column.maxWidth ?? WIDTH_MAX}
          hint={`Allowed ${column.minWidth ?? WIDTH_MIN}-${column.maxWidth ?? WIDTH_MAX}px for this column.`}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <NumberRow
            property="minWidth"
            value={column.minWidth}
            entry={entry("minWidth")}
            busy={busy}
            onCommit={set("minWidth")}
            hint={`${WIDTH_MIN}px or more.`}
          />

          <NumberRow
            property="maxWidth"
            value={column.maxWidth}
            entry={entry("maxWidth")}
            busy={busy}
            onCommit={set("maxWidth")}
            hint={`${WIDTH_MAX}px or less.`}
          />
        </div>
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
          Update Column
        </PrimaryButton>
      </div>
    </div>
  );
}
