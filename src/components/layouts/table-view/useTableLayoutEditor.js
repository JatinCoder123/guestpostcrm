/**
 * All of the table layout editor's state and every write it performs.
 *
 * The write contract, in one place so the components never have to think
 * about it:
 *
 *   - Read the contract for the selected module/view.
 *   - For a presentation edit, clone the mutation that came back beside the
 *     exact value being edited, change only its typed `value_*` field, POST
 *     it, then read the contract back.
 *   - For a structural change, send the guarded `outr_ui_fields` create with
 *     the `configVersion` from the read that is currently on screen.
 *
 * Nothing here invents an owner id, a property path, a record id, an expected
 * value or a revision id, and nothing rewrites a `create` mutation into an
 * `update`. After a successful write the refetch supplies the new record id
 * and the matching update payload.
 *
 * Optimistic state exists only to cover the gap between a click and the
 * refetch that confirms it. It is rolled back on rejection and always
 * replaced by the server's answer, never merged with it.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import toast from "react-hot-toast";

import { reorderCopy } from "@/utils/rank";

import {
  RighteeUiRank,
  UiRankError,
  between,
} from "@/utils/uiRank";

import {
  buildColumnRankMutation,
  buildColumnVisibilityMutation,
  buildColumnWidthMutation,
  buildFieldCreatePayload,
  buildViewRankMutation,
  buildViewVisibilityMutation,
  clampWidth,
  existingAccessors,
  isNoOpChange,
  normalizeTableContract,
} from "@/utils/tableLayout";

import {
  describeMetadataWriteError as describeWriteError,
  isStaleReadError,
} from "@/api/flexibility.api";

import {
  useCreateTableField,
  useUiPropertyWrite,
  useViewContract,
} from "@/queries/flexibility.queries";

/* =========================================================================
   HOOK
   ========================================================================= */

