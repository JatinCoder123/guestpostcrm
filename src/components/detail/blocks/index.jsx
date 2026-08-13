import { useState } from "react";
import blockRegistry from "./blockRegistry";
import DynamicField from "../../ui/fields/DynamicField";
import FieldRenderer from "../../fields/FieldRenderer";
import { resolveFieldValue } from "../../fields/resolveFieldContext ";
import ActionField from "../../fields/actions/ActionField";
import EditSection from "../../edit/components/EditSection";

import {
    Tabs as ShadcnTabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";

const Tabs = ({ config, record, entity, mode }) => {
    const defaultTab =
        config.defaultTab || config.tabs?.[0]?.id;

    return (
        <ShadcnTabs
            defaultValue={defaultTab}
            className="w-full"
        >
            {/* Tab Buttons */}
            <TabsList className="h-auto rounded-full border bg-white p-1 ">
                {config.tabs.map((tab) => (
                    <TabsTrigger
                        key={tab.id}
                        value={tab.id}
                        className="
                rounded-full
                px-5
                py-2
                text-sm
                font-medium
                text-gray-700
                transition-all

                data-[state=active]:bg-blue-50
                data-[state=active]:text-gray-900
                data-[state=active]:ring-1
                data-[state=active]:ring-blue-400
                data-[state=active]:shadow-none
            "
                    >
                        {tab.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            {/* Tab Content */}
            {config.tabs.map((tab) => (
                <TabsContent
                    key={tab.id}
                    value={tab.id}
                    className="space-y-4"
                >
                    {tab.sections?.map((section) => {
                        const Component =
                            blockRegistry[section.type];

                        if (!Component) {
                            return null;
                        }

                        return (
                            <Component
                                key={section.id}
                                config={section}
                                record={record}
                                entity={entity}
                                mode={mode}
                            />
                        );
                    })}
                </TabsContent>
            ))}
        </ShadcnTabs>
    );
};



const Header = ({
    config,
    record,
    entity,
    actionContext = {},
}) => {
    const title =
        resolveFieldValue({
            record,
            field: config?.titleField,
        });

    const subtitle =
        resolveFieldValue({
            record,
            field: config?.subtitleField,
        });

    const description =
        resolveFieldValue({
            record,
            field: config?.descriptionField,
        });

    return (
        <div className="rounded-xl border bg-white p-6">
            <div className="flex items-start justify-between gap-6">

                {/* =====================================================
                    LEFT
                ===================================================== */}

                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-semibold">
                        {title ?? "-"}
                    </h1>

                    {subtitle != null && (
                        <p className="mt-1 text-sm text-gray-500">
                            {subtitle}
                        </p>
                    )}

                    {description != null && (
                        <p className="mt-1 text-sm text-gray-400">
                            {description}
                        </p>
                    )}
                </div>


                {/* =====================================================
                    RIGHT - ACTIONS
                ===================================================== */}

                <div className="flex shrink-0 items-center gap-2">
                    {config?.actions?.length > 0 && (
                        <ActionField
                            field={{
                                actions:
                                    config.actions,
                            }}
                            record={record}
                            actionContext={{
                                entity,
                                ...actionContext,
                            }}
                        />
                    )}
                </div>

            </div>
        </div>
    );
};


const Summary = ({ config, record }) => {

    return (

        <div className="grid grid-cols-2 gap-5">

            {config.fields.map(field => (

                <div key={field}>

                    <label>{field}</label>

                    <div>{record[field]}</div>

                </div>

            ))}

        </div>

    );

};

const Section = ({ config, record, mode }) => {
    console.log("CONFIG", config)
    console.log("RECORD", record);
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-2",
        3: "grid-cols-3",
        4: "grid-cols-4",
        5: "grid-cols-5",
        6: "grid-cols-6",
    };
    if (mode == "edit") {
        return <EditSection config={config} record={record} />
    }

    return (
        <div className="mt-6 rounded-xl border bg-white p-6">

            <h2 className="text-2xl font-semibold">
                {config.title}
            </h2>

            <div
                className={`
                    mt-4
                    grid
                    ${gridCols[config.columns] || "grid-cols-3"}
                    gap-4
                `}
            >

                {config.fields?.map((field) => {
                    const value = resolveFieldValue({
                        record,
                        section: config,
                        field,
                    });
                    return (
                        <FieldRenderer
                            value={value}
                            key={field.accessor}
                            field={field}
                            mode="view"
                            record={record}
                        />
                    )
                })}

            </div>

        </div>
    );
};


const Timeline = () => {

    return <div>Timeline</div>;

};

const RelatedRecord = ({ config, record }) => {

    return (

        <div>

            Related Record

            {record?.[config.relationshipField]?.name}

        </div>

    );

};

const RelatedList = ({ config }) => {

    return (

        <div>

            Related List

            {config.module}

        </div>

    );

};

const Widget = ({ config }) => {

    return <div>{config.widget}</div>;

};

export default {
    Header,
    Summary,
    Section,
    Timeline,
    RelatedRecord,
    RelatedList,
    Widget,
    Tabs
};