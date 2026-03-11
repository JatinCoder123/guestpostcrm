import { Loader2Icon } from "lucide-react";
import InfinitePagination from "../../InfinitePagination";
import { useTableContext } from "./Table";

function TableBody() {

    const {
        data,
        visibleColumns,
        loading,
        pageIndex,
        pageCount,
        fetchNextPage
    } = useTableContext();

    const Row = ({ index, style, data }) => {

        // Loader row
        if (index >= data.length) {
            return (
                <div
                    style={style}
                    className="flex items-center justify-center border-b border-gray-100 px-6"
                >
                    <Loader2Icon color="gray" />
                </div>
            );
        }

        const row = data[index];

        return (
            <div
                className="grid border-b border-gray-100 hover:bg-gray-50"
                style={{
                    ...style,
                    gridTemplateColumns: `repeat(${visibleColumns.length}, minmax(0,1fr))`
                }}
            >
                {visibleColumns.map((col) => {

                    const value = row[col.accessor];

                    return (
                        <div
                            key={col.accessor}
                            className="px-6 py-4 text-sm text-gray-700"
                        >

                            {col.render
                                ? col.render(row)
                                : value}

                        </div>
                    );

                })}
            </div>
        );
    };

    return (

        <tbody className="w-full">

            <InfinitePagination
                fn={fetchNextPage}
                data={data}
                pageCount={pageCount}
                pageIndex={pageIndex}
                Row={Row}
                loading={loading}
            />

        </tbody>

    );
}

export default TableBody;