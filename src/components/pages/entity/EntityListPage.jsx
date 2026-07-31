import React from 'react'
import { viewRegistry } from '../../../views/viewRegistry';

const EntityListPage = ({ entity, view }) => {
    const ViewComponent = viewRegistry[view];

    if (!ViewComponent) return <div>Unknown view type: {view}</div>;
    // if (!config.views[view]) return <div>{config.label} has no "{view}" view configured</div>;

    return <ViewComponent />;
}

export default EntityListPage 