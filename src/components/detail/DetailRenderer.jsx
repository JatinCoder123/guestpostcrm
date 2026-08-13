import { useNavigate } from "react-router-dom";
import blockRegistry from "./blocks/blockRegistry";

const DetailRenderer = ({ layout, record, entity }) => {
    const blocks = [...(layout?.blocks ?? [])]
        .filter((block) => block.visible !== false)
        .sort(
            (a, b) =>
                (a.weight ?? 0) - (b.weight ?? 0)
        );
    const Header = blockRegistry['header']
    const navigate = useNavigate();

    return (
        <div className="space-y-4">
            {/* =====================================================
                HEADER
            ===================================================== */}

            {layout?.header && (
                <Header
                    config={layout.header}
                    record={record}
                    entity={entity}
                    actionContext={{ navigate }}
                />
            )}

            {/* =====================================================
                BLOCKS
            ===================================================== */}

            {blocks.map((block) => {
                const Component =
                    blockRegistry[block.type];

                if (!Component) {
                    console.warn(
                        `Unknown detail block type: ${block.type}`
                    );

                    return null;
                }

                return (
                    <Component
                        key={block.id}
                        config={block}
                        record={record}
                        entity={entity}
                        mode="view"
                    />
                );
            })}
        </div>
    );
};

export default DetailRenderer;