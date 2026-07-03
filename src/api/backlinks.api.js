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
            module: "outr_seo_backlinks",

            fields: [
                "post_author_name_c",
                "post_author_email_c",
                "target_url_c",
                "anchor_text_c",
                "expiry_date_c",
                "link_type",
                "date_entered",
            ],

            page,

            ...buildTableRequestBody(
                preferences
            ),
        },
    });

export const getBacklinkStats = (
    filters = {}
) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",

            ...filters,

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
                "module": "outr_seo_backlinks",
                id: backlink.id,
                data: { ...backlink },
            },
        });

export const getBacklinkById =
    (id) =>
        http({
            method: "POST",
            body: {
                action: "fetch",
                module: "outr_seo_backlinks",
                filter: { id }
            },
        });