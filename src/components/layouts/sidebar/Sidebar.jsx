import React, {
    useEffect,
    useMemo,
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
    arrayMove,
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


/* =========================================================================
   ICON REGISTRY
   ========================================================================= */

const iconRegistry = {
    ...LucideIcons,
};


/* =========================================================================
   DYNAMIC ICON
   ========================================================================= */

function DynamicIcon({
    icon,
    className = "h-4 w-4",
}) {
    const Icon =
        icon && iconRegistry[icon]
            ? iconRegistry[icon]
            : Settings2;

    return <Icon className={className} />;
}


/* =========================================================================
   NORMALIZE RESPONSE
   ========================================================================= */

function normalizeSidebarResponse(response) {
    const groups = Array.isArray(response)
        ? response
        : response?.data || [];

    return groups
        .map((group, groupIndex) => ({
            ...group,

            group_priority:
                Number(group.group_priority) ||
                groupIndex + 1,

            is_active:
                String(group.is_active) === "1" ||
                group.is_active === true,

            data: (group.data || [])
                .map((item, itemIndex) => ({
                    ...item,

                    weight:
                        Number(item.weight) ||
                        itemIndex + 1,

                    is_active:
                        String(item.is_active) === "1" ||
                        item.is_active === true,
                }))
                .sort(
                    (a, b) =>
                        a.weight - b.weight,
                ),
        }))
        .sort(
            (a, b) =>
                a.group_priority -
                b.group_priority,
        );
}


/* =========================================================================
   TOGGLE
   ========================================================================= */

function Toggle({
    checked,
    onChange,
}) {
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
                ${checked
                    ? "bg-primary"
                    : "bg-muted"
                }
            `}
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
                    ${checked
                        ? "left-6"
                        : "left-1"
                    }
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
        transform:
            CSS.Transform.toString(transform),

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

                ${isDragging
                    ? "opacity-50"
                    : ""
                }
            `}
        >
            {/* GROUP HEADER */}

            <div
                onClick={() =>
                    onSelect(group)
                }
                className={`
                    flex
                    cursor-pointer
                    items-center
                    gap-2
                    px-3
                    py-2.5
                    transition-colors

                    ${selected
                        ? "bg-primary/[0.05]"
                        : "hover:bg-accent/50"
                    }
                `}
            >
                {/* DRAG HANDLE */}

                <button
                    type="button"
                    {...attributes}
                    {...listeners}
                    onClick={(event) =>
                        event.stopPropagation()
                    }
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

                <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                        {group.group_name}
                    </p>

                    <p className="text-[11px] text-muted-foreground">
                        {group.data.length}{" "}
                        {group.data.length === 1
                            ? "field"
                            : "fields"}
                    </p>
                </div>

                {/* ACTIVE */}

                <Toggle
                    checked={group.is_active}
                    onChange={() =>
                        onToggle(group.id)
                    }
                />

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
                    onClick={() =>
                        onAddField(group)
                    }
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

function SortableField({
    item,
    selected,
    onSelect,
    onToggle,
}) {
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
        },
    });

    const style = {
        transform:
            CSS.Transform.toString(transform),

        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() =>
                onSelect(item)
            }
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

                ${selected
                    ? "bg-primary/10"
                    : "hover:bg-accent/60"
                }

                ${isDragging
                    ? "opacity-50"
                    : ""
                }
            `}
        >
            {/* DRAG */}

            <button
                type="button"
                {...attributes}
                {...listeners}
                onClick={(event) =>
                    event.stopPropagation()
                }
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

            <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium text-foreground">
                    {item.name}
                </p>
            </div>

            {/* WEIGHT */}

            <span className="text-[10px] text-muted-foreground">
                {item.weight}
            </span>

            {/* ACTIVE */}

            <Toggle
                checked={item.is_active}
                onChange={() =>
                    onToggle(item.id)
                }
            />
        </div>
    );
}


/* =========================================================================
   INPUT
   ========================================================================= */

function FieldInput({
    label,
    value,
    onChange,
    placeholder,
}) {
    return (
        <div>
            <label className="mb-1.5 block text-xs font-medium text-foreground">
                {label}
            </label>

            <input
                value={value ?? ""}
                onChange={(event) =>
                    onChange(
                        event.target.value,
                    )
                }
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

function GroupEditor({
    group,
    onUpdate,
    onDelete,
    onAddField,
}) {
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

                        <h3 className="mt-1 text-base font-semibold">
                            Group Settings
                        </h3>
                    </div>

                    <Toggle
                        checked={group.is_active}
                        onChange={() =>
                            onUpdate({
                                is_active:
                                    !group.is_active,
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
                                group_name:
                                    value,
                            })
                        }
                        placeholder="Enter group name"
                    />

                    <div>
                        <label className="mb-1.5 block text-xs font-medium">
                            Group Weight
                        </label>

                        <input
                            type="number"
                            value={
                                group.group_priority ??
                                0
                            }
                            onChange={(event) =>
                                onUpdate({
                                    group_priority:
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ),
                                })
                            }
                            className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-border
                                bg-background
                                px-3
                                text-sm
                                outline-none
                                focus:border-primary/50
                            "
                        />
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
                            <p className="text-sm font-medium">
                                Show in sidebar
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Enable or disable
                                the entire group.
                            </p>
                        </div>

                        <Toggle
                            checked={
                                group.is_active
                            }
                            onChange={() =>
                                onUpdate({
                                    is_active:
                                        !group.is_active,
                                })
                            }
                        />
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold">
                                    Fields
                                </p>

                                <p className="text-xs text-muted-foreground">
                                    {group.data.length} fields
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    onAddField(group)
                                }
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
                            {group.data.map(
                                (item) => (
                                    <div
                                        key={
                                            item.id
                                        }
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
                                            icon={
                                                item.icon
                                            }
                                            className="
                                                h-4
                                                w-4
                                                text-muted-foreground
                                            "
                                        />

                                        <span className="min-w-0 flex-1 truncate text-xs font-medium">
                                            {
                                                item.name
                                            }
                                        </span>

                                        <span className="text-[10px] text-muted-foreground">
                                            {
                                                item.weight
                                            }
                                        </span>
                                    </div>
                                ),
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border p-4">
                <button
                    type="button"
                    onClick={() =>
                        onDelete(group)
                    }
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

function ItemEditor({
    item,
    onUpdate,
    onDelete,
}) {
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
                                is_active:
                                    !item.is_active,
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
                                module_name:
                                    value,
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
                                navigation:
                                    value,
                            })
                        }
                        placeholder="/contacts"
                    />

                    <FieldInput
                        label="Endpoint"
                        value={item.endpoint}
                        onChange={(value) =>
                            onUpdate({
                                endpoint:
                                    value,
                            })
                        }
                        placeholder="/api/contacts"
                    />

                    <div>
                        <label className="mb-1.5 block text-xs font-medium">
                            Weight
                        </label>

                        <input
                            type="number"
                            value={
                                item.weight ?? 0
                            }
                            onChange={(event) =>
                                onUpdate({
                                    weight:
                                        Number(
                                            event
                                                .target
                                                .value,
                                        ),
                                })
                            }
                            className="
                                h-10
                                w-full
                                rounded-lg
                                border
                                border-border
                                bg-background
                                px-3
                                text-sm
                                outline-none
                                focus:border-primary/50
                            "
                        />
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
                            <p className="text-sm font-medium">
                                Active
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Show this field
                                in the sidebar.
                            </p>
                        </div>

                        <Toggle
                            checked={
                                item.is_active
                            }
                            onChange={() =>
                                onUpdate({
                                    is_active:
                                        !item.is_active,
                                })
                            }
                        />
                    </div>

                    <div>
                        <p className="mb-2 text-sm font-semibold">
                            Configuration
                        </p>

                        <div className="rounded-xl border border-border bg-muted/20 p-3">
                            <pre className="max-h-52 overflow-auto text-[10px] leading-5 text-muted-foreground">
                                {JSON.stringify(
                                    item,
                                    null,
                                    2,
                                )}
                            </pre>
                        </div>
                    </div>
                </div>
            </div>

            <div className="border-t border-border p-4">
                <button
                    type="button"
                    onClick={() =>
                        onDelete(item)
                    }
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

            <h3 className="text-sm font-semibold">
                Nothing selected
            </h3>

            <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
                Select a group or sidebar field
                from the left to configure its
                properties.
            </p>
        </div>
    );
}


/* =========================================================================
   SIDEBAR PAGE
   ========================================================================= */

const Sidebar = () => {
    const {
        data: layoutData,
        isPending: layoutLoading,
    } = useLayoutPreferences();

    /*
     * IMPORTANT:
     *
     * This mutation is ONLY called after
     * drag/drop reordering.
     *
     * Nothing else calls it.
     */
    const { mutate: updateLayout } =
        useUpdateLayout();

    const [groups, setGroups] =
        useState([]);

    const [
        selectedItem,
        setSelectedItem,
    ] = useState(null);

    const [search, setSearch] =
        useState("");

    const [
        expandedGroups,
        setExpandedGroups,
    ] = useState({});

    const [activeDrag, setActiveDrag] =
        useState(null);

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

    useEffect(() => {
        if (!layoutData) {
            return;
        }

        const normalized =
            normalizeSidebarResponse(
                layoutData,
            );

        setGroups(normalized);

        if (normalized.length) {
            setSelectedItem({
                type: "group",
                id: normalized[0].id,
            });

            setExpandedGroups(
                Object.fromEntries(
                    normalized.map(
                        (group) => [
                            group.id,
                            true,
                        ],
                    ),
                ),
            );
        }
    }, [layoutData]);


    /* =====================================================================
       FILTER
       ===================================================================== */

    const filteredGroups =
        useMemo(() => {
            const query =
                search
                    .trim()
                    .toLowerCase();

            if (!query) {
                return groups;
            }

            return groups
                .map((group) => {
                    const groupMatch =
                        group.group_name
                            ?.toLowerCase()
                            .includes(query);

                    const fields =
                        group.data.filter(
                            (item) =>
                                groupMatch ||
                                item.name
                                    ?.toLowerCase()
                                    .includes(
                                        query,
                                    ) ||
                                item.module_name
                                    ?.toLowerCase()
                                    .includes(
                                        query,
                                    ),
                        );

                    return {
                        ...group,
                        data:
                            groupMatch
                                ? group.data
                                : fields,
                    };
                })
                .filter(
                    (group) =>
                        group.group_name
                            ?.toLowerCase()
                            .includes(query) ||
                        group.data.length > 0,
                );
        }, [
            groups,
            search,
        ]);


    /* =====================================================================
       SELECTED OBJECT
       ===================================================================== */

    const selectedObject =
        useMemo(() => {
            if (!selectedItem) {
                return null;
            }

            if (
                selectedItem.type ===
                "group"
            ) {
                return (
                    groups.find(
                        (group) =>
                            group.id ===
                            selectedItem.id,
                    ) || null
                );
            }

            for (const group of groups) {
                const item =
                    group.data.find(
                        (item) =>
                            item.id ===
                            selectedItem.id,
                    );

                if (item) {
                    return item;
                }
            }

            return null;
        }, [
            groups,
            selectedItem,
        ]);


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
       TOGGLE GROUP
       ===================================================================== */

    const toggleGroup = (groupId) => {
        setGroups((current) =>
            current.map(
                (group) =>
                    group.id === groupId
                        ? {
                            ...group,
                            is_active:
                                !group.is_active,
                        }
                        : group,
            ),
        );
    };


    /* =====================================================================
       TOGGLE FIELD
       ===================================================================== */

    const toggleField = (itemId) => {
        setGroups((current) =>
            current.map(
                (group) => ({
                    ...group,

                    data: group.data.map(
                        (item) =>
                            item.id ===
                                itemId
                                ? {
                                    ...item,
                                    is_active:
                                        !item.is_active,
                                }
                                : item,
                    ),
                }),
            ),
        );
    };


    /* =====================================================================
       UPDATE GROUP
       ===================================================================== */

    const updateGroup = (
        groupId,
        changes,
    ) => {
        setGroups((current) =>
            current.map(
                (group) =>
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
       UPDATE FIELD
       ===================================================================== */

    const updateField = (
        itemId,
        changes,
    ) => {
        setGroups((current) =>
            current.map(
                (group) => ({
                    ...group,

                    data: group.data.map(
                        (item) =>
                            item.id ===
                                itemId
                                ? {
                                    ...item,
                                    ...changes,
                                }
                                : item,
                    ),
                }),
            ),
        );
    };


    /* =====================================================================
       DELETE GROUP - LOCAL ONLY
       ===================================================================== */

    const deleteGroup = (group) => {
        setGroups((current) =>
            current
                .filter(
                    (item) =>
                        item.id !==
                        group.id,
                )
                .map(
                    (
                        item,
                        index,
                    ) => ({
                        ...item,
                        group_priority:
                            index + 1,
                    }),
                ),
        );

        setSelectedItem(null);
    };


    /* =====================================================================
       DELETE FIELD - LOCAL ONLY
       ===================================================================== */

    const deleteField = (item) => {
        setGroups((current) =>
            current.map(
                (group) => {
                    if (
                        !group.data.some(
                            (field) =>
                                field.id ===
                                item.id,
                        )
                    ) {
                        return group;
                    }

                    return {
                        ...group,

                        data:
                            group.data
                                .filter(
                                    (
                                        field,
                                    ) =>
                                        field.id !==
                                        item.id,
                                )
                                .map(
                                    (
                                        field,
                                        index,
                                    ) => ({
                                        ...field,
                                        weight:
                                            index +
                                            1,
                                    }),
                                ),
                    };
                },
            ),
        );

        setSelectedItem(null);
    };


    /* =====================================================================
       ADD GROUP - LOCAL ONLY
       ===================================================================== */

    const addGroup = (name) => {
        const id =
            `local-group-${Date.now()}`;

        const group = {
            id,

            group_name:
                name,

            group_priority:
                groups.length + 1,

            is_active: true,

            module_name:
                "outr_ui_groups",

            data: [],

            isNew: true,
        };

        setGroups(
            (current) => [
                ...current,
                group,
            ],
        );

        setSelectedItem({
            type: "group",
            id,
        });

        setExpandedGroups(
            (current) => ({
                ...current,
                [id]: true,
            }),
        );
    };


    /* =====================================================================
       ADD FIELD - LOCAL ONLY
       ===================================================================== */

    const addField = ({
        groupId,
        name,
        icon,
    }) => {
        setGroups((current) =>
            current.map(
                (group) => {
                    if (
                        group.id !==
                        groupId
                    ) {
                        return group;
                    }

                    const id =
                        `local-item-${Date.now()}`;

                    const newItem = {
                        id,

                        name,

                        module:
                            "outr_ui_modules",

                        module_name:
                            name
                                .toLowerCase()
                                .replace(
                                    /\s+/g,
                                    "_",
                                ),

                        library: "lu",

                        icon:
                            icon ||
                            "Settings2",

                        key: "",

                        data_filters: [],

                        count_filters: [],

                        count_email_req: 0,

                        navigation: "",

                        endpoint: "",

                        weight:
                            group.data.length +
                            1,

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

                        data: [
                            ...group.data,
                            newItem,
                        ],
                    };
                },
            ),
        );

        setExpandedGroups(
            (current) => ({
                ...current,
                [groupId]: true,
            }),
        );
    };


    /* =====================================================================
       DRAG START
       ===================================================================== */

    const handleDragStart = ({
        active,
    }) => {
        setActiveDrag(
            active.data.current,
        );
    };


    /* =====================================================================
       UPDATE GROUP WEIGHT API
       ===================================================================== */

    const updateGroupWeight = (
        group,
        weight,
    ) => {
        /*
         * API:
         *
         * model/module = group.module_name
         * id            = group.id
         * payload       = { weight }
         */

        if (!group?.id) {
            return;
        }

        if (
            String(group.id).startsWith(
                "local-",
            )
        ) {
            return;
        }
        console.log("GROUP", group)
        console.log("WEIGHT", weight)

        updateLayout({
            module: group.module,
            id: group.id,
            payload: { weight },
        });
    };


    /* =====================================================================
       UPDATE FIELD WEIGHT API
       ===================================================================== */

    const updateFieldWeight = (
        item,
        weight,
    ) => {
        /*
         * API:
         *
         * model/module = item.module_name
         * id            = item.id
         * payload       = { weight }
         */

        if (!item?.id) {
            return;
        }

        if (
            String(item.id).startsWith(
                "local-",
            )
        ) {
            return;
        }

        updateLayout({
            module:
                item.module,

            id: item.id,

            payload: {
                weight,
            },
        });
    };


    /* =====================================================================
       DRAG END
       ===================================================================== */

    const handleDragEnd = ({
        active,
        over,
    }) => {
        setActiveDrag(null);

        if (
            !over ||
            active.id === over.id
        ) {
            return;
        }

        const activeData =
            active.data.current;

        const overData =
            over.data.current;


        /* ================================================================
           GROUP REORDER
           ================================================================ */

        if (
            activeData?.type ===
            "group" &&
            overData?.type ===
            "group"
        ) {
            const oldIndex =
                groups.findIndex(
                    (group) =>
                        `group-${group.id}` ===
                        active.id,
                );

            const newIndex =
                groups.findIndex(
                    (group) =>
                        `group-${group.id}` ===
                        over.id,
                );

            if (
                oldIndex === -1 ||
                newIndex === -1
            ) {
                return;
            }

            const reordered =
                arrayMove(
                    groups,
                    oldIndex,
                    newIndex,
                ).map(
                    (
                        group,
                        index,
                    ) => ({
                        ...group,

                        group_priority:
                            index + 1,
                    }),
                );

            /*
             * Update UI immediately.
             */
            setGroups(reordered);

            /*
             * Only update the group
             * that was actually dragged.
             */
            const movedGroup =
                reordered[newIndex];

            updateGroupWeight(
                movedGroup,
                newIndex + 1,
            );

            return;
        }


        /* ================================================================
           FIELD REORDER
           ================================================================ */

        if (
            activeData?.type ===
            "item" &&
            overData?.type ===
            "item"
        ) {
            const activeId =
                activeData.itemId;

            const overId =
                overData.itemId;

            /*
             * Make sure both fields
             * belong to the same group.
             */
            const groupIndex =
                groups.findIndex(
                    (group) =>
                        group.data.some(
                            (item) =>
                                item.id ===
                                activeId,
                        ) &&
                        group.data.some(
                            (item) =>
                                item.id ===
                                overId,
                        ),
                );

            if (
                groupIndex === -1
            ) {
                return;
            }

            const group =
                groups[groupIndex];

            const oldIndex =
                group.data.findIndex(
                    (item) =>
                        item.id ===
                        activeId,
                );

            const newIndex =
                group.data.findIndex(
                    (item) =>
                        item.id ===
                        overId,
                );

            if (
                oldIndex === -1 ||
                newIndex === -1
            ) {
                return;
            }

            const reordered =
                arrayMove(
                    group.data,
                    oldIndex,
                    newIndex,
                ).map(
                    (
                        item,
                        index,
                    ) => ({
                        ...item,

                        weight:
                            index + 1,
                    }),
                );

            const nextGroups = [
                ...groups,
            ];

            nextGroups[groupIndex] = {
                ...group,

                data: reordered,
            };

            /*
             * Update UI immediately.
             */
            setGroups(
                nextGroups,
            );

            /*
             * Only update the field
             * that was dragged.
             */
            const movedField =
                reordered[newIndex];

            updateFieldWeight(
                movedField,
                newIndex + 1,
            );
        }
    };


    /* =====================================================================
       RESET
       ===================================================================== */

    const resetChanges = () => {
        if (!layoutData) {
            return;
        }

        const normalized =
            normalizeSidebarResponse(
                layoutData,
            );

        setGroups(normalized);

        if (normalized.length) {
            setSelectedItem({
                type: "group",
                id: normalized[0].id,
            });
        }
    };


    /* =====================================================================
       LOADING
       ===================================================================== */

    if (layoutLoading) {
        return (
            <div className="flex h-full min-h-[500px] items-center justify-center">
                <div className="text-sm text-muted-foreground">
                    Loading sidebar...
                </div>
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
                        <h2 className="text-lg font-semibold">
                            Sidebar
                        </h2>

                        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary">
                            Layout
                        </span>
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                        Configure sidebar groups,
                        fields, visibility and
                        ordering.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={resetChanges}
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
                        "
                    >
                        <RotateCcw className="h-4 w-4" />
                        Reset
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            addGroup(
                                "New Group",
                            )
                        }
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
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value,
                                    )
                                }
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
                            collisionDetection={
                                closestCenter
                            }
                            onDragStart={
                                handleDragStart
                            }
                            onDragEnd={
                                handleDragEnd
                            }
                        >
                            <SortableContext
                                items={filteredGroups.map(
                                    (group) =>
                                        `group-${group.id}`,
                                )}
                                strategy={
                                    verticalListSortingStrategy
                                }
                            >
                                <div className="space-y-3">
                                    {filteredGroups.map(
                                        (group) => (
                                            <SortableGroup
                                                key={
                                                    group.id
                                                }
                                                group={
                                                    group
                                                }
                                                selected={
                                                    selectedItem?.type ===
                                                    "group" &&
                                                    selectedItem?.id ===
                                                    group.id
                                                }
                                                onSelect={
                                                    selectGroup
                                                }
                                                onToggle={
                                                    toggleGroup
                                                }
                                                onAddField={() =>
                                                    addField(
                                                        {
                                                            groupId:
                                                                group.id,
                                                            name:
                                                                "New Field",
                                                            icon:
                                                                "Settings2",
                                                        },
                                                    )
                                                }
                                            >
                                                <SortableContext
                                                    items={group.data.map(
                                                        (
                                                            item,
                                                        ) =>
                                                            `item-${item.id}`,
                                                    )}
                                                    strategy={
                                                        verticalListSortingStrategy
                                                    }
                                                >
                                                    <div className="space-y-0.5">
                                                        {group.data.map(
                                                            (
                                                                item,
                                                            ) => (
                                                                <SortableField
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    item={
                                                                        item
                                                                    }
                                                                    selected={
                                                                        selectedItem?.type ===
                                                                        "field" &&
                                                                        selectedItem?.id ===
                                                                        item.id
                                                                    }
                                                                    onSelect={
                                                                        selectField
                                                                    }
                                                                    onToggle={
                                                                        toggleField
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </div>
                                                </SortableContext>
                                            </SortableGroup>
                                        ),
                                    )}
                                </div>
                            </SortableContext>

                            <DragOverlay>
                                {activeDrag?.type ===
                                    "group" ? (
                                    <div className="rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-xl">
                                        <p className="text-sm font-semibold">
                                            Moving group
                                        </p>
                                    </div>
                                ) : activeDrag?.type ===
                                    "item" ? (
                                    <div className="rounded-xl border border-primary/30 bg-card px-4 py-3 shadow-xl">
                                        <p className="text-sm font-medium">
                                            Moving field
                                        </p>
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
                    {selectedItem?.type ===
                        "group" && (
                            <GroupEditor
                                group={
                                    selectedObject
                                }
                                onUpdate={(
                                    changes,
                                ) =>
                                    updateGroup(
                                        selectedItem.id,
                                        changes,
                                    )
                                }
                                onDelete={
                                    deleteGroup
                                }
                                onAddField={() =>
                                    addField(
                                        {
                                            groupId:
                                                selectedObject?.id,
                                            name:
                                                "New Field",
                                            icon:
                                                "Settings2",
                                        },
                                    )
                                }
                            />
                        )}

                    {selectedItem?.type ===
                        "field" && (
                            <ItemEditor
                                item={
                                    selectedObject
                                }
                                onUpdate={(
                                    changes,
                                ) =>
                                    updateField(
                                        selectedItem.id,
                                        changes,
                                    )
                                }
                                onDelete={
                                    deleteField
                                }
                            />
                        )}

                    {!selectedItem && (
                        <EmptyEditor />
                    )}
                </div>
            </div>
        </div>
    );
};


export default Sidebar;