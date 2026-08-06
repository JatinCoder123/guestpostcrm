import FieldRenderer from "../../../components/ui/fields/FieldRenderer";
import { useState } from "react";
import blockRegistry from "./blockRegistry";
import DynamicField from "../../ui/fields/DynamicField";

const Tabs = ({ config, record, entity }) => {
    const [activeTab, setActiveTab] = useState(config.defaultTab);

    const currentTab =
        config.tabs.find(tab => tab.id === activeTab) ||
        config.tabs[0];

    return (
        <div className="space-y-4">
            {/* Tab Buttons */}
            <div className="flex border-b">
                {config.tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2 ${activeTab === tab.id
                            ? "border-b-2 border-blue-500 font-medium"
                            : "text-gray-500"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Render Blocks of Active Tab */}
            <div className="space-y-4">
                {currentTab?.blocks?.map(block => {
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
        </div>
    );
};

const Header = ({ config, record }) => {
    return (
        <div className="rounded-xl border bg-white p-6">

            <div className="flex justify-between">

                <div>

                    <h1 className="text-2xl font-semibold">
                        {record[config.titleField]}
                    </h1>

                    <p>
                        {record?.[config.subtitleField]?.name ??
                            record?.[config.subtitleField]}
                    </p>

                </div>

                <div className="flex gap-2">
                    {/* 
                    {config.actions.map(action => (
                        <button key={action}>
                            {action}
                        </button>
                    ))} */}

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

const Section = ({ config, record }) => {
    console.log("RECORD", record)
    return (

        <div className="bg-white rounded-xl border p-6 mt-6">

            <h2 className="text-2xl font-semibold">{config.title}</h2>

            <div
                className={`grid grid-cols-${config.columns} gap-4 mt-4`}
            >

                {config.fields.map(field => (

                    <DynamicField
                        row={field.field}
                        field={field}
                        value={record[field.accessor]}
                    />

                ))}

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