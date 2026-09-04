import { Loader2Icon } from "lucide-react";
import InfinitePagination from "../../InfinitePagination";
import { useTableContext } from "./Table";
import { LoadingChase } from "../../Loading";
function TableBody(props) {
  const { data, visibleColumns, loading, pageIndex, pageCount, fetchNextPage } =
    useTableContext();

  const Row = ({ index, style, data }) => {
    if (index >= data.length && loading) {
      return (
        <div
          style={style}
          className="flex items-center justify-center border-b border-gray-100 px-6"
        >
          <LoadingChase color="gray" />
        </div>
      );
    }

    const row = data[index];
    if (!row) return null;

    const rowClass =
      typeof props.rowClassName === "function"
        ? props.rowClassName(row, index)
        : props.rowClassName || "";

    return (
      <div
        className={`${props.layoutStyle} border-b border-gray-100 hover:bg-gray-50 ${props.onRowClick ? "cursor-pointer" : ""} ${rowClass}`}
        style={style}
        onClick={() => props.onRowClick?.(row, index)}
      >
        {visibleColumns.map((col) => {
          const value = row[col.accessor];

          return (
            <div
              key={col.accessor}
              onClick={() =>
                col.onClick ? col.onClick(row, index) : undefined
              }
              className={`min-w-0 px-3 py-3 sm:px-6 sm:py-4 ${col.classes} text-gray-700`}
            >
              {col.render ? col.render(row, index) : value}
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
