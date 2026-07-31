import { useRef, useCallback } from "react";

export default function useColumnResize({
    columnWidths,
    resizeColumn,
}) {
    const resizeState = useRef({
        accessor: null,
        startX: 0,
        startWidth: 0,
    });

    const onPointerMove = useCallback(
        (e) => {
            const {
                accessor,
                startX,
                startWidth,
            } = resizeState.current;

            if (!accessor) return;

            const delta = e.clientX - startX;

            resizeColumn(
                accessor,
                startWidth + delta
            );
        },
        [resizeColumn]
    );

    const stopResize = useCallback(() => {
        resizeState.current = {
            accessor: null,
            startX: 0,
            startWidth: 0,
        };

        window.removeEventListener(
            "pointermove",
            onPointerMove
        );

        window.removeEventListener(
            "pointerup",
            stopResize
        );

        document.body.style.cursor = "";
        document.body.style.userSelect = "";
    }, [onPointerMove]);

    const startResize = useCallback(
        (event, accessor) => {
            event.preventDefault();
            event.stopPropagation();

            resizeState.current = {
                accessor,
                startX: event.clientX,
                startWidth:
                    columnWidths[accessor]?.width || 200,
            };

            document.body.style.cursor =
                "col-resize";

            document.body.style.userSelect =
                "none";

            window.addEventListener(
                "pointermove",
                onPointerMove
            );

            window.addEventListener(
                "pointerup",
                stopResize
            );
        },
        [
            columnWidths,
            onPointerMove,
            stopResize,
        ]
    );

    return {
        startResize,
    };
}