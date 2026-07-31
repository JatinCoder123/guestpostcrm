import { useVirtualizer } from "@tanstack/react-virtual";

export default function useVirtualRows({
    parentRef,
    count,
    estimateSize = 48,
    overscan = 10,
}) {
    return useVirtualizer({
        count,

        getScrollElement: () => parentRef.current,

        estimateSize: () => estimateSize,

        overscan,
    });
}