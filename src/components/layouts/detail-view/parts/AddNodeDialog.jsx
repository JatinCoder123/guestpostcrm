/**
 * Add a tab or a section to the draft.
 *
 * Fields do not come through here - they come from the field library, which
 * knows the module's vardefs and so cannot produce an accessor that does not
 * exist. A tab or section has no vardef behind it, only a name, so a name is
 * all this asks for.
 *
 * What it produces is a DRAFT node. The compiled detail/create contract returns
 * no create affordance for a layout node, so it stages and is reported as
 * unpublishable at Repair rather than being written. That is the same deal the
 * previous version of this editor offered, except the staged item is now visible
 * and removable instead of silently blocking every other change.
 */

import React, { useEffect, useState } from "react";

import { X } from "lucide-react";

import {
  FieldInput,
  GhostButton,
  InlineAlert,
  PrimaryButton,
} from "@/components/layouts/shared/Primitives";

export default function AddNodeDialog({ request, existingNames, onClose, onSubmit }) {
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (request) setLabel("");
  }, [request]);

  useEffect(() => {
    if (!request) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose, request]);

  if (!request) return null;

  const trimmed = label.trim();

  /* The id is derived from the name, so a clash is predictable before submit. */
  const derivedId = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");

  const clash = Boolean(derivedId && existingNames.has(derivedId));

  return (
    <div
      className="fixed inset-0 z-[9999] grid place-items-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-node-title"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-foreground/40 backdrop-blur-sm"
      />

      <form
        onSubmit={(event) => {
          event.preventDefault();

          if (trimmed && !clash) onSubmit(trimmed);
        }}
        className="relative max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              New {request.type}
            </p>

            <h3 id="add-node-title" className="mt-1 text-lg font-semibold">
              Add {request.type}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 space-y-4">
          <InlineAlert tone="warning" title="Stages only">
            A {request.type} has no source field behind it, so this view's
            contract offers no way to publish one. It stays in the editor, and
            Repair will publish your other changes and skip it.
          </InlineAlert>

          <FieldInput
            id="add-node-label"
            label="Name"
            value={label}
            onChange={setLabel}
            placeholder={`${request.type === "tab" ? "Details" : "Contact information"}`}
            error={clash ? `"${derivedId}" already exists here.` : null}
            hint={derivedId ? `Identifier: ${derivedId}` : "Used to build the identifier."}
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <GhostButton onClick={onClose}>Cancel</GhostButton>

          <PrimaryButton type="submit" disabled={!trimmed || clash}>
            Add {request.type}
          </PrimaryButton>
        </div>
      </form>
    </div>
  );
}
