/**
 * Everything this view lets you change about one layout node.
 *
 * Contract-driven, the same way the table editor's inspectors are: a row is
 * live only if Flexibility returned a mutation for that property on this node,
 * and read-only with a reason if it did not. Before this the pane offered
 * exactly one control - visibility - and showed the name and the ordering key as
 * permanently disabled inputs, which said nothing about whether they were
 * unwritable or merely unimplemented.
 *
 * The ordering key is gone entirely. It was an opaque generated string shown in
 * a disabled box with "drag the item on the left to change it" underneath, which
 * is a row that answers no question the user has.
 */

import React from "react";

import { Save, Settings2 } from "lucide-react";

import {
  GhostButton,
  PrimaryButton,
  ReadOnlyValue,
} from "@/components/layouts/shared/Primitives";

import {
  BoolRow,
  CapabilitySummary,
  NumberRow,
  TextRow,
} from "@/components/layouts/shared/PropertyRows";

import FieldTypeIcon from "@/components/layouts/shared/FieldTypeIcon";

import {
  namePropertyFor,
  nodeEntry,
  nodeProperties,
} from "@/utils/detailEditLayout";

import { titleOf } from "./draftChanges";

const TYPES = {
  block: "Block",
  tab: "Tab",
  section: "Section",
  field: "Field",
};

export default function NodeInspector({
  selection,
  item,
  isNew,
  busy,
  dirty,
  viewKey,
  onPatch,
  onReset,
  onUpdate,
  onRemove,
}) {
  if (!item) {
    return (
      <div className="flex h-full min-h-[200px] flex-col items-center justify-center p-8 text-center">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl border border-border bg-muted/20">
          <Settings2 className="h-5 w-5 text-muted-foreground" />
        </div>

        <h3 className="text-sm font-semibold">Nothing selected</h3>

        <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
          Select a block, tab, section or field to configure it.
        </p>
      </div>
    );
  }

  const scopeType = selection.scope.type;
  const nameProperty = namePropertyFor(item, scopeType);
  const properties = nodeProperties(item, scopeType, viewKey);

  /* A create form is all inputs, so it has no inline-editing settings. */
  const creating = viewKey === "create";

  const entry = (property) => nodeEntry(item, property);
  const set = (property) => (value) => onPatch({ [property]: value });

  const nameInvalid = !String(item[nameProperty] ?? titleOf(item)).trim();

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          {scopeType === "field" ? (
            <FieldTypeIcon type={item.type} />
          ) : (
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border bg-background text-muted-foreground">
              <Settings2 className="h-4 w-4" />
            </span>
          )}

          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              {TYPES[scopeType]}
            </p>

            <h3 className="truncate text-base font-semibold">{titleOf(item)}</h3>
          </div>
        </div>
      </div>

      <div className="custom-scrollbar min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {isNew ? (
          /*
           * A staged addition has no presentation block at all, so every row
           * below would render locked and the capability summary would blame
           * the contract for something that is simply not saved yet. Say what
           * is actually true instead.
           */
          <div className="rounded-xl border border-primary/30 bg-primary/[0.06] p-3">
            <p className="text-xs font-medium text-primary">Not saved yet</p>

            <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
              This {scopeType} only exists in the editor. Its settings become
              editable once it is part of the published layout.
            </p>

            {onRemove && (
              <div className="mt-2">
                <GhostButton tone="danger" onClick={onRemove} disabled={busy}>
                  Remove
                </GhostButton>
              </div>
            )}
          </div>
        ) : (
          <CapabilitySummary item={item} properties={properties} />
        )}

        <TextRow
          property={nameProperty}
          value={item[nameProperty] ?? titleOf(item)}
          entry={entry(nameProperty)}
          busy={busy}
          onChange={set(nameProperty)}
          placeholder={`${TYPES[scopeType]} name`}
          hint={`Shown as this ${scopeType}'s heading.`}
          error={nameInvalid ? "A name is required." : null}
        />

        {scopeType === "field" && (
          <ReadOnlyValue
            label="Source field"
            value={item.accessor}
            mono
            hint={`Read as ${item.type || "text"}. The field a row reads from is set when it is added.`}
          />
        )}

        <BoolRow
          property="visible"
          value={item.visible !== false}
          entry={entry("visible")}
          busy={busy}
          onChange={set("visible")}
          title={`Show ${scopeType}`}
          description={`Hidden ${scopeType}s stay in the layout and can be shown again without republishing.`}
        />

        {scopeType === "section" && (
          <NumberRow
            property="columns"
            value={item.columns ?? 1}
            entry={entry("columns")}
            busy={busy}
            onCommit={set("columns")}
            min={1}
            max={4}
            hint="How many fields sit side by side in this section. 1 to 4."
          />
        )}

        {(scopeType === "section" || scopeType === "field") && !creating && (
          <BoolRow
            property="editable"
            value={Boolean(item.editable)}
            entry={entry("editable")}
            busy={busy}
            onChange={set("editable")}
            title="Editable inline"
            description={
              scopeType === "section"
                ? "Allows this section's fields to be edited from the record page."
                : "Allows this field to be edited from the record page."
            }
          />
        )}

        {scopeType === "field" && !creating && (
          /*
            Not the inverse of Editable. The contract sends both, so a field can
            be editable in principle and read only in this view.
          */
          <BoolRow
            property="readonly"
            value={Boolean(item.readonly)}
            entry={entry("readonly")}
            busy={busy}
            onChange={set("readonly")}
            title="Read only"
            description="Shows the value but refuses edits, even where the section allows them."
          />
        )}

        {scopeType === "field" && (
          <>
            <BoolRow
              property="required"
              value={Boolean(item.required)}
              entry={entry("required")}
              busy={busy}
              onChange={set("required")}
              title="Required"
              description="The record cannot be saved with this field empty."
            />

            <TextRow
              property="placeholder"
              value={item.placeholder ?? ""}
              entry={entry("placeholder")}
              busy={busy}
              onChange={set("placeholder")}
              placeholder={`Enter ${String(item.label ?? "value").toLowerCase()}`}
              hint="Greyed-out hint shown while the field is empty."
            />
          </>
        )}
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
          disabled={!dirty || nameInvalid || isNew}
          busy={busy}
        >
          Update {TYPES[scopeType]}
        </PrimaryButton>
      </div>
    </div>
  );
}
