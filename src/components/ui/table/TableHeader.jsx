import { ArrowUpDown } from "lucide-react";
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

            className={`${props.headerStyle} ${props.layoutStyle} `}

        >

            {visibleColumns.map(col => {

                const Icon = col.icon;

                return (

                    <div
                        key={col.accessor}
                        className={`px-6 py-4 flex items-center gap-2 ${col.headerClasses}   font-bold text-white`}
                    >

                        {Icon && (
                            <div className={`p-1 rounded `}>
                                <Icon className="w-4 h-4" />
                            </div>
                        )}

                        {col.label.toUpperCase()}

                    </div>

                )

            })}

        </div>
    );
}

export default TableHeader;