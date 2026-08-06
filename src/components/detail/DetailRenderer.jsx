import blockRegistry from "./blocks/blockRegistry";

const DetailRenderer = ({ layout, record, entity }) => {
    return (
        <div className="space-y-4">
            {layout?.blocks?.map((block) => {
                const Component = blockRegistry[block.type];

                if (!Component) return null;

                return (
                    <Component
                        key={block.id}
                        config={block}
                        record={record}
                        entity={entity}
                    />
                );
            })}
        </div>
    );
};

export default DetailRenderer;