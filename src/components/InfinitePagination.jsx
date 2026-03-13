import { memo, useRef, useEffect } from "react";
import { List } from "react-window";

function InfinitePagination({ fn, pageCount, pageIndex, data, Row, loading }) {

    const loadingRef = useRef(false);

    useEffect(() => {
        // unlock when new data arrives
        loadingRef.current = false;
    }, [data.length]);

    return (
        <List
            style={{ height: "100vh", width: "100%" }}
            rowComponent={Row}
            rowCount={pageIndex < pageCount ? data.length + 1 : data.length}
            rowHeight={70}
            rowProps={{ data }}
            overscanCount={5}
            onRowsRendered={({ stopIndex }) => {

                if (
                    stopIndex >= data.length - 1 &&
                    !loading &&
                    pageIndex < pageCount &&
                    !loadingRef.current
                ) {
                    loadingRef.current = true;
                    fn();
                }

            }}
        />
    );
}

export default memo(InfinitePagination);