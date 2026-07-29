// src/routes/DynamicResourceHandler.jsx

import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

// Pages
import EntityListPage from "../pages/entity/EntityListPage";
import EntityCreatePage from "../pages/entity/EntityCreatePage";
import EntityViewPage from "../pages/entity/EntityViewPage";
import EntityEditPage from "../pages/entity/EntityEditPage";
import EntityNotFoundPage from "../pages/entity/EntityNotFoundPage";

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
    const { data, isLoading } = useEntityDefinition(resource);

    if (isLoading) {
        return <PageLoader />;
    }

    if (!data) {
        return <EntityNotFoundPage />;
    }

    switch (route.mode) {
        case "list":
            return (
                <EntityListPage resource={resource} />
            );

        case "create":
            return (
                <EntityCreatePage resource={resource} />
            );

        case "view":
            return (
                <EntityViewPage
                    resource={resource}
                    id={route.id} />
            );

        case "edit":
            return (
                <EntityEditPage
                    resource={resource}
                    id={route.id}
                />
            );

        case "custom":
            return (
                <EntityViewPage
                    resource={resource}
                    id={route.id}
                    section={route.section}
                />
            );

        default:
            return <EntityNotFoundPage />;
    }
}