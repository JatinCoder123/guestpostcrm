// src/routes/DynamicResourceHandler.jsx

import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Pages
import ResourceListPage from "../pages/resource/ResourceListPage";
import ResourceCreatePage from "../pages/resource/ResourceCreatePage";
import ResourceViewPage from "../pages/resource/ResourceViewPage";
import ResourceEditPage from "../pages/resource/ResourceEditPage";
import ResourceNotFoundPage from "../pages/resource/ResourceNotFoundPage";

// Queries
// import { useResourceDefinition } from "@/queries/resource.query";

export default function DynamicResourceHandler() {
    const { resource } = useParams();

    const location = useLocation();
    const navigate = useNavigate();
    const segments = useMemo(() => {
        return location.pathname
            .replace(`/${resource}`, "")
            .split("/")
            .filter(Boolean);
    }, [location.pathname, resource]);

    /**
     * Route resolver
     */
    const route = useMemo(() => {
        if (segments.length === 0) {
            return {
                mode: "list",
            };
        }

        if (segments[0] === "create") {
            return {
                mode: "create",
            };
        }

        if (segments.length === 1) {
            return {
                mode: "view",
                id: segments[0],
            };
        }

        if (segments[1] === "edit") {
            return {
                mode: "edit",
                id: segments[0],
            };
        }

        return {
            mode: "custom",
            id: segments[0],
            section: segments[1],
        };
    }, [segments]);

    /**
     * Load resource metadata
     */
    // const { data, isLoading } = useResourceDefinition(resource);

    // if (isLoading) {
    //     return <PageLoader />;
    // }

    // if (!data) {
    //     return <ResourceNotFoundPage />;
    // }

    switch (route.mode) {
        case "list":
            return (
                <ResourceListPage resource={resource} />
            );

        case "create":
            return (
                <ResourceCreatePage resource={resource} />
            );

        case "view":
            return (
                <ResourceViewPage
                    resource={resource}
                    id={route.id} />
            );

        case "edit":
            return (
                <ResourceEditPage
                    resource={resource}
                    id={route.id}
                />
            );

        case "custom":
            return (
                <ResourceViewPage
                    resource={resource}
                    id={route.id}
                    section={route.section}
                />
            );

        default:
            return <ResourceNotFoundPage />;
    }
}