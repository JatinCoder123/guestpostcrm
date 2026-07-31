export default function TableCell({
    row,
    column,
}) {
    const value =
        row[column.accessor];

    return (
        <div
            onClick={() =>
                column.onClick?.(row)
            }
            className={`
        relative
        flex
        items-center
        px-4
        py-3
        overflow-hidden
        whitespace-nowrap
        ${column.classes || ""}
      `}
            style={{
                position: column.sticky
                    ? "sticky"
                    : "relative",

                left: column.sticky
                    ? column.left
                    : undefined,

                width: column.width,

                background: column.sticky
                    ? "white"
                    : undefined,

                zIndex: column.sticky
                    ? 5
                    : 1,
            }}
        >
            {column.render
                ? column.render(row)
                : value}
        </div>
    );
}