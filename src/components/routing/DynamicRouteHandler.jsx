import { useLocation, useParams } from "react-router-dom";
import { ODO_ROUTES } from "./ODORoutes";
import NotFoundPage from "../pages/NotFoundPage";
import useIdle from "../../hooks/useIdle";

export default function DynamicRouteHandler({ mode }) {
    const { type, threadId, id } = useParams();
    const { state } = useLocation()
    useIdle({ idle: false })

    const config = ODO_ROUTES[type];

    if (!config) return <NotFoundPage />;
    let Component = null;
    if (mode === "list" && !threadId) Component = config.list;
    if (mode === "list" && threadId) Component = config.threadList;
    if (mode === "create") Component = config.create;
    if (mode === "edit") Component = config.edit;
    if (mode === "view") Component = config.view;

    if (!Component) return <NotFoundPage />;

    return <Component threadId={threadId} id={id} email={state?.email} />;
}