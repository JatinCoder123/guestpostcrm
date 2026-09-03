import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  closestCenter,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import {
  GripVertical,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  Trash2,
} from "lucide-react";

import * as LucideIcons from "lucide-react";

import {
  useLayoutPreferences,
  useUpdateLayout,
} from "@/queries/prefrences.queries";

import {
  groupScope,
  isPersistableId,
  moduleScope,
  normalizeSidebarResponse,
  SIDEBAR_GROUP_MODULE,
  SIDEBAR_MODULE_MODULE,
  toActiveFlag,
} from "@/utils/sidebarLayout";

import { RANK_FIELD, reorderCopy } from "@/utils/rank";

import { performRankMove } from "@/utils/rankMove";

import { isRankConflictError, requestRankMove } from "@/api/rank.api";

import { fetchLayout } from "@/api/prefrences.api";

import { preferenceKeys } from "@/queries/prefrences.queries";

import { useQueryClient } from "@tanstack/react-query";

import toast from "react-hot-toast";

/* =========================================================================
   ICON REGISTRY
   ========================================================================= */

const iconRegistry = {
  ...LucideIcons,
};

/* =========================================================================
   DYNAMIC ICON
   ========================================================================= */

function DynamicIcon({ icon, className = "h-4 w-4" }) {
  const Icon = icon && iconRegistry[icon] ? iconRegistry[icon] : Settings2;

  return <Icon className={className} />;
}

/* =========================================================================
   TOGGLE
   ========================================================================= */

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        onChange?.();
      }}
      className={`
                relative
                h-6
                w-11
                shrink-0
                rounded-full
                transition-colors
                ${checked ? "bg-primary" : "bg-muted"}
            `}
      aria-pressed={checked}
    >
      <span
        className={`
                    absolute
                    top-1
                    h-4
                    w-4
                    rounded-full
                    bg-primary-foreground
                    shadow-sm
                    transition-transform
                    ${checked ? "left-6" : "left-1"}
                `}
      />
    </button>
  );
}

/* =========================================================================
   SORTABLE GROUP
   ========================================================================= */

