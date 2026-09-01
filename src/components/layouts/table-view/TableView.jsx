/**
 * Table View layout editor.
 *
 * Reads the published Flexibility contract for any entity table view, lets an
 * administrator change column visibility, width and order, publish a new
 * vardef-backed column, and toggle the view itself.
 *
 * The whole write path is the returned-mutation contract:
 *
 *     GET flexibility  ->  copy returned mutation  ->  POST smart_gateway  ->  refetch
 *
 * Flexibility is treated as read-only. Nothing here invents an owner id, a
 * property path, a record id or an expected value, and nothing writes into a
 * published revision. See useTableLayoutEditor.js for the rules and
 * src/utils/tableLayout.js for the payload builders.
 *
 * Which views appear is derived from the Sidebar metadata rather than a second
 * hardcoded list, so the editor covers every entity list view the app itself
 * links to. Views whose key has no published contract are marked instead of
 * being hidden.
 */

import React, { useEffect, useMemo, useState } from "react";

import { useSearchParams } from "react-router-dom";

import {
  AlertCircle,
  Columns3,
  Eye,
  EyeOff,
  Plus,
  RotateCcw,
  Search,
  Table2,
} from "lucide-react";

import {
  Badge,
  EmptyState,
  GhostButton,
  InlineAlert,
  LoadingBlock,
  PrimaryButton,
} from "./parts/Primitives";

import ViewPicker from "./parts/ViewPicker";
import ColumnList from "./parts/ColumnList";
import ColumnInspector from "./parts/ColumnInspector";
import ViewInspector from "./parts/ViewInspector";
import AddFieldDialog from "./parts/AddFieldDialog";

import useTableLayoutEditor from "./useTableLayoutEditor";

import { useTableViewRegistry } from "@/queries/flexibility.queries";

import { DEFAULT_VIEW_KEY, viewId } from "@/utils/tableViewRegistry";

