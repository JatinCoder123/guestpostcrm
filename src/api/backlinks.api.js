import { http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";

export const getAllBacklinks = ({
    preferences,
    page = 1,
}) =>
    http({
        method: "POST",
        body: {
            action: "fetch",
            module: "outr_link_queue",

            page,

            ...buildTableRequestBody(
                preferences
            ),
        },
    });

export const getBacklinkStats = (filters = {}) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",

            ...buildTableRequestBody(filters),

            queries: [
                {
                    key: "dofollow",
                    module:
                        "outr_seo_backlinks",

                    filters: {
                        link_type:
                            "dofollow",
                    },
                },
                {
                    key: "nofollow",
                    module:
                        "outr_seo_backlinks",

                    filters: {
                        link_type:
                            "nofollow",
                    },
                },
                {
                    key: "authoritative",
                    module:
                        "outr_seo_backlinks",

                    filters: {
                        link_type:
                            "authoritative",
                    },
                },
                {
                    key: "all",
                    module:
                        "outr_seo_backlinks",

                },
            ],
        },
    });

export const updateBacklink =
    (backlink) =>
        http({
            method: "POST",
            body: {
                "action": "update",
                "module": "outr_link_queue",
                id: backlink.id,
                data: { status_c: backlink.status_c },
            },
        });

export const getBacklinkById =
    (id) =>
        http({
            method: "POST",
            body: {
                action: "fetch",
                module: "outr_link_queue",
                filter: { id }
            },
        });
