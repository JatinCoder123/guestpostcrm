import { useTableContext } from "./Table";

function TableHeader(props) {
    const { visibleColumns, sort, setSort } = useTableContext();

    const toggleSort = (column) => {

        if (!column.sortable) return;

        setSort((prev) => {

            if (prev.column === column.accessor) {
                return {
                    column: column.accessor,
                    direction: prev.direction === "asc" ? "desc" : "asc"
                };
            }

            return {
                column: column.accessor,
                direction: "asc"
            };

        });

    };

    return (
        <div

            className={`bg-blue-600 ${props.layoutStyle} `}

        >

            {visibleColumns.map(col => {

                const Icon = col.icon;

                return (

                    <div
                        key={col.accessor}
                        className={`min-w-0 px-3 py-3 sm:px-6 sm:py-4 flex items-center gap-1.5 sm:gap-2 ${col.headerClasses}   text-xs sm:text-sm font-bold text-white`}
                    >

                        {Icon && (
                            <div className={`shrink-0 p-1 rounded `}>
                                <Icon className="w-4 h-4" />
                            </div>
                        )}

                        <span className="truncate">{col.label.toUpperCase()}</span>

                    </div>

                )

            })}

        </div>
    );
}

export default TableHeader;