const TableView = () => {
  /**
   * The selected view lives in the URL, so a specific layout can be linked to
   * and a reload does not lose the user's place.
   */
  const [searchParams, setSearchParams] = useSearchParams();

  const moduleKey = searchParams.get("module") || "";
  const viewKey = searchParams.get("view") || DEFAULT_VIEW_KEY;

  const {
    data: views,
    isPending: registryPending,
    error: registryError,
  } = useTableViewRegistry();

  /** Views whose contract came back 404, so the picker can flag them. */
  const [unavailable, setUnavailable] = useState(() => new Set());

  const [addOpen, setAddOpen] = useState(false);

  const editor = useTableLayoutEditor({
    moduleKey: moduleKey || null,
    viewKey: moduleKey ? viewKey : null,
  });

  const {
    model,
    view,
    columns,
    filteredColumns,
    contractPending,
    contractFetching,
    contractError,
    writing,
    savingOrder,
    busyAccessor,
    publishing,
    rankError,
    selection,
    setSelection,
    selectedColumn,
    search,
    setSearch,
    toggleColumnVisible,
    setColumnWidth,
    moveColumn,
    setViewVisible,
    addField,
    reload,
  } = editor;

  const selectView = ({ moduleKey: nextModule, viewKey: nextView }) => {
    setSearchParams(
      { module: nextModule, view: nextView || DEFAULT_VIEW_KEY },
      { replace: true },
    );
  };

  /* Land on the first available view instead of an empty pane. */
  useEffect(() => {
    if (moduleKey || !views?.length) {
      return;
    }

    const first = views.find((candidate) => candidate.sidebarActive) ?? views[0];

    selectView(first);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleKey, views]);

  /* Record a missing contract so the picker can mark it. */
  useEffect(() => {
    if (!moduleKey) {
      return;
    }

    const status = contractError?.response?.status;

    if (status === 404) {
      setUnavailable((current) => {
        const next = new Set(current);
        next.add(viewId(moduleKey, viewKey));

        return next;
      });
    } else if (model) {
      setUnavailable((current) => {
        if (!current.has(viewId(moduleKey, viewKey))) {
          return current;
        }

        const next = new Set(current);
        next.delete(viewId(moduleKey, viewKey));

        return next;
      });
    }
  }, [contractError, model, moduleKey, viewKey]);

  const hiddenCount = useMemo(
    () => columns.filter((column) => !column.visible).length,
    [columns],
  );

  const searching = search.trim().length > 0;

  /* ===================================================================== */

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* ================================================================= */}
      {/* HEADER                                                            */}
      {/* ================================================================= */}

      <div
        className="
          flex
          shrink-0
          flex-wrap
          items-start
          justify-between
          gap-3
          border-b
          border-border
          px-5
          py-4
        "
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-foreground">Table View</h2>

            <Badge tone="primary">Layout</Badge>

            {model?.configVersion && (
              <Badge tone="neutral" mono title="Current published configVersion">
                {model.configVersion}
              </Badge>
            )}
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure column visibility, width and order for every published
            table view.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {savingOrder && (
            <span
              role="status"
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              Saving order...
            </span>
          )}

          {contractFetching && !savingOrder && (
            <span
              role="status"
              className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground"
            >
              Reloading...
            </span>
          )}

          <GhostButton
            icon={RotateCcw}
            onClick={reload}
            disabled={!model || writing}
          >
            Reload
          </GhostButton>

          <PrimaryButton
            icon={Plus}
            onClick={() => setAddOpen(true)}
            disabled={!model || writing}
          >
            Add field
          </PrimaryButton>
        </div>
      </div>

      {/* ================================================================= */}
      {/* BODY                                                              */}
      {/* ================================================================= */}

      <div
        className="
          grid
          min-h-0
          flex-1
          grid-cols-1
          overflow-hidden
          xl:grid-cols-[minmax(220px,260px)_minmax(280px,1fr)_minmax(320px,440px)]
        "
      >
        {/* ------------------------------------------------- VIEW PICKER */}

        <div
          className="
            flex
            min-h-0
            flex-col
            border-b
            border-border
            bg-card
            xl:border-b-0
            xl:border-r
          "
        >
          <ViewPicker
            views={views}
            loading={registryPending}
            error={registryError}
            moduleKey={moduleKey}
            viewKey={viewKey}
            onSelect={selectView}
            unavailable={unavailable}
          />
        </div>

        {/* ------------------------------------------------- COLUMN LIST */}

        <div
          className="
            flex
            min-h-0
            flex-col
            border-b
            border-border
            bg-card
            xl:border-b-0
            xl:border-r
          "
        >
          {!moduleKey && (
            <EmptyState
              icon={Table2}
              title="Pick a view"
              description="Choose a table view on the left to see its columns."
            />
          )}

          {moduleKey && contractPending && <LoadingBlock label="Reading layout..." />}

          {moduleKey && !contractPending && contractError && (
            <div className="p-5">
              <InlineAlert
                tone={contractError?.response?.status === 404 ? "warning" : "danger"}
                title={
                  contractError?.response?.status === 404
                    ? "No published table view"
                    : "Could not read the layout"
                }
                actions={
                  <GhostButton icon={RotateCcw} onClick={reload}>
                    Try again
                  </GhostButton>
                }
              >
                {contractError?.response?.status === 404 ? (
                  <p>
                    <span className="font-mono">
                      {moduleKey}/{viewKey}
                    </span>{" "}
                    has no compiled table view, so there is nothing to configure.
                    The sidebar links to it, but no revision has been published
                    for that key.
                  </p>
                ) : (
                  <p>{contractError.message}</p>
                )}
              </InlineAlert>
            </div>
          )}

          {moduleKey && model && (
            <>
              {/* TOOLBAR */}

              <div className="shrink-0 space-y-3 border-b border-border p-3">
                <div className="relative">
                  <Search
                    className="
                      pointer-events-none
                      absolute
                      left-3
                      top-1/2
                      h-4
                      w-4
                      -translate-y-1/2
                      text-muted-foreground
                    "
                  />

                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search columns..."
                    aria-label="Search columns"
                    className="
                      h-10
                      w-full
                      rounded-lg
                      border
                      border-border
                      bg-background
                      pl-9
                      pr-3
                      text-sm
                      outline-none
                      focus:border-primary/50
                    "
                  />
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setSelection({ type: "view" })}
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      transition-colors

                      ${
                        selection?.type === "view"
                          ? "bg-primary/10 text-primary ring-1 ring-primary/30"
                          : "text-muted-foreground hover:bg-accent"
                      }
                    `}
                  >
                    {view?.visible ? (
                      <Eye className="h-3 w-3" />
                    ) : (
                      <EyeOff className="h-3 w-3" />
                    )}
                    View settings
                  </button>

                  <Badge tone="neutral">
                    <Columns3 className="h-3 w-3" />
                    {columns.length}
                  </Badge>

                  {hiddenCount > 0 && (
                    <Badge tone="warning">{hiddenCount} hidden</Badge>
                  )}
                </div>
              </div>

              {/* RANK PROBLEMS */}

              {rankError && (
                <div className="shrink-0 border-b border-border p-3">
                  <InlineAlert
                    tone="warning"
                    title={rankError.message}
                    actions={
                      <GhostButton icon={RotateCcw} onClick={reload}>
                        Reload from server
                      </GhostButton>
                    }
                  >
                    {rankError.reports?.length ? (
                      <ul className="space-y-0.5">
                        {rankError.reports.map((report) => (
                          <li key={report.scopeLabel}>
                            {report.scopeLabel}
                            {report.missing?.length
                              ? ` — ${report.missing.length} column(s) without a rank`
                              : ""}
                            {report.duplicates?.length
                              ? ` — duplicate rank(s): ${report.duplicates
                                  .map((entry) => entry.rank)
                                  .join(", ")}`
                              : ""}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>
                        Visibility and width can still be changed; only ordering
                        is blocked.
                      </p>
                    )}
                  </InlineAlert>
                </div>
              )}

              {/* SEARCH BLOCKS REORDER */}

              {searching && !rankError && (
                <div className="shrink-0 border-b border-border px-3 py-2">
                  <p className="text-[10px] leading-4 text-muted-foreground">
                    Reordering is disabled while searching, because the
                    neighbours on screen are not the neighbours in the view.
                  </p>
                </div>
              )}

              {/* LIST */}

              <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
                <ColumnList
                  columns={filteredColumns}
                  allColumns={columns}
                  selection={selection}
                  onSelect={(column) =>
                    setSelection({ type: "column", accessor: column.accessor })
                  }
                  onToggleVisible={toggleColumnVisible}
                  onMove={moveColumn}
                  busyAccessor={busyAccessor}
                  reorderDisabled={Boolean(rankError) || savingOrder || writing}
                  searching={searching}
                />
              </div>
            </>
          )}
        </div>

        {/* --------------------------------------------------- INSPECTOR */}

        <div className="min-h-0 overflow-hidden bg-background">
          {!model && (
            <EmptyState
              icon={AlertCircle}
              title="Nothing to configure"
              description="Select a published table view to edit its columns."
            />
          )}

          {model && selection?.type === "column" && selectedColumn && (
            <ColumnInspector
              column={selectedColumn}
              onToggleVisible={toggleColumnVisible}
              onCommitWidth={setColumnWidth}
              busy={busyAccessor === selectedColumn.accessor}
            />
          )}

          {model && (selection?.type === "view" || !selectedColumn) && (
            <ViewInspector
              model={model}
              view={view}
              onToggleVisible={setViewVisible}
              busy={writing}
            />
          )}
        </div>
      </div>

      {/* ================================================================= */}
      {/* ADD FIELD                                                         */}
      {/* ================================================================= */}

      {model && (
        <AddFieldDialog
          model={model}
          open={addOpen}
          busy={publishing}
          onClose={() => {
            if (!publishing) {
              setAddOpen(false);
            }
          }}
          onSubmit={addField}
        />
      )}
    </div>
  );
};

export default TableView;
