import { useLocation, useParams } from "react-router-dom";
import { ODO_ROUTES } from "./ODORoutes";
import NotFoundPage from "../pages/NotFoundPage";
import useIdle from "../../hooks/useIdle";

export default function DynamicRouteHandler({ mode }) {
    const { type, } = useParams();
    const { state } = useLocation()
    useIdle({ idle: false })

    const config = ODO_ROUTES[type];

    if (!config) return <NotFoundPage />;
    let Component = null;
    if (mode === "list" && !state?.threadId) Component = config.list;
    if (mode === "list" && state?.threadId) Component = config.threadList;
    if (mode === "create") Component = config.create;
    if (mode === "edit") Component = config.edit;

    if (!Component) return <NotFoundPage />;

    return <Component threadId={state?.threadId} id={state?.id} email={state?.email} />;
}