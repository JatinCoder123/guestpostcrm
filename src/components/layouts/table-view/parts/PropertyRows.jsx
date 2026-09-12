/**
 * Inspector controls for one presentation property.
 *
 * Each row asks the same question before it renders anything: did Flexibility
 * return a mutation for this property on this item? If not the control is
 * disabled and says why, rather than being hidden or - worse - offered and then
 * failing on save. That is the rule the whole editor runs on; these rows just
 * make it visible one property at a time.
 *
 * Shared by the column and status inspectors so the two cannot drift in how
 * they present a locked property.
 */

import React, { useEffect, useState } from "react";

import { Lock } from "lucide-react";

import { FieldInput, SwitchRow, Toggle } from "./Primitives";
import { PROPERTY_LABELS, WIDTH_MAX, WIDTH_MIN } from "@/utils/tableLayout";

/* =========================================================================
   LOCK BADGE
   ========================================================================= */

function LockedHint() {
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
      <Lock className="h-2.5 w-2.5" />
      Fixed by the published layout
    </span>
  );
}

/* =========================================================================
   TEXT
   ========================================================================= */

export function TextRow({
  property,
  value,
  entry,
  busy,
  onChange,
  placeholder,
  hint,
  error,
}) {
  const writable = Boolean(entry?.writable);

  return (
    <div>
      <FieldInput
        id={`property-${property}`}
        label={PROPERTY_LABELS[property] ?? property}
        value={value ?? ""}
        disabled={!writable || busy}
        placeholder={placeholder}
        onChange={onChange}
        error={writable ? error : null}
        hint={writable ? hint : null}
      />

      {!writable && (
        <p className="mt-1">
          <LockedHint />
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   NUMBER
   ========================================================================= */

/**
 * A number held as text while it is being typed.
 *
 * Committing on every keystroke cannot work here: the draft layer compares
 * values with `JSON.stringify`, so an in-progress `""` or `"1"` on the way to
 * `"120"` would each register as a real change, and a cleared field would
 * commit `0`. So the text is local, and a parsed number is committed on blur or
 * Enter. Anything unparseable reverts to the value that is actually stored,
 * which tells the user the edit did not take.
 */
export function NumberRow({
  property,
  value,
  entry,
  busy,
  onCommit,
  min = WIDTH_MIN,
  max = WIDTH_MAX,
  hint,
}) {
  const writable = Boolean(entry?.writable);

  const [text, setText] = useState(String(value ?? ""));
  const [error, setError] = useState(null);

  /* Resync on Reset, on a refetch, and when another item is selected. */
  useEffect(() => {
    setText(String(value ?? ""));
    setError(null);
  }, [value]);

  const commit = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      setText(String(value ?? ""));
      setError(null);

      return;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed)) {
      setText(String(value ?? ""));
      setError(null);

      return;
    }

    const rounded = Math.round(parsed);

    if (rounded < min || rounded > max) {
      setError(`Must be between ${min} and ${max}.`);

      return;
    }

    setError(null);
    onCommit(rounded);
  };

  return (
    <div>
      <FieldInput
        id={`property-${property}`}
        label={PROPERTY_LABELS[property] ?? property}
        type="number"
        inputMode="numeric"
        value={text}
        disabled={!writable || busy}
        onChange={setText}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        error={writable ? error : null}
        hint={writable ? hint : null}
      />

      {!writable && (
        <p className="mt-1">
          <LockedHint property={property} />
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   BOOLEAN
   ========================================================================= */

export function BoolRow({
  property,
  value,
  entry,
  busy,
  onChange,
  title,
  description,
}) {
  const writable = Boolean(entry?.writable);

  return (
    <div>
      <SwitchRow
        title={title ?? PROPERTY_LABELS[property] ?? property}
        description={description}
        checked={Boolean(value)}
        disabled={!writable || busy}
        onChange={() => onChange(!value)}
      />

      {!writable && (
        <p className="mt-1 pl-3">
          <LockedHint property={property} />
        </p>
      )}
    </div>
  );
}

/* =========================================================================
   CAPABILITY SUMMARY
   ========================================================================= */

/**
 * What this view will and will not let you change.
 *
 * Worth stating in one place rather than leaving the user to infer it from a
 * column of greyed-out switches. Which properties are writable is decided by
 * the compiled contract, not by this editor, so "add an override in the CRM"
 * is the actual next step and the note says so.
 */
export function CapabilitySummary({ item, properties }) {
  const locked = properties.filter(
    (property) => !item?.presentation?.[property]?.writable,
  );

  if (!locked.length) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-muted/20 p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
        <Lock className="h-3 w-3 text-muted-foreground" />
        {locked.length} of {properties.length} settings are fixed
      </p>

      <p className="mt-1 text-[10px] leading-4 text-muted-foreground">
        {locked.map((property) => PROPERTY_LABELS[property] ?? property).join(", ")}
        {" "}
        {locked.length === 1 ? "is" : "are"} part of the published layout. The
        compiled view returns no override for {locked.length === 1 ? "it" : "them"},
        so this editor cannot write {locked.length === 1 ? "it" : "them"} yet.
      </p>
    </div>
  );
}

export { Toggle };
