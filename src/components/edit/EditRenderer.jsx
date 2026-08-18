import React from "react";

import blockRegistry from "./blocks/blockRegistry";

const EditRenderer = ({
    layout,
    record,
    entity,
}) => {
    const blocks = [
        ...(layout?.blocks ?? []),
    ]
        .filter(
            (block) =>
                block.visible !== false
        )
        .sort(
            (a, b) =>
                (a.weight ?? 0) -
                (b.weight ?? 0)
        );

    const Header =
        blockRegistry.header;

    return (
        <div className="space-y-4">
            {/* =====================================================
                HEADER
            ===================================================== */}

            {layout?.header && Header && (
                <Header
                    config={layout.header}
                    record={record}
                    entity={entity}
                />
            )}

            {/* =====================================================
                BLOCKS
            ===================================================== */}

            {blocks.map((block) => {
                const Component =
                    blockRegistry[
                    block.type
                    ];

                if (!Component) {
                    console.warn(
                        `Unknown block type: ${block.type}`
                    );

                    return null;
                }

                return (
                    <Component
                        key={block.id}
                        config={block}
                        record={record}
                        entity={entity}
                        mode="edit"
                    />
                );
            })}
        </div>
    );
};

export default EditRenderer;