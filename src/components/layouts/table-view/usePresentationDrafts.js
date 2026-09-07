import { useState } from "react";
import { changedProperties } from "@/utils/tablePresentationUpdate";

// Drafts survive item, section and view switches. Server refreshes from a drag
// or another item's Update must never erase an unfinished edit.
export default function usePresentationDrafts(editor, moduleKey, viewKey) {
  const [drafts, setDrafts] = useState({});
  const keyFor = (kind, id) => JSON.stringify([moduleKey, viewKey, kind, id]);
  const patch = (kind, id, changes) => {
    if (editor.writing) return;
    const key = keyFor(kind, id);
    setDrafts((current) => ({ ...current, [key]: { ...current[key], ...changes } }));
  };
  const reset = (kind, id) => {
    const key = keyFor(kind, id);
    setDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };
  const decorate = (kind, item) => {
    const id = kind === "column" ? item.accessor : item.key;
    const changes = changedProperties(item, drafts[keyFor(kind, id)]);
    return { ...item, ...changes, dirty: Object.keys(changes).length > 0 };
  };
  const update = async (kind, item) => {
    const id = kind === "column" ? item.accessor : item.key;
    const source = kind === "column"
      ? editor.columns.find((column) => column.accessor === id)
      : editor.statuses.find((status) => status.key === id);
    const changes = changedProperties(source, drafts[keyFor(kind, id)]);
    if (!Object.keys(changes).length) return;
    if (await editor.updatePresentation(kind, id, changes)) reset(kind, id);
  };
  return {
    columns: editor.columns.map((item) => decorate("column", item)),
    statuses: editor.statuses.map((item) => decorate("status", item)),
    patch, reset, update,
  };
}
