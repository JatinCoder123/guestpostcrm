import FieldRenderer from "../../../components/ui/fields/FieldRenderer";

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

                    {config.actions.map(action => (
                        <button key={action}>
                            {action}
                        </button>
                    ))}

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

    return (

        <div>

            <h2>{config.title}</h2>

            <div
                className={`grid grid-cols-${config.columns} gap-4`}
            >

                {config.fields.map(field => (

                    <FieldRenderer
                        key={field.field}
                        config={field}
                        value={record[field.field]}
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
    Widget
};