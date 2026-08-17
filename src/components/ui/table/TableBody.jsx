import { useTableContext } from "./Table";
import TableRow from "./TableRow";

export default function TableBody({
  rowVirtualizer,
}) {
  const {
    data,
    loading,
    isFetchingNextPage
  } = useTableContext();

  if (loading && data.length === 0) {
    return null;
  }

  const virtualRows =
    rowVirtualizer.getVirtualItems();

  return (
    <div
      style={{
        height:
          rowVirtualizer.getTotalSize(),

        position: "relative",
      }}
    >
      <div
        style={{
          transform: `translateY(${virtualRows[0]?.start ?? 0}px)`
        }}
      >
        {virtualRows.map(v => (
          <TableRow
            key={v.key}
            row={data[v.index]}
          />
        ))}
        {isFetchingNextPage && (
          <div className="p-4 text-center text-gray-500">
            Loading more...
          </div>
        )}
      </div>



    </div>
  );
}