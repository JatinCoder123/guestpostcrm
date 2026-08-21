import {
    ArrowDown,
    ArrowDownUp,
    ArrowUp,
} from "lucide-react";
import { useTableContext } from "./Table";
import useColumnResize from "./hooks/useColumnResize";

export default function TableHeader() {
    const {
        stickyColumns,
        gridTemplate,
        sort,
        toggleSort,
        columnWidths,
        resizeColumn,
    } = useTableContext();

    const { startResize } =
        useColumnResize({
            columnWidths,
            resizeColumn,
        });

    const handleToggleSort = (
        column
    ) => {
        if (!column.sortable) return;

        const getNewSort = (sort) => {
            if (
                sort.order_by ===
                column.accessor
            ) {
                return {
                    order_by:
                        column.accessor,
                    order_dir:
                        sort.order_dir ===
                            "ASC"
                            ? "DESC"
                            : "ASC",
                };
            }

            return {
                order_by:
                    column.accessor,
                order_dir: "ASC",
            };
        };

        toggleSort(
            getNewSort(sort)
        );
    };

    return (
        <div
            className="
                sticky
                top-0
                z-50
                border-b
                border-border
                bg-secondary
            "
            style={{
                display: "grid",
                gridTemplateColumns:
                    gridTemplate,
            }}
        >
            {stickyColumns.map(
                (column) => {
                    const Icon =
                        column.icon;

                    const isSorted =
                        sort?.order_by ===
                        column.accessor;

                    return (
                        <div
                            key={
                                column.accessor
                            }
                            onClick={() =>
                                handleToggleSort(
                                    column
                                )
                            }
                            className={`
                                relative
                                flex
                                h-12
                                items-center
                                gap-2
                                border-r
                                border-border/30
                                px-4
                                text-sm
                                font-semibold
                                text-secondary-foreground
                                select-none

                                ${column.sortable
                                    ? "cursor-pointer"
                                    : ""
                                }

                                ${column.headerClasses ||
                                ""
                                }
                            `}
                            style={{
                                position:
                                    column.sticky
                                        ? "sticky"
                                        : "relative",

                                boxShadow:
                                    column.sticky
                                        ? "2px 0 6px color-mix(in srgb, var(--foreground) 18%, transparent)"
                                        : undefined,

                                left:
                                    column.sticky
                                        ? `${column.left}px`
                                        : undefined,

                                zIndex:
                                    column.sticky
                                        ? 200
                                        : 1,

                                /*
                                 * IMPORTANT:
                                 * Use CSS variable instead of
                                 * hardcoded #0B3D91.
                                 */
                                background:
                                    "var(--secondary)",

                                isolation:
                                    "isolate",
                            }}
                        >
                            {Icon && (
                                <Icon
                                    size={16}
                                    className="
                                        shrink-0
                                        opacity-90
                                    "
                                />
                            )}

                            <span
                                className="
                                    flex-1
                                    truncate
                                "
                            >
                                {
                                    column.label
                                }
                            </span>

                            {column.sortable && (
                                <>
                                    {isSorted ? (
                                        sort?.order_dir ===
                                            "ASC" ? (
                                            <ArrowUp
                                                size={
                                                    14
                                                }
                                                className="
                                                    shrink-0
                                                "
                                            />
                                        ) : (
                                            <ArrowDown
                                                size={
                                                    14
                                                }
                                                className="
                                                    shrink-0
                                                "
                                            />
                                        )
                                    ) : (
                                        <ArrowDownUp
                                            size={
                                                12
                                            }
                                            className="
                                                opacity-50
                                            "
                                        />
                                    )}
                                </>
                            )}

                            {column.resizable && (
                                <div
                                    onPointerDown={(
                                        e
                                    ) =>
                                        startResize(
                                            e,
                                            column.accessor
                                        )
                                    }
                                    className="
                                        absolute
                                        right-0
                                        top-0
                                        h-full
                                        w-[6px]
                                        cursor-col-resize
                                        hover:bg-secondary-foreground/20
                                        active:bg-secondary-foreground/40
                                    "
                                />
                            )}
                        </div>
                    );
                }
            )}
        </div>
    );
}