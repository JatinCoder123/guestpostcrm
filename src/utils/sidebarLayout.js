/**
 * Shared model for the sidebar layout coming out of:
 *
 *   index.php?entryPoint=flexibility&global_component_name=Sidebar
 *
 * Both the layout editor (settings/layout) and the live
 * sidebar read through here, so what you arrange in the
 * editor is exactly what renders in the app.
 *
 * Two backend fields drive everything:
 *
 *   weight     integer, ascending. Sort order.
 *   is_active  1 / 0. Whether it shows in the sidebar.
 *
 * Both live on outr_ui_groups and outr_ui_modules.
 */

/**
 * The CRM seeds groups in steps of 10:
 *
 *      10, 20, 30, 40, 50, 60
 *
 * The gaps are the point. Dropping a record between two
 * others usually just needs the midpoint, so a reorder
 * costs one write instead of renumbering the list.
 */
export const WEIGHT_STEP = 10;

/**
 * Records with no usable weight sort to the end of the
 * list rather than the front.
 */
const UNWEIGHTED = Number.MAX_SAFE_INTEGER;

export const toWeight = (value, fallback = null) => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? Math.trunc(parsed) : fallback;
};

export const sortByWeight = (items) =>
  [...items].sort(
    (a, b) => toWeight(a?.weight, UNWEIGHTED) - toWeight(b?.weight, UNWEIGHTED),
  );

/**
 * The endpoint sends is_active as 1 / "1" for groups and
 * fields alike, and local state holds it as a boolean.
 * Read all of those the same way.
 *
 * Anything unrecognised counts as active, so a record
 * never disappears from the sidebar because of an
 * unexpected value.
 */
export const isActive = (record) => {
  const value = record?.is_active;

  if (value === undefined || value === null || value === "") {
    return true;
  }

  if (typeof value === "boolean") {
    return value;
  }

  return String(value) !== "0" && String(value).toLowerCase() !== "false";
};

/**
 * The value to send for is_active. The column is numeric.
 */
export const toActiveFlag = (active) => (active ? 1 : 0);

/**
 * Locally created records have no server row yet,
 * so they can never be written to.
 */
export const isPersistableId = (id) =>
  id !== null && id !== undefined && !String(id).startsWith("local-");

/**
 * Put the response into weight order and coerce weight and
 * is_active into consistent types.
 *
 * We deliberately do NOT renumber. The weight belongs to
 * the backend: someone can set a group to 20 in the CRM
 * and that is exactly what the editor shows.
 *
 * The endpoint does not return groups in weight order, so
 * this sort is what produces the on-screen order.
 * Array.prototype.sort is stable, so records sharing a
 * weight (or missing one) keep the order the server sent.
 */
export function normalizeSidebarResponse(response) {
  const groups = Array.isArray(response) ? response : response?.data || [];

  return sortByWeight(groups).map((group) => {
    const fields = Array.isArray(group.data) ? group.data : [];

    return {
      ...group,

      weight: toWeight(group.weight),

      is_active: isActive(group),

      data: sortByWeight(fields).map((item) => ({
        ...item,

        weight: toWeight(item.weight),

        is_active: isActive(item),
      })),
    };
  });
}

/**
 * Narrow normalized data down to what the live sidebar
 * should render.
 *
 * A group is dropped when it is inactive, and also when
 * every field inside it is inactive - an empty heading is
 * just noise.
 */
export function selectVisibleGroups(groups) {
  return groups
    .filter(isActive)
    .map((group) => ({
      ...group,
      data: (group.data ?? []).filter(isActive),
    }))
    .filter((group) => group.data.length > 0);
}

/**
 * Pick a weight that sits strictly between two
 * neighbours, or null when no integer fits.
 */
const slotWeight = (before, after) => {
  /* Dropped at the top of the list. */
  if (before === null) {
    if (after === null) {
      return WEIGHT_STEP;
    }

    const candidate = after - WEIGHT_STEP;

    /* Leave room above, and never go to zero or below. */
    return candidate > 0 ? candidate : null;
  }

  /* Dropped at the bottom of the list. */
  if (after === null) {
    return before + WEIGHT_STEP;
  }

  /* No integer exists strictly between the neighbours. */
  if (after - before < 2) {
    return null;
  }

  return before + Math.floor((after - before) / 2);
};

/**
 * Respace an entire list on WEIGHT_STEP.
 *
 * Only used as a fallback, when the neighbours the record
 * was dropped between are too close together to hold
 * another integer.
 */
const respace = (items) =>
  items.map((item, index) => ({
    ...item,
    weight: (index + 1) * WEIGHT_STEP,
  }));

/**
 * Given a list already in its new visual order and the
 * index the moved record landed on, return the list with
 * whatever weights are needed to make that order stick.
 *
 * Cheap path: one record changes.
 * Fallback: the whole list is respaced.
 */
export function planReorder(ordered, movedIndex) {
  const before =
    movedIndex > 0 ? toWeight(ordered[movedIndex - 1]?.weight) : null;

  const after =
    movedIndex < ordered.length - 1
      ? toWeight(ordered[movedIndex + 1]?.weight)
      : null;

  const slotted = slotWeight(before, after);

  if (slotted === null) {
    return respace(ordered);
  }

  const next = [...ordered];

  next[movedIndex] = {
    ...next[movedIndex],
    weight: slotted,
  };

  return next;
}

/**
 * Compare two versions of the same list and return only
 * the records whose weight actually changed.
 *
 * Because normalization never rewrites weights, the
 * previous list still holds what the backend holds, so
 * this diff is exact.
 */
export function collectWeightChanges(previous, next) {
  const previousWeights = new Map();

  previous.forEach((item) => {
    if (!isPersistableId(item?.id)) {
      return;
    }

    previousWeights.set(String(item.id), toWeight(item.weight));
  });

  return next.filter((item) => {
    if (!isPersistableId(item?.id)) {
      return false;
    }

    return previousWeights.get(String(item.id)) !== toWeight(item.weight);
  });
}
