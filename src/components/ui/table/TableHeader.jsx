import { ArrowDown, ArrowUp } from "lucide-react";
import { useTableContext } from "./Table";
import useColumnResize from "./hooks/useColumnResize";

export default function TableHeader() {
    const {
        stickyColumns,
        gridTemplate,
        sorting,
        setSort,
        columnWidths,
        resizeColumn,
    } = useTableContext();

    const { startResize } = useColumnResize({
        columnWidths,
        resizeColumn,
    });

    const toggleSort = (column) => {
        if (!column.sortable) return;

        setSort((prev) => {
            if (prev.column === column.accessor) {
                return {
                    column: column.accessor,
                    direction:
                        prev.direction === "asc"
                            ? "desc"
                            : "asc",
                };
            }

            return {
                column: column.accessor,
                direction: "asc",
            };
        });
    };

    return (
        <div
            className="sticky top-0 z-50 border-b bg-gradient-to-r from-[#054FD1] via-[#043EA5] to-[#03286B]"
            style={{
                display: "grid",
                gridTemplateColumns: gridTemplate,
            }}
        >
            {stickyColumns.map((column) => {
                const Icon = column.icon;

                const isSorted =
                    sorting?.column === column.accessor;

                return (
                    <div
                        key={column.accessor}
                        onClick={() => toggleSort(column)}
                        className={`
              relative
              flex
              h-12
              items-center
              gap-2
              border-r
              border-blue-400/30
              px-4
              text-sm
              font-semibold
              text-white
              select-none
              ${column.sortable ? "cursor-pointer" : ""}
              ${column.headerClasses || ""}
            `}
                        style={{
                            position: column.sticky ? "sticky" : "relative",
                            boxShadow:
                                column.sticky
                                    ? "2px 0 6px rgba(0,0,0,.18)"
                                    : undefined,
                            left: column.sticky ? `${column.left}px` : undefined,

                            zIndex: column.sticky ? 200 : 1,

                            background: "#0B3D91",

                            isolation: "isolate",
                        }}
                    >
                        {Icon && (
                            <Icon
                                size={16}
                                className="shrink-0 opacity-90"
                            />
                        )}

                        <span className="truncate flex-1">
                            {column.label}
                        </span>

                        {column.sortable && (
                            <>
                                {isSorted ? (
                                    sorting.direction === "asc" ? (
                                        <ArrowUp
                                            size={14}
                                            className="shrink-0"
                                        />
                                    ) : (
                                        <ArrowDown
                                            size={14}
                                            className="shrink-0"
                                        />
                                    )
                                ) : (
                                    <ArrowUp
                                        size={12}
                                        className="opacity-20"
                                    />
                                )}
                            </>
                        )}

                        {column.resizable && (
                            <div
                                onPointerDown={(e) =>
                                    startResize(
                                        e,
                                        column.accessor
                                    )
                                }
                                className="
                  absolute
                  top-0
                  right-0
                  h-full
                  w-[6px]
                  cursor-col-resize
                  hover:bg-white/20
                  active:bg-white/40
                "
                            />
                        )}
                    </div>
                );
            })}
        </div>
    );
}