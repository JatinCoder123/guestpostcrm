import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarChart3, Columns3, Plus, RotateCcw, Search, Table2 } from "lucide-react";
import * as Tabs from "@radix-ui/react-tabs";
import { EmptyState, GhostButton, InlineAlert, LoadingBlock, Toggle } from "./parts/Primitives";
import ViewPicker from "./parts/ViewPicker";
import ColumnList from "./parts/ColumnList";
import ColumnInspector from "./parts/ColumnInspector";
import AddFieldDialog from "./parts/AddFieldDialog";
import StatusInspector from "./parts/StatusInspector";
import StatusList from "./parts/StatusList";
import useTableLayoutEditor from "./useTableLayoutEditor";
import usePresentationDrafts from "./usePresentationDrafts";
import { useTableViewRegistry } from "@/queries/flexibility.queries";
import { DEFAULT_VIEW_KEY } from "@/utils/tableViewRegistry";

export default function TableView() {
  const [searchParams, setSearchParams] = useSearchParams();
  const moduleKey = searchParams.get("module") || "";
  const viewKey = searchParams.get("view") || DEFAULT_VIEW_KEY;
  const registry = useTableViewRegistry();
  const views = registry.data?.views || [];
  const selectedView = views.find((item) => item.moduleKey === moduleKey && item.viewKey === viewKey);
  const [addOpen, setAddOpen] = useState(false);
  const [section, setSection] = useState("columns");
  const [search, setSearch] = useState("");
  const editor = useTableLayoutEditor({
    moduleKey: selectedView?.moduleKey || null,
    viewKey: selectedView?.viewKey || null,
  });
  const { model, view, writing, selection, setSelection, contractError } = editor;
  const drafts = usePresentationDrafts(editor, moduleKey, viewKey);
  const showingStatuses = section === "statuses";
  const column = drafts.columns.find((item) => item.accessor === selection?.accessor);
  const status = drafts.statuses.find((item) => item.key === selection?.key);
  const needle = search.trim().toLowerCase();
  const matches = (item) => [item.label, item.accessor, item.key].some((value) => value?.toLowerCase().includes(needle));

  useEffect(() => {
    if (!selectedView && registry.data?.views?.length) {
      const first = registry.data.views.find((item) => item.moduleKey === moduleKey)
        || registry.data.views.find((item) => item.active) || registry.data.views[0];
      setSearchParams({ module: first.moduleKey, view: first.viewKey }, { replace: true });
    }
  }, [moduleKey, selectedView, registry.data, setSearchParams]);

  useEffect(() => {
    if (!model) return;
    if (showingStatuses && !status && editor.statuses.length) {
      setSelection({ type: "status", key: editor.statuses[0].key });
    } else if (!showingStatuses && !column && editor.columns.length) {
      setSelection({ type: "column", accessor: editor.columns[0].accessor });
    }
  }, [model, showingStatuses, status, column, editor.statuses, editor.columns, setSelection]);

  const selectView = (next) => {
    if (writing) return;
    setSearch("");
    setAddOpen(false);
    setSearchParams({ module: next.moduleKey, view: next.viewKey }, { replace: true });
  };
  const toggleColumn = (item) => {
    setSelection({ type: "column", accessor: item.accessor });
    drafts.patch("column", item.accessor, { visible: !item.visible });
  };
  const toggleStatus = (item) => {
    setSelection({ type: "status", key: item.key });
    drafts.patch("status", item.key, { visible: !item.visible });
  };
  const reload = () => {
    if (writing) return;
    if (selectedView) editor.reload();
    registry.refetch();
  };
  const rankError = showingStatuses ? editor.statusRankError : editor.rankError;

  return (
    <div className="flex min-h-0 flex-col">
      <div className="layout-editor-header flex flex-wrap items-center justify-between gap-4 border-b border-border px-5 py-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Table View</h2>
          <p className="mt-1 text-sm text-muted-foreground">Choose a view to edit its columns and statuses.</p>
        </div>
        <GhostButton icon={RotateCcw} onClick={reload} disabled={writing || registry.isFetching || editor.contractFetching}>
          Reload
        </GhostButton>
      </div>

      <div className="layout-editor-header flex flex-wrap items-center gap-3 border-b border-border px-5 py-3">
        <span className="text-sm font-medium text-foreground">Editing</span>
        <ViewPicker views={views} loading={registry.isPending} moduleKey={moduleKey}
          viewKey={viewKey} onSelect={selectView} disabled={writing} />
        {model && (
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Show view</span>
            <Toggle label="Show view" checked={view?.visible}
              disabled={writing || !view?.presentation?.visible?.writable}
              onChange={() => editor.setViewVisible(!view?.visible)} />
          </div>
        )}
      </div>

      {registry.error && (
        <div className="px-5 pt-3">
          <InlineAlert tone="warning" title="Could not load table views">
            {registry.error.message}
          </InlineAlert>
        </div>
      )}

      {!selectedView && !registry.isPending && !registry.error && !views.length && (
        <EmptyState icon={Table2} title="No table views found" description="Table views will appear here when they are added to the view catalog." />
      )}
      {(registry.isPending || (selectedView && editor.contractPending)) && <LoadingBlock label="Loading table view..." />}
      {moduleKey && contractError && (
        <div className="p-5">
          <InlineAlert title={contractError?.response?.status === 404 ? "This table view is not available yet" : "Could not load this view"}
            actions={<GhostButton onClick={reload} disabled={writing}>Try again</GhostButton>}>
            {contractError?.response?.status === 404 ? "Choose another view or try again after it has been published." : contractError.message}
          </InlineAlert>
        </div>
      )}

      {moduleKey && model && (
        <Tabs.Root value={section} onValueChange={(value) => { setSection(value); setSearch(""); }}
          className="min-h-0">
          <div className="layout-editor-header flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-3">
            <Tabs.List aria-label="Table layout sections" className="inline-flex rounded-lg bg-muted/60 p-1">
              <Tabs.Trigger value="columns" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <Columns3 className="h-4 w-4" /> Columns
              </Tabs.Trigger>
              <Tabs.Trigger value="statuses" className="flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-muted-foreground outline-none focus-visible:ring-2 focus-visible:ring-primary/40 data-[state=active]:bg-card data-[state=active]:text-foreground data-[state=active]:shadow-sm">
                <BarChart3 className="h-4 w-4" /> Statuses
              </Tabs.Trigger>
            </Tabs.List>
            {!showingStatuses && <GhostButton icon={Plus} onClick={() => setAddOpen(true)} disabled={writing}>Add field</GhostButton>}
          </div>
          <Tabs.Content value={section} className="mt-0 outline-none">
            <div className="layout-editor-grid min-h-[360px]">
              <div className="min-w-0 border-b border-border bg-card ">
                <div className="space-y-2 p-4">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input value={search} onChange={(event) => setSearch(event.target.value)}
                      placeholder={showingStatuses ? "Search statuses..." : "Search columns..."}
                      aria-label={showingStatuses ? "Search statuses" : "Search columns"}
                      className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40" />
                  </div>
                  <p className="text-xs text-muted-foreground">Drag to reorder. Order saves automatically.</p>
                </div>
                {rankError && <div className="px-4 pb-3"><InlineAlert tone="warning" title="Reordering is unavailable">
                  Reload this view to try again. You can still edit its settings.
                </InlineAlert></div>}
                <div className="max-h-[min(52vh,560px)] overflow-y-auto px-3 pb-4">
                  {showingStatuses ? (
                    <StatusList statuses={drafts.statuses.filter(matches)} allStatuses={drafts.statuses}
                      selection={selection} onSelect={(item) => setSelection({ type: "status", key: item.key })}
                      onToggleVisible={toggleStatus} onMove={editor.moveStatus}
                      busyStatusKey={editor.busyStatusKey} disabled={writing}
                      reorderDisabled={Boolean(rankError) || writing} searching={Boolean(needle)} />
                  ) : (
                    <ColumnList columns={drafts.columns.filter(matches)} allColumns={drafts.columns}
                      selection={selection} onSelect={(item) => setSelection({ type: "column", accessor: item.accessor })}
                      onToggleVisible={toggleColumn} onMove={editor.moveColumn}
                      busyAccessor={editor.busyAccessor} disabled={writing}
                      reorderDisabled={Boolean(rankError) || writing} searching={Boolean(needle)} />
                  )}
                </div>
              </div>
              <div className="min-w-0 bg-background">
                {!showingStatuses && column && (
                  <ColumnInspector column={column} onToggleVisible={toggleColumn} busy={writing}
                    dirty={column.dirty} onReset={() => drafts.reset("column", column.accessor)}
                    onUpdate={() => drafts.update("column", column)} />
                )}
                {showingStatuses && status && (
                  <StatusInspector status={status} onToggleVisible={toggleStatus} busy={writing}
                    dirty={status.dirty} onReset={() => drafts.reset("status", status.key)}
                    onUpdate={() => drafts.update("status", status)}
                    onSetIcon={(item, icon) => drafts.patch("status", item.key, {
                      icon: { color: item.icon?.color || "", library: icon?.library || "", name: icon?.name || "" },
                    })} />
                )}
                {((showingStatuses && !status) || (!showingStatuses && !column)) && (
                  <EmptyState icon={showingStatuses ? BarChart3 : Columns3}
                    title={showingStatuses ? "No statuses to edit" : "No columns to edit"}
                    description={showingStatuses ? "This view has no statuses configured." : "Add a field to get started."} />
                )}
              </div>
            </div>
          </Tabs.Content>
        </Tabs.Root>
      )}
      {model && <AddFieldDialog model={model} open={addOpen} busy={editor.publishing}
        onClose={() => { if (!editor.publishing) setAddOpen(false); }} onSubmit={editor.addField} />}
    </div>
  );
}