export function useTableLayoutEditor({ moduleKey, viewKey }) {
  /* ---------------------------------------------------------------- read */

  const {
    data: contract,
    isPending: contractPending,
    isFetching: contractFetching,
    error: contractError,
    refetch: refetchContractQuery,
  } = useViewContract(moduleKey, viewKey);

  /* --------------------------------------------------------------- write */

  const propertyWrite = useUiPropertyWrite();
  const fieldCreate = useCreateTableField();

  /* --------------------------------------------------------------- state */

  /**
   * Columns as displayed. Seeded from the server model and briefly ahead of
   * it while a write is in flight.
   */
  const [columns, setColumns] = useState([]);

  /** View-level presentation as displayed. */
  const [view, setView] = useState(null);

  const [selection, setSelection] = useState(null);

  const [search, setSearch] = useState("");

  /** Held for the whole of a reorder, so two drags cannot interleave. */
  const [savingOrder, setSavingOrder] = useState(false);

  /** Accessor currently being written, for per-row spinners. */
  const [busyAccessor, setBusyAccessor] = useState(null);

  /** Missing or duplicated column ranks. Reordering is blocked while set. */
  const [rankError, setRankError] = useState(null);

  /**
   * Writes in flight. While non-zero the sync effect leaves local state
   * alone, so a refetch landing mid-request cannot undo the optimistic view.
   */
  const pendingWrites = useRef(0);

  /* ------------------------------------------------------- server -> local */

  const model = useMemo(() => {
    if (!contract) {
      return null;
    }

    const reports = [];

    const normalized = normalizeTableContract(contract, {
      moduleKey,
      viewKey,
      onInvalidRanks: (report) => reports.push(report),
    });

    return { ...normalized, rankReports: reports };
  }, [contract, moduleKey, viewKey]);

  /**
   * Server payload -> local state.
   *
   * This is deliberately ONE effect covering both "the contract arrived" and
   * "the user picked a different view". It used to be two, and they raced:
   * React runs effects in declaration order within a commit, so on any commit
   * where both fired, the reset wiped the state the sync had just written.
   *
   * That happened whenever `model` was already available on the first commit,
   * which is the normal case when the contract is still in the react-query
   * cache - mounting the tab client-side, or returning to a view visited in
   * the last few minutes. A hard reload emptied the cache, so the first commit
   * had no model, the sync bailed out, and the bug hid itself. Hence "it only
   * works after refreshing".
   *
   * Keying off the view identity instead of ordering removes the race: there
   * is one code path, and it decides what to do by comparing the view the
   * local state belongs to against the view being asked for.
   */
  const syncedKey = useRef(null);

  useEffect(() => {
    const key = `${moduleKey ?? ""}:${viewKey ?? ""}`;

    const sameView = syncedKey.current === key;

    /*
     * A different view. Any optimistic state belongs to the one just left, so
     * it is abandoned rather than carried across.
     */
    if (!sameView) {
      pendingWrites.current = 0;
    }

    /*
     * The contract for this view has not arrived. Clear the previous view's
     * columns so they cannot sit under the new view's heading, but leave
     * already-synced state alone - a background refetch briefly has no data
     * and must not blank the editor.
     */
    if (!model) {
      if (!sameView) {
        syncedKey.current = null;

        setColumns([]);
        setView(null);
        setSelection(null);
        setRankError(null);
        setBusyAccessor(null);
        setSavingOrder(false);
      }

      return;
    }

    /*
     * A write is in flight against this same view, so this payload predates
     * the optimistic state and must not replace it.
     */
    if (sameView && pendingWrites.current > 0) {
      return;
    }

    syncedKey.current = key;

    setColumns(model.columns);
    setView(model.view);

    setRankError(
      model.rankOrderable
        ? null
        : {
            reports: model.rankReports,
            unranked: Boolean(model.rankReport?.unranked),
            message: model.rankReport?.unranked
              ? "These columns have no ranks yet, so they cannot be reordered here."
              : "Column ordering data is invalid, so reordering is disabled until it is fixed.",
          },
    );

    setSelection((current) => {
      /* A new view starts on its own settings, not the last view's column. */
      if (!sameView) {
        return { type: "view" };
      }

      if (current?.type === "view") {
        return current;
      }

      /* Keep the selected column if it survived the refetch. */
      if (
        current?.type === "column" &&
        model.columns.some((column) => column.accessor === current.accessor)
      ) {
        return current;
      }

      return { type: "view" };
    });
  }, [model, moduleKey, viewKey]);

  /* ------------------------------------------------------------ selection */

  const selectedColumn = useMemo(() => {
    if (selection?.type !== "column") {
      return null;
    }

    return (
      columns.find((column) => column.accessor === selection.accessor) ?? null
    );
  }, [columns, selection]);

  const filteredColumns = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return columns;
    }

    return columns.filter(
      (column) =>
        column.label?.toLowerCase().includes(query) ||
        column.accessor?.toLowerCase().includes(query) ||
        column.type?.toLowerCase().includes(query),
    );
  }, [columns, search]);

  /* ------------------------------------------------------------- plumbing */

  /**
   * Every presentation write goes through here, so the bookkeeping that keeps
   * the refetch from clobbering optimistic state lives in exactly one place.
   *
   * `restore` puts the previous local state back when the write is rejected.
   * The refetch that the mutation performs then overwrites it with the
   * server's answer, so the editor never sits on a value that was not stored.
   */
  const runWrite = useCallback(
    async ({ mutation, restore, accessor = null }) => {
      pendingWrites.current += 1;

      if (accessor) {
        setBusyAccessor(accessor);
      }

      try {
        await propertyWrite.mutateAsync({ mutation, moduleKey, viewKey });

        return true;
      } catch (error) {
        restore?.();

        toast.error(describeWriteError(error));

        /*
         * A stale read means the payloads still on screen are no longer
         * valid. The mutation refetches on success only, so the reload is
         * forced here.
         */
        if (isStaleReadError(error)) {
          try {
            await refetchContractQuery();
          } catch {
            /* Reported by the query itself. */
          }
        }

        return false;
      } finally {
        pendingWrites.current = Math.max(0, pendingWrites.current - 1);

        if (accessor) {
          setBusyAccessor(null);
        }
      }
    },
    [moduleKey, propertyWrite, refetchContractQuery, viewKey],
  );

  /** Guard shared by every edit path. */
  const assertWritable = useCallback((entry, what) => {
    if (!entry?.writable) {
      toast.error(
        `${what} is not directly writable on this view. Flexibility returned no mutation for it.`,
      );

      return false;
    }

    return true;
  }, []);

  /* ------------------------------------------------- column visibility */

  const setColumnVisible = useCallback(
    async (column, nextVisible) => {
      const entry = column?.presentation?.visible;

      if (!assertWritable(entry, `Visibility for "${column?.label}"`)) {
        return;
      }

      const next = Boolean(nextVisible);

      if (isNoOpChange(entry, next)) {
        return;
      }

      const previous = columns;

      /* Optimistic. */
      setColumns((current) =>
        current.map((item) =>
          item.accessor === column.accessor ? { ...item, visible: next } : item,
        ),
      );

      await runWrite({
        mutation: buildColumnVisibilityMutation(column, next),
        restore: () => setColumns(previous),
        accessor: column.accessor,
      });
    },
    [assertWritable, columns, runWrite],
  );

  const toggleColumnVisible = useCallback(
    (column) => setColumnVisible(column, !column?.visible),
    [setColumnVisible],
  );

  /* ------------------------------------------------------ column width */

  const setColumnWidth = useCallback(
    async (column, nextWidth) => {
      const entry = column?.presentation?.width;

      if (!assertWritable(entry, `Width for "${column?.label}"`)) {
        return;
      }

      const width = clampWidth(nextWidth, column);

      if (isNoOpChange(entry, width)) {
        return;
      }

      const previous = columns;

      setColumns((current) =>
        current.map((item) =>
          item.accessor === column.accessor ? { ...item, width } : item,
        ),
      );

      await runWrite({
        mutation: buildColumnWidthMutation(column, width),
        restore: () => setColumns(previous),
        accessor: column.accessor,
      });
    },
    [assertWritable, columns, runWrite],
  );

  /* ----------------------------------------------------------- reorder */

  /**
   * Rewrite every column's rank into fresh space above the occupied
   * interval.
   *
   * This is the documented rebalance response: when the fractional space
   * between two neighbours cannot be subdivided, the whole displayed order is
   * replaced rather than the moved item alone.
   *
   * Each write is sent against the contract returned by the previous one,
   * because after the first write the earlier mutation payloads are stale.
   * That is also why this cannot be parallelised.
   */
  const rebalance = useCallback(
    async (displayOrder) => {
      const accessors = displayOrder.map((column) => column.accessor);

      const ranks = RighteeUiRank.rebalanceAbove(
        columns.map((column) => column.rank),
        accessors.length,
      );

      let currentContract = contract;

      for (let index = 0; index < accessors.length; index += 1) {
        const normalized = normalizeTableContract(currentContract, {
          moduleKey,
          viewKey,
        });

        const target = normalized?.columns.find(
          (column) => column.accessor === accessors[index],
        );

        if (!target) {
          continue;
        }

        const entry = target.presentation?.rank;

        if (!entry?.writable) {
          throw new Error(
            `Rank for "${target.label}" is not writable, so the order cannot be rebalanced.`,
          );
        }

        if (isNoOpChange(entry, ranks[index])) {
          continue;
        }

        pendingWrites.current += 1;

        try {
          const result = await propertyWrite.mutateAsync({
            mutation: buildColumnRankMutation(target, ranks[index]),
            moduleKey,
            viewKey,
          });

          currentContract = result.contract;
        } finally {
          pendingWrites.current = Math.max(0, pendingWrites.current - 1);
        }
      }
    },
    [columns, contract, moduleKey, propertyWrite, viewKey],
  );

  /**
   * Move a column to a new position.
   *
   * The rank is calculated between the two columns that will surround it,
   * using the same fractional-indexing algorithm as the backend. The visual
   * position is never turned into an index or a weight.
   */
  const moveColumn = useCallback(
    async (activeAccessor, destinationIndex) => {
      if (savingOrder) {
        return;
      }

      if (rankError) {
        toast.error(rankError.message);

        return;
      }

      const moved = columns.find(
        (column) => column.accessor === activeAccessor,
      );

      if (!moved) {
        return;
      }

      const entry = moved.presentation?.rank;

      if (!assertWritable(entry, `Position for "${moved.label}"`)) {
        return;
      }

      const previous = columns;

      const reordered = reorderCopy(columns, activeAccessor, destinationIndex);

      const landedIndex = reordered.findIndex(
        (column) => column.accessor === activeAccessor,
      );

      if (landedIndex === -1) {
        return;
      }

      /* Neighbours are read with the moved column taken out. */
      const siblings = reordered.filter(
        (column) => column.accessor !== activeAccessor,
      );

      const { lower, upper } = RighteeUiRank.neighborRanksAt(
        siblings,
        landedIndex,
      );

      setSavingOrder(true);

      try {
        let nextRank;

        try {
          nextRank = between(lower, upper);
        } catch (error) {
          if (!(error instanceof UiRankError)) {
            throw error;
          }

          /*
           * The space between the neighbours is gone, or the neighbours came
           * off an order the server never accepted. Either way one write
           * cannot fix it, so the whole order is rewritten.
           */
          console.warn(
            "[ui-metadata] falling back to a full rank rebalance",
            { lower, upper, error },
          );

          setColumns(reordered);

          await rebalance(reordered);

          toast.success("Column order rebalanced.");

          return;
        }

        /* Optimistic: show the new order and the rank it will carry. */
        setColumns(
          reordered.map((column) =>
            column.accessor === activeAccessor
              ? { ...column, rank: nextRank }
              : column,
          ),
        );

        await runWrite({
          mutation: buildColumnRankMutation(moved, nextRank),
          restore: () => setColumns(previous),
          accessor: activeAccessor,
        });
      } catch (error) {
        setColumns(previous);

        toast.error(describeWriteError(error));

        try {
          await refetchContractQuery();
        } catch {
          /* Reported by the query itself. */
        }
      } finally {
        setSavingOrder(false);
      }
    },
    [
      assertWritable,
      columns,
      rankError,
      rebalance,
      refetchContractQuery,
      runWrite,
      savingOrder,
    ],
  );

  /* --------------------------------------------------- view presentation */

  const setViewVisible = useCallback(
    async (nextVisible) => {
      const entry = view?.presentation?.visible;

      if (!assertWritable(entry, "Visibility for this view")) {
        return;
      }

      const next = Boolean(nextVisible);

      if (isNoOpChange(entry, next)) {
        return;
      }

      const previous = view;

      setView((current) => ({ ...current, visible: next }));

      await runWrite({
        mutation: buildViewVisibilityMutation(view, next),
        restore: () => setView(previous),
      });
    },
    [assertWritable, runWrite, view],
  );

  const setViewRank = useCallback(
    async (nextRank) => {
      const entry = view?.presentation?.rank;

      if (!assertWritable(entry, "Position for this view")) {
        return;
      }

      if (isNoOpChange(entry, nextRank)) {
        return;
      }

      const previous = view;

      setView((current) => ({ ...current, rank: nextRank }));

      await runWrite({
        mutation: buildViewRankMutation(view, nextRank),
        restore: () => setView(previous),
      });
    },
    [assertWritable, runWrite, view],
  );

  /* ------------------------------------------------------- add a column */

  /**
   * Publish a new vardef-backed column.
   *
   * `source_module` and `expected_config_version` both come from the read
   * that is on screen, so they describe the same state the user was looking
   * at. The backend does the rest inside one transaction.
   */
  const addField = useCallback(
    async ({
      label,
      sourceField,
      vardefType,
      width,
      visible,
      rankAfter,
      rankBefore,
      blockId,
      accessor,
    }) => {
      if (!model) {
        return false;
      }

      const taken = existingAccessors(model);

      const requested = String(accessor || sourceField || "").trim();

      if (taken.has(requested)) {
        toast.error(
          `"${requested}" is already a column in this view. Edit its visibility, width or position instead.`,
        );

        return false;
      }

      try {
        const payload = buildFieldCreatePayload({
          label,
          sourceModule: model.module,
          sourceField,
          vardefType,
          moduleKey: model.moduleKey ?? moduleKey,
          viewKey: model.viewKey ?? viewKey,
          expectedConfigVersion: model.configVersion,
          blockId,
          placement: {
            accessor: requested,
            type: vardefType,
            width,
            visible,
            rankAfter,
            rankBefore,
          },
        });

        pendingWrites.current += 1;

        try {
          await fieldCreate.mutateAsync({ payload, moduleKey, viewKey });
        } finally {
          pendingWrites.current = Math.max(0, pendingWrites.current - 1);
        }

        toast.success(`"${label}" published to this view.`);

        return true;
      } catch (error) {
        toast.error(describeWriteError(error));

        if (isStaleReadError(error)) {
          try {
            await refetchContractQuery();
          } catch {
            /* Reported by the query itself. */
          }
        }

        return false;
      }
    },
    [fieldCreate, model, moduleKey, refetchContractQuery, viewKey],
  );

  /* ------------------------------------------------------------- reload */

  const reload = useCallback(async () => {
    pendingWrites.current = 0;

    await refetchContractQuery();
  }, [refetchContractQuery]);

  /* ------------------------------------------------------------- result */

  const writing =
    propertyWrite.isPending || fieldCreate.isPending || savingOrder;

  return {
    /* Data */
    model,
    view,
    columns,
    filteredColumns,

    /* Read state */
    contractPending,
    contractFetching,
    contractError,

    /* Write state */
    writing,
    savingOrder,
    busyAccessor,
    publishing: fieldCreate.isPending,

    /* Problems */
    rankError,

    /* Selection */
    selection,
    setSelection,
    selectedColumn,

    /* Search */
    search,
    setSearch,

    /* Actions */
    toggleColumnVisible,
    setColumnVisible,
    setColumnWidth,
    moveColumn,
    setViewVisible,
    setViewRank,
    addField,
    reload,
  };
}

export default useTableLayoutEditor;