function SortableGroup({
  group,
  selected,
  onSelect,
  onToggle,
  children,
  onAddField,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `group-${group.id}`,

    data: {
      type: "group",
      groupId: group.id,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),

    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
                overflow-hidden
                rounded-xl
                border
                transition-all

                ${selected
          ? "border-primary/40 bg-primary/[0.03] shadow-sm"
          : "border-border bg-card"
        }

                ${isDragging ? "opacity-50" : ""}
            `}
    >
      {/* GROUP HEADER */}

      <div
        onClick={() => onSelect(group)}
        className={`
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    transition-colors

                    ${selected ? "bg-primary/[0.05]" : "hover:bg-accent/50"}
                `}
      >
        {/* DRAG HANDLE */}

        <button
          type="button"
          {...attributes}
          {...listeners}
          onClick={(event) => event.stopPropagation()}
          className="
                        flex
                        h-7
                        w-6
                        shrink-0
                        cursor-grab
                        items-center
                        justify-center
                        rounded-md
                        text-muted-foreground/50
                        hover:bg-accent
                        hover:text-foreground
                        active:cursor-grabbing
                    "
          title="Drag group"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* ICON */}

        <div
          className="
                        flex
                        h-8
                        w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        border
                        border-border
                        bg-background
                    "
        >
          <Settings2 className="h-4 w-4 text-muted-foreground" />
        </div>

        {/* NAME */}

        <div
          className={`min-w-0 flex-1 ${group.is_active ? "" : "opacity-45"}`}
        >
          <p className="truncate text-sm font-semibold text-foreground">
            {group.group_name}
          </p>

          <p className="text-[11px] text-muted-foreground">
            {group.is_active
              ? `${group.data.length} ${group.data.length === 1 ? "field" : "fields"}`
              : "Hidden from sidebar"}
          </p>
        </div>

        {/* ACTIVE */}

        <Toggle checked={group.is_active} onChange={() => onToggle(group)} />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelect(group);
          }}
          className="
                        flex
                        h-7
                        w-7
                        shrink-0
                        items-center
                        justify-center
                        rounded-md
                        text-muted-foreground
                        hover:bg-accent
                        hover:text-foreground
                    "
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* FIELDS */}

      <div
        className="
                    border-t
                    border-border
                    px-2
                    py-1.5
                "
      >
        {children}

        <button
          type="button"
          onClick={() => onAddField(group)}
          className="
                        mt-1
                        flex
                        w-full
                        items-center
                        gap-2
                        rounded-lg
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-muted-foreground
                        transition-colors
                        hover:bg-accent
                        hover:text-foreground
                    "
        >
          <Plus className="h-3.5 w-3.5" />
          Add field
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   SORTABLE FIELD
   ========================================================================= */

function SortableField({ item, groupId, selected, onSelect, onToggle }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `item-${item.id}`,

    data: {
      type: "item",
      itemId: item.id,
      groupId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),

    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => onSelect(item)}
      className={`
                group
                flex
                cursor-pointer
                items-center
                gap-2
                rounded-lg
                px-2
                py-2
                transition-colors

                ${selected ? "bg-primary/10" : "hover:bg-accent/60"}

                ${isDragging ? "opacity-50" : ""}
            `}
    >
      {/* DRAG */}

      <button
        type="button"
        {...attributes}
        {...listeners}
        onClick={(event) => event.stopPropagation()}
        className="
                    flex
                    h-7
                    w-5
                    shrink-0
                    cursor-grab
                    items-center
                    justify-center
                    rounded-md
                    text-muted-foreground/40
                    hover:bg-accent
                    hover:text-foreground
                    active:cursor-grabbing
                "
        title="Drag field"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      {/* ICON */}

      <div
        className="
                    flex
                    h-7
                    w-7
                    shrink-0
                    items-center
                    justify-center
                    rounded-md
                    border
                    border-border
                    bg-background
                "
      >
        <DynamicIcon
          icon={item.icon}
          className="
                        h-3.5
                        w-3.5
                        text-muted-foreground
                    "
        />
      </div>

      {/* NAME */}

      <div className={`min-w-0 flex-1 ${item.is_active ? "" : "opacity-45"}`}>
        <p className="truncate text-xs font-medium text-foreground">
          {item.name}
        </p>

        {!item.is_active && (
          <p className="text-[10px] text-muted-foreground">
            Hidden from sidebar
          </p>
        )}
      </div>

      {/* RANK */}

      <span
        className="
                    max-w-[80px]
                    truncate
                    text-[9px]
                    font-mono
                    text-muted-foreground
                "
        title={item[RANK_FIELD] ?? "no rank"}
      >
        {item[RANK_FIELD] ?? "—"}
      </span>

      {/* ACTIVE */}

      <Toggle checked={item.is_active} onChange={() => onToggle(item)} />
    </div>
  );
}

/* =========================================================================
   INPUT
   ========================================================================= */

function FieldInput({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-foreground">
        {label}
      </label>

      <input
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="
                    h-10
                    w-full
                    rounded-lg
                    border
                    border-border
                    bg-background
                    px-3
                    text-sm
                    text-foreground
                    outline-none
                    placeholder:text-muted-foreground
                    focus:border-primary/50
                    focus:ring-2
                    focus:ring-primary/10
                "
      />
    </div>
  );
}

/* =========================================================================
   GROUP EDITOR
   ========================================================================= */

function GroupEditor({ group, onUpdate, onDelete, onAddField }) {
  if (!group) {
    return <EmptyEditor />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Group
            </p>

            <h3 className="mt-1 text-base font-semibold">Group Settings</h3>
          </div>

          <Toggle
            checked={group.is_active}
            onChange={() =>
              onUpdate({
                is_active: !group.is_active,
              })
            }
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        <div className="space-y-5">
          <FieldInput
            label="Group Name"
            value={group.group_name}
            onChange={(value) =>
              onUpdate({
                group_name: value,
              })
            }
            placeholder="Enter group name"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium">
              Group Rank
            </label>

            <input
              value={group[RANK_FIELD] ?? ""}
              readOnly
              className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-border
                                bg-muted/30
                                px-3
                                font-mono
                                text-sm
                                text-muted-foreground
                                outline-none
                            "
            />

            <p className="mt-1 text-[10px] text-muted-foreground">
              Position in the sidebar, ascending. An opaque value assigned by
              the CRM; drag groups here to change it.
            </p>
          </div>

          <div
            className="
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-border
                            bg-muted/20
                            p-3
                        "
          >
            <div>
              <p className="text-sm font-medium">Show in sidebar</p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Enable or disable the entire group.
              </p>
            </div>

            <Toggle
              checked={group.is_active}
              onChange={() =>
                onUpdate({
                  is_active: !group.is_active,
                })
              }
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">Fields</p>

                <p className="text-xs text-muted-foreground">
                  {group.data.length} fields
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAddField(group)}
                className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-border
                                    px-2.5
                                    py-1.5
                                    text-xs
                                    font-medium
                                    hover:bg-accent
                                "
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>

            <div className="space-y-1.5">
              {group.data.map((item) => (
                <div
                  key={item.id}
                  className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-lg
                                            border
                                            border-border
                                            bg-background
                                            px-3
                                            py-2
                                        "
                >
                  <DynamicIcon
                    icon={item.icon}
                    className="
                                                h-4
                                                w-4
                                                text-muted-foreground
                                            "
                  />

                  <span className="min-w-0 flex-1 truncate text-xs font-medium">
                    {item.name}
                  </span>

                  <span
                    className="
                                                max-w-[80px]
                                                truncate
                                                font-mono
                                                text-[9px]
                                                text-muted-foreground
                                            "
                  >
                    {item[RANK_FIELD] ?? "—"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={() => onDelete(group)}
          className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-destructive/20
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-destructive
                        hover:bg-destructive/10
                    "
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Group
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   FIELD EDITOR
   ========================================================================= */

function ItemEditor({ item, onUpdate, onDelete }) {
  if (!item) {
    return <EmptyEditor />;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <div
            className="
                            flex
                            h-10
                            w-10
                            shrink-0
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-border
                            bg-muted/30
                        "
          >
            <DynamicIcon
              icon={item.icon}
              className="
                                h-5
                                w-5
                                text-muted-foreground
                            "
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
              Sidebar Field
            </p>

            <h3 className="mt-1 truncate text-base font-semibold">
              {item.name || "Field"}
            </h3>
          </div>

          <Toggle
            checked={item.is_active}
            onChange={() =>
              onUpdate({
                is_active: !item.is_active,
              })
            }
          />
        </div>
      </div>

      <div className="custom-scrollbar flex-1 overflow-y-auto p-5">
        <div className="space-y-5">
          <FieldInput
            label="Label"
            value={item.name}
            onChange={(value) =>
              onUpdate({
                name: value,
              })
            }
            placeholder="Contacts"
          />

          <FieldInput
            label="Module Name"
            value={item.module_name}
            onChange={(value) =>
              onUpdate({
                module_name: value,
              })
            }
            placeholder="contacts"
          />

          <FieldInput
            label="Icon Name"
            value={item.icon}
            onChange={(value) =>
              onUpdate({
                icon: value,
              })
            }
            placeholder="Users"
          />

          <FieldInput
            label="Navigation"
            value={item.navigation}
            onChange={(value) =>
              onUpdate({
                navigation: value,
              })
            }
            placeholder="/contacts"
          />

          <FieldInput
            label="Endpoint"
            value={item.endpoint}
            onChange={(value) =>
              onUpdate({
                endpoint: value,
              })
            }
            placeholder="/api/contacts"
          />

          <div>
            <label className="mb-1.5 block text-xs font-medium">Rank</label>

            <input
              value={item[RANK_FIELD] ?? ""}
              readOnly
              className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-border
                                bg-muted/30
                                px-3
                                font-mono
                                text-sm
                                text-muted-foreground
                                outline-none
                            "
            />

            <p className="mt-1 text-[10px] text-muted-foreground">
              Position inside the group, ascending. An opaque value assigned by
              the CRM; drag fields here to change it.
            </p>
          </div>

          <div
            className="
                            flex
                            items-center
                            justify-between
                            rounded-xl
                            border
                            border-border
                            bg-muted/20
                            p-3
                        "
          >
            <div>
              <p className="text-sm font-medium">Active</p>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Show this field in the sidebar.
              </p>
            </div>

            <Toggle
              checked={item.is_active}
              onChange={() =>
                onUpdate({
                  is_active: !item.is_active,
                })
              }
            />
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold">Configuration</p>

            <div className="rounded-xl border border-border bg-muted/20 p-3">
              <pre className="max-h-52 overflow-auto text-[10px] leading-5 text-muted-foreground">
                {JSON.stringify(item, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={() => onDelete(item)}
          className="
                        flex
                        w-full
                        items-center
                        justify-center
                        gap-2
                        rounded-lg
                        border
                        border-destructive/20
                        px-3
                        py-2
                        text-xs
                        font-medium
                        text-destructive
                        hover:bg-destructive/10
                    "
        >
          <Trash2 className="h-3.5 w-3.5" />
          Remove Field
        </button>
      </div>
    </div>
  );
}

/* =========================================================================
   EMPTY EDITOR
   ========================================================================= */

function EmptyEditor() {
  return (
    <div
      className="
                flex
                h-full
                min-h-[400px]
                flex-col
                items-center
                justify-center
                px-8
                text-center
            "
    >
      <div
        className="
                    mb-4
                    flex
                    h-12
                    w-12
                    items-center
                    justify-center
                    rounded-xl
                    border
                    border-border
                    bg-muted/20
                "
      >
        <Settings2 className="h-5 w-5 text-muted-foreground" />
      </div>

      <h3 className="text-sm font-semibold">Nothing selected</h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        Select a group or sidebar field from the left to configure its
        properties.
      </p>
    </div>
  );
}

/* =========================================================================
   TYPE-AWARE COLLISION DETECTION
   ========================================================================= */

const collisionDetectionStrategy = (args) => {
  const activeType = args.active?.data?.current?.type;

  if (activeType === "group") {
    const groupContainers = args.droppableContainers.filter(
      (container) => container.data?.current?.type === "group",
    );

    return closestCenter({
      ...args,
      droppableContainers: groupContainers,
    });
  }

  if (activeType === "item") {
    const fieldContainers = args.droppableContainers.filter(
      (container) => container.data?.current?.type === "item",
    );

    return closestCenter({
      ...args,
      droppableContainers: fieldContainers,
    });
  }

  return closestCenter(args);
};

/* =========================================================================
   SIDEBAR PAGE
   ========================================================================= */

const Sidebar = () => {
  const { data: layoutData, isPending: layoutLoading } = useLayoutPreferences();

  const { mutate: updateLayout, isPending: updateLayoutPending } =
    useUpdateLayout();

  const [groups, setGroups] = useState([]);

  const [selectedItem, setSelectedItem] = useState(null);

  const [search, setSearch] = useState("");

  const [expandedGroups, setExpandedGroups] = useState({});

  const [activeDrag, setActiveDrag] = useState(null);

  /**
   * Held true for the whole of a reorder. Starting a second
   * drag before the first has landed would derive neighbour IDs
   * from an order the server has not accepted yet.
   */
  const [savingOrder, setSavingOrder] = useState(false);

  /**
   * A missing or duplicated rank means the data cannot be
   * ordered at all. It is shown, not worked around.
   */
  const [rankError, setRankError] = useState(null);

  const queryClient = useQueryClient();

  /**
   * When we fire a layout mutation ourselves
   * (drag reorder, toggle, etc.) the query
   * invalidation will refetch layoutData and
   * trigger the sync useEffect below.
   *
   * We set this flag BEFORE calling updateLayout
   * so the next useEffect cycle skips
   * overwriting our optimistic local state.
   */
  const skipNextSync = useRef(false);

  /**
   * Writes still in flight, so the sync effect does not
   * overwrite optimistic state mid-request. A reorder is always
   * one write; toggles add their own.
   */
  const pendingWrites = useRef(0);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
  );

  /* =====================================================================
       API DATA -> LOCAL STATE
       ===================================================================== */

  /**
   * Put a server payload on screen.
   *
   * This runs after every reorder, so it must not disturb
   * anything the user was doing. The selected record and the
   * expanded groups are preserved; only groups the editor has
   * not seen before get expanded by default, and the selection
   * is only replaced when the record it pointed at is gone.
   *
   * Any scope with a missing or duplicate rank is reported
   * rather than guessed at. Those records still render, in the
   * order the server sent, but reordering stays blocked until
   * the data is repaired.
   */
  const applyServerLayout = useCallback((payload) => {
    const rankProblems = [];

    const normalized = normalizeSidebarResponse(payload, {
      onInvalid: (report) => rankProblems.push(report),
    });

    setGroups(normalized);

    setRankError(
      rankProblems.length
        ? {
          reports: rankProblems,
          message: `Sidebar ordering data is invalid in ${rankProblems.length} place(s). Reordering is disabled until it is fixed.`,
        }
        : null,
    );

    if (!normalized.length) {
      return normalized;
    }

    /* Default new groups to expanded, leave the rest alone. */
    setExpandedGroups((current) => {
      const next = { ...current };

      normalized.forEach((group) => {
        if (next[group.id] === undefined) {
          next[group.id] = true;
        }
      });

      return next;
    });

    setSelectedItem((current) => {
      if (current) {
        const stillThere =
          current.type === "group"
            ? normalized.some((group) => group.id === current.id)
            : normalized.some((group) =>
              (group.data ?? []).some((item) => item.id === current.id),
            );

        if (stillThere) {
          return current;
        }
      }

      return { type: "group", id: normalized[0].id };
    });

    return normalized;
  }, []);

  useEffect(() => {
    if (!layoutData) {
      return;
    }

    /**
     * A write is in flight, so local state is showing the
     * optimistic order and this payload predates it.
     */
    if (pendingWrites.current > 0) {
      return;
    }

    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    applyServerLayout(layoutData);
  }, [layoutData, applyServerLayout]);

  /* =====================================================================
       FILTER
       ===================================================================== */

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return groups;
    }

    return groups
      .map((group) => {
        const groupMatch = group.group_name?.toLowerCase().includes(query);

        const fields = group.data.filter(
          (item) =>
            groupMatch ||
            item.name?.toLowerCase().includes(query) ||
            item.module_name?.toLowerCase().includes(query),
        );

        return {
          ...group,

          data: groupMatch ? group.data : fields,
        };
      })
      .filter(
        (group) =>
          group.group_name?.toLowerCase().includes(query) ||
          group.data.length > 0,
      );
  }, [groups, search]);

  /* =====================================================================
       SELECTED OBJECT
       ===================================================================== */

  const selectedObject = useMemo(() => {
    if (!selectedItem) {
      return null;
    }

    if (selectedItem.type === "group") {
      return groups.find((group) => group.id === selectedItem.id) || null;
    }

    for (const group of groups) {
      const item = group.data.find((item) => item.id === selectedItem.id);

      if (item) {
        return item;
      }
    }

    return null;
  }, [groups, selectedItem]);

  /* =====================================================================
       SELECT
       ===================================================================== */

  const selectGroup = (group) => {
    setSelectedItem({
      type: "group",
      id: group.id,
    });
  };

  const selectField = (item) => {
    setSelectedItem({
      type: "field",
      id: item.id,
    });
  };

  /* =====================================================================
       GET MODULE
       ===================================================================== */

  const getGroupModule = (group) =>
    group?.module || group?.module_name || SIDEBAR_GROUP_MODULE;

  const getFieldModule = (item) =>
    item?.module || item?.module_name || SIDEBAR_MODULE_MODULE;

  /* =====================================================================
       WRITE
       ===================================================================== */

  /**
   * Every write goes through here, so the bookkeeping that
   * keeps the refetch from clobbering optimistic state
   * lives in exactly one place.
   */
  const pushUpdate = ({ module, id, payload }) => {
    skipNextSync.current = true;
    pendingWrites.current += 1;

    updateLayout(
      {
        module,
        id,
        payload,
      },
      {
        /**
         * The write was rejected, so the optimistic change is
         * wrong. Drop the skip flag and let the refetch
         * overwrite local state, which snaps the editor back
         * to what the server actually holds.
         */
        onError: () => {
          skipNextSync.current = false;
        },

        onSettled: () => {
          pendingWrites.current = Math.max(0, pendingWrites.current - 1);
        },
      },
    );
  };

  const persistActive = (record, module, active) => {
    if (!isPersistableId(record?.id)) {
      return;
    }

    pushUpdate({
      module,
      id: record.id,
      payload: { is_active: toActiveFlag(active) },
    });
  };

  /* =====================================================================
       RANK MOVE PLUMBING
       ===================================================================== */

  /**
   * One ordinary `update` per drag, carrying the destination
   * scope and the two neighbour IDs. The backend generates the
   * rank; nothing here does.
   *
   * The response carries no rank, so there is nothing to write
   * back into local state - the optimistic order already shows
   * the result, and the next ordinary fetch brings the
   * authoritative rank_key values.
   */
  const sendMove = async (args) => {
    /*
     * Only guards the window between the drop and the response,
     * so a refetch landing mid-write cannot undo the optimistic
     * order. `skipNextSync` is deliberately NOT set here: once
     * the write is confirmed the server order is what we want.
     */
    pendingWrites.current += 1;

    try {
      return await requestRankMove(args);
    } finally {
      pendingWrites.current = Math.max(0, pendingWrites.current - 1);
    }
  };

  /**
   * Read the whole payload back from the server and display it.
   *
   * Runs after a confirmed reorder, so the editor shows the
   * order that was actually stored rather than the optimistic
   * guess. Also runs when a move is rejected or the rank data
   * is invalid, where local state cannot be trusted at all.
   *
   * `fetchQuery` writes into the same cache entry the live
   * sidebar reads, so the left-hand nav picks up the new order
   * from this one request too.
   */
  const reloadSidebar = async () => {
    skipNextSync.current = false;
    pendingWrites.current = 0;

    const fresh = await queryClient.fetchQuery({
      queryKey: preferenceKeys.layout(),
      queryFn: fetchLayout,
      staleTime: 0,
    });

    return applyServerLayout(fresh);
  };

  /**
   * Shared tail for both reorder paths.
   *
   * `plan` describes the destination scope only. `restoreOrder`
   * undoes the optimistic order when the move is rejected;
   * the scope is then reloaded so the editor shows what the
   * server actually holds.
   */
  const runMove = ({ plan, restoreOrder }) =>
    performRankMove(plan, {
      requestMove: sendMove,
      isConflict: isRankConflictError,

      /*
       * The update response confirms the write but carries no
       * rank, so the new order is read back here. This is what
       * puts the server's order on screen instead of leaving
       * the optimistic one in place.
       */
      syncScope: () => reloadSidebar(),

      restoreOrder,

      reloadScope: () => reloadSidebar(),

      onSaving: setSavingOrder,

      onError: (message) => toast.error(message),
    });

  /* =====================================================================
       TOGGLE GROUP
       ===================================================================== */

  /**
   * Turning a group off hides the whole group, heading and
   * fields, from the live sidebar. The fields keep their
   * own is_active, so turning the group back on restores
   * whatever was visible before.
   *
   * `active` is optional: omit it to flip the current
   * value, pass it to set an explicit state.
   */
  const setGroupActive = (group, active) => {
    if (!group?.id) {
      return;
    }

    const nextActive = active === undefined ? !group.is_active : Boolean(active);

    if (nextActive === group.is_active) {
      return;
    }

    /**
     * Optimistic local update.
     */
    setGroups((current) =>
      current.map((item) =>
        item.id === group.id
          ? {
            ...item,
            is_active: nextActive,
          }
          : item,
      ),
    );

    persistActive(group, getGroupModule(group), nextActive);
  };

  const toggleGroup = (group) => setGroupActive(group);

  /* =====================================================================
       TOGGLE FIELD
       ===================================================================== */

  const setFieldActive = (item, active) => {
    if (!item?.id) {
      return;
    }

    const nextActive = active === undefined ? !item.is_active : Boolean(active);

    if (nextActive === item.is_active) {
      return;
    }

    /**
     * Optimistic local update.
     */
    setGroups((current) =>
      current.map((group) => ({
        ...group,

        data: group.data.map((field) =>
          field.id === item.id
            ? {
              ...field,
              is_active: nextActive,
            }
            : field,
        ),
      })),
    );

    persistActive(item, getFieldModule(item), nextActive);
  };

  const toggleField = (item) => setFieldActive(item);

  /* =====================================================================
       UPDATE GROUP LOCAL
       ===================================================================== */

  const updateGroup = (groupId, changes) => {
    setGroups((current) =>
      current.map((group) =>
        group.id === groupId
          ? {
            ...group,
            ...changes,
          }
          : group,
      ),
    );
  };

  /* =====================================================================
       UPDATE FIELD LOCAL
       ===================================================================== */

  const updateField = (itemId, changes) => {
    setGroups((current) =>
      current.map((group) => ({
        ...group,

        data: group.data.map((item) =>
          item.id === itemId
            ? {
              ...item,
              ...changes,
            }
            : item,
        ),
      })),
    );
  };

  /* =====================================================================
       DELETE GROUP - LOCAL ONLY
       ===================================================================== */

  const deleteGroup = (group) => {
    setGroups((current) => current.filter((item) => item.id !== group.id));

    setSelectedItem(null);
  };

  /* =====================================================================
       DELETE FIELD - LOCAL ONLY
       ===================================================================== */

  const deleteField = (item) => {
    setGroups((current) =>
      current.map((group) => {
        if (!group.data.some((field) => field.id === item.id)) {
          return group;
        }

        return {
          ...group,

          data: group.data.filter((field) => field.id !== item.id),
        };
      }),
    );

    setSelectedItem(null);
  };

  /* =====================================================================
       ADD GROUP - LOCAL ONLY
       ===================================================================== */

  const addGroup = (name) => {
    const id = `local-group-${Date.now()}`;

    /**
     * Appended records get no rank. `rank_key` is left out of
     * the create payload and the backend assigns the next rank
     * in the scope; the saved record is then refetched to pick
     * it up. Guessing one here is how duplicates happen.
     */
    const group = {
      id,

      group_name: name,

      [RANK_FIELD]: null,

      is_active: true,

      module_name: SIDEBAR_GROUP_MODULE,

      data: [],

      isNew: true,
    };

    setGroups((current) => [...current, group]);

    setSelectedItem({
      type: "group",
      id,
    });

    setExpandedGroups((current) => ({
      ...current,
      [id]: true,
    }));
  };

  /* =====================================================================
       ADD FIELD - LOCAL ONLY
       ===================================================================== */

  const addField = ({ groupId, name, icon }) => {
    setGroups((current) =>
      current.map((group) => {
        if (group.id !== groupId) {
          return group;
        }

        const id = `local-item-${Date.now()}`;

        /*
         * Appended, so no rank is sent. The backend assigns the
         * next rank inside this group_name scope.
         */
        const newItem = {
          id,

          name,

          module: SIDEBAR_MODULE_MODULE,

          module_name: name.toLowerCase().replace(/\s+/g, "_"),

          library: "lu",

          icon: icon || "Settings2",

          key: "",

          data_filters: [],

          count_filters: [],

          count_email_req: 0,

          navigation: "",

          endpoint: "",

          [RANK_FIELD]: null,

          description: "",

          is_active: true,

          isNew: true,
        };

        setTimeout(() => {
          setSelectedItem({
            type: "field",
            id,
          });
        }, 0);

        return {
          ...group,

          data: [...group.data, newItem],
        };
      }),
    );

    setExpandedGroups((current) => ({
      ...current,
      [groupId]: true,
    }));
  };

  /* =====================================================================
       DRAG START
       ===================================================================== */

  const handleDragStart = ({ active }) => {
    setActiveDrag(active.data.current);
  };

  /* =====================================================================
       MOVE A GROUP
       ===================================================================== */

  /**
   * Scope: the global group list.
   *
   * One update on the moved group, carrying the IDs of the
   * groups now either side of it.
   */
  const moveGroup = (movedId, destinationIndex, sourceGroups) => {
    const reordered = reorderCopy(sourceGroups, movedId, destinationIndex);

    /* Optimistic: show the new order while the write runs. */
    setGroups(reordered);

    return runMove({
      plan: {
        items: reordered,
        movedId,
        scope: groupScope(),
        module: SIDEBAR_GROUP_MODULE,
      },

      restoreOrder: () => setGroups(sourceGroups),
    });
  };

  /* =====================================================================
       MOVE A FIELD
       ===================================================================== */

  /**
   * Scope: the modules of one group_name.
   *
   * Neighbours are read from the DESTINATION group only. The
   * source group just loses a record; the records left behind
   * keep their ranks, because removing an item never
   * invalidates the ranks around it.
   *
   * `group_name` is sent on every module move, not only
   * cross-group ones, so the backend always knows which scope
   * to validate the neighbours against.
   */
  const moveField = ({
    movedId,
    sourceGroupId,
    targetGroupId,
    destinationIndex,
    sourceGroups,
  }) => {
    const crossScope = String(sourceGroupId) !== String(targetGroupId);

    const sourceGroup = sourceGroups.find(
      (group) => String(group.id) === String(sourceGroupId),
    );

    const targetGroup = sourceGroups.find(
      (group) => String(group.id) === String(targetGroupId),
    );

    if (!sourceGroup || !targetGroup) {
      return Promise.resolve(null);
    }

    const moved = (sourceGroup.data ?? []).find(
      (item) => String(item.id) === String(movedId),
    );

    if (!moved) {
      return Promise.resolve(null);
    }

    let targetFields;
    let sourceFields = null;

    if (crossScope) {
      sourceFields = (sourceGroup.data ?? []).filter(
        (item) => String(item.id) !== String(movedId),
      );

      targetFields = [...(targetGroup.data ?? [])];

      targetFields.splice(
        Math.max(0, Math.min(destinationIndex, targetFields.length)),
        0,
        moved,
      );
    } else {
      targetFields = reorderCopy(
        targetGroup.data ?? [],
        movedId,
        destinationIndex,
      );
    }

    /* Optimistic. */
    setGroups((current) =>
      current.map((group) => {
        if (String(group.id) === String(targetGroupId)) {
          return { ...group, data: targetFields };
        }

        if (sourceFields && String(group.id) === String(sourceGroupId)) {
          return { ...group, data: sourceFields };
        }

        return group;
      }),
    );

    return runMove({
      plan: {
        items: targetFields,
        movedId,
        scope: moduleScope(targetGroup.group_name),
        module: SIDEBAR_MODULE_MODULE,

        /* Destination scope, always sent. */
        scopeFields: { group_name: targetGroup.group_name },
      },

      restoreOrder: () => setGroups(sourceGroups),
    });
  };

  /* =====================================================================
       DRAG END
       ===================================================================== */

  const handleDragEnd = ({ active, over }) => {
    setActiveDrag(null);

    if (!over) return;

    /*
     * A move can be in flight, and the rank data can be
     * invalid. Either way the neighbour IDs a new move would be
     * derived from cannot be trusted.
     */
    if (savingOrder || rankError) return;

    const activeData = active.data?.current;
    const overData = over.data?.current;

    if (!activeData || !overData) return;

    /* ================================================================
           GROUP REORDER - scope: the global group list
           ================================================================ */

    if (activeData.type === "group") {
      if (overData.type !== "group") return;

      const activeGroupId = activeData.groupId;
      const overGroupId = overData.groupId;

      if (!activeGroupId || !overGroupId) return;
      if (String(activeGroupId) === String(overGroupId)) return;

      const oldIndex = groups.findIndex(
        (group) => String(group.id) === String(activeGroupId),
      );

      const newIndex = groups.findIndex(
        (group) => String(group.id) === String(overGroupId),
      );

      if (oldIndex === -1 || newIndex === -1) return;
      if (oldIndex === newIndex) return;

      if (!isPersistableId(activeGroupId)) {
        toast.error("Save this group in the CRM before reordering it.");
        return;
      }

      moveGroup(activeGroupId, newIndex, groups);
      return;
    }

    /* ================================================================
           FIELD REORDER - scope: modules of one group_name
           ================================================================ */

    if (activeData.type === "item") {
      if (overData.type !== "item") return;

      const activeItemId = activeData.itemId;
      const overItemId = overData.itemId;

      if (!activeItemId || !overItemId) return;
      if (String(activeItemId) === String(overItemId)) return;

      const sourceGroup = groups.find((group) =>
        group.data?.some((item) => String(item.id) === String(activeItemId)),
      );

      const targetGroup = groups.find((group) =>
        group.data?.some((item) => String(item.id) === String(overItemId)),
      );

      if (!sourceGroup || !targetGroup) return;

      const oldIndex = sourceGroup.data.findIndex(
        (item) => String(item.id) === String(activeItemId),
      );

      /*
       * Destination index inside the TARGET group. For a
       * cross-group move this is where the record is inserted;
       * neighbours are only ever read from this scope.
       */
      const newIndex = targetGroup.data.findIndex(
        (item) => String(item.id) === String(overItemId),
      );

      if (oldIndex === -1 || newIndex === -1) return;

      if (!isPersistableId(activeItemId)) {
        toast.error("Save this field in the CRM before reordering it.");
        return;
      }

      moveField({
        movedId: activeItemId,
        sourceGroupId: sourceGroup.id,
        targetGroupId: targetGroup.id,
        destinationIndex: newIndex,
        sourceGroups: groups,
      });
    }
  };

  /* =====================================================================
       RESET
       ===================================================================== */

  const resetChanges = () => {
    if (!layoutData) {
      return;
    }

    applyServerLayout(layoutData);
  };

  /* =====================================================================
       LOADING
       ===================================================================== */

  if (layoutLoading) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center">
        <div className="text-sm text-muted-foreground">Loading sidebar...</div>
      </div>
    );
  }

  /* =====================================================================
       RENDER
       ===================================================================== */

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* HEADER */}

      <div
        className="
                    flex
                    shrink-0
                    items-center
                    justify-between
                    border-b
                    border-border
                    px-5
                    py-4
                "
      >
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Sidebar</h2>

            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
              Layout
            </span>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure sidebar groups, fields, visibility and ordering.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savingOrder && (
            <span
              role="status"
              className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary"
            >
              Saving order...
            </span>
          )}

          <button
            type="button"
            onClick={resetChanges}
            disabled={updateLayoutPending || savingOrder}
            className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-border
                            px-3
                            py-2
                            text-sm
                            font-medium
                            hover:bg-accent
                            disabled:pointer-events-none
                            disabled:opacity-50
                        "
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>

          <button
            type="button"
            onClick={() => addGroup("New Group")}
            className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-primary
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-primary-foreground
                        "
          >
            <Plus className="h-4 w-4" />
            Add Group
          </button>
        </div>
      </div>

      {/* =====================================================================
             INVALID RANK DATA
             ===================================================================== */}

      {rankError && (
        <div
          role="alert"
          className="
                        shrink-0
                        border-b
                        border-destructive/30
                        bg-destructive/10
                        px-5
                        py-3
                    "
        >
          <p className="text-sm font-medium text-destructive">
            {rankError.message}
          </p>

          <ul className="mt-1 space-y-0.5">
            {rankError.reports.map((report) => (
              <li
                key={report.scopeLabel}
                className="text-xs text-destructive/80"
              >
                {report.scopeLabel}
                {report.missing.length
                  ? ` - missing rank on ${report.missing.length} record(s)`
                  : ""}
                {report.duplicates.length
                  ? ` - duplicate rank(s): ${report.duplicates
                    .map((entry) => entry.rank)
                    .join(", ")}`
                  : ""}
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={reloadSidebar}
            className="
                            mt-2
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            border
                            border-destructive/30
                            px-2.5
                            py-1.5
                            text-xs
                            font-medium
                            text-destructive
                            hover:bg-destructive/10
                        "
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reload from server
          </button>
        </div>
      )}

      {/* MAIN TWO COLUMN AREA */}

      <div
        className="
                    grid
                    min-h-0
                    flex-1
                    grid-cols-1
                    overflow-hidden
                    lg:grid-cols-[minmax(300px,420px)_minmax(0,1fr)]
                "
      >
        {/* =========================================================
                    LEFT SIDEBAR BUILDER
                   ========================================================= */}

        <div
          className="
                        flex
                        min-h-0
                        flex-col
                        border-b
                        border-border
                        bg-card
                        lg:border-b-0
                        lg:border-r
                    "
        >
          {/* SEARCH */}

          <div className="shrink-0 border-b border-border p-3">
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
                placeholder="Search groups or fields..."
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
          </div>

          {/* BUILDER */}

          <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto p-3">
            <DndContext
              sensors={sensors}
              collisionDetection={collisionDetectionStrategy}
              onDragStart={handleDragStart}
              onDragCancel={() => {
                setActiveDrag(null);
              }}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredGroups.map((group) => `group-${group.id}`)}
                strategy={verticalListSortingStrategy}
                disabled={savingOrder || Boolean(rankError)}
              >
                <div className="space-y-3">
                  {filteredGroups.map((group) => (
                    <SortableGroup
                      key={group.id}
                      group={group}
                      selected={
                        selectedItem?.type === "group" &&
                        selectedItem?.id === group.id
                      }
                      onSelect={selectGroup}
                      onToggle={toggleGroup}
                      onAddField={() =>
                        addField({
                          groupId: group.id,

                          name: "New Field",

                          icon: "Settings2",
                        })
                      }
                    >
                      <SortableContext
                        items={group.data.map((item) => `item-${item.id}`)}
                        strategy={verticalListSortingStrategy}
                        disabled={savingOrder || Boolean(rankError)}
                      >
                        <div className="space-y-0.5">
                          {group.data.map((item) => (
                            <SortableField
                              key={item.id}
                              item={item}
                              groupId={group.id}
                              selected={
                                selectedItem?.type === "field" &&
                                selectedItem?.id === item.id
                              }
                              onSelect={selectField}
                              onToggle={toggleField}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </SortableGroup>
                  ))}
                </div>
              </SortableContext>

              <DragOverlay>
                {activeDrag?.type === "group" ? (
                  <div className="rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-xl">
                    <p className="text-sm font-semibold">Moving group</p>
                  </div>
                ) : activeDrag?.type === "item" ? (
                  <div className="rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-xl">
                    <p className="text-sm font-medium">Moving field</p>
                  </div>
                ) : null}
              </DragOverlay>
            </DndContext>
          </div>
        </div>

        {/* =========================================================
                    RIGHT EDITOR
                   ========================================================= */}

        <div
          className="
                        min-h-0
                        overflow-hidden
                        bg-background
                    "
        >
          {selectedItem?.type === "group" && (
            <GroupEditor
              group={selectedObject}
              onUpdate={(changes) => {
                /**
                 * is_active is a backend field, so the
                 * editor toggles have to persist. Everything
                 * else in this panel is still local-only.
                 */
                if (
                  Object.prototype.hasOwnProperty.call(changes, "is_active")
                ) {
                  setGroupActive(selectedObject, changes.is_active);

                  return;
                }

                updateGroup(selectedItem.id, changes);
              }}
              onDelete={deleteGroup}
              onAddField={() =>
                addField({
                  groupId: selectedObject?.id,

                  name: "New Field",

                  icon: "Settings2",
                })
              }
            />
          )}

          {selectedItem?.type === "field" && (
            <ItemEditor
              item={selectedObject}
              onUpdate={(changes) => {
                if (
                  Object.prototype.hasOwnProperty.call(changes, "is_active")
                ) {
                  setFieldActive(selectedObject, changes.is_active);

                  return;
                }

                updateField(selectedItem.id, changes);
              }}
              onDelete={deleteField}
            />
          )}

          {!selectedItem && <EmptyEditor />}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
