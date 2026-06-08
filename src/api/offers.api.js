import { http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";

export const getAllOffers = ({
    preferences,
    page = 1,
    email
}) =>
    http({
        method: "POST",
        body: {
            action: "fetch",
            module: "outr_offer",
            fields: [
                "name",
                "email_c",
                "offer_status",
                "date_entered",
                "website",
                "thread_id",
                "message_id",
                "note",
                "date_modified",
                "our_offer_c",
                "client_offer_c",
                "expiry_date",
            ],
            page,
            ...buildTableRequestBody(
                preferences
            ),
        },
        params: { email }
    });

export const getOfferStats = (
    filters = {}
) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,

            queries: [
                {
                    key: "active",
                    module:
                        "outr_offer",

                    filters: {
                        offer_status:
                            "active",
                    },
                },
                {
                    key: "expired",
                    module:
                        "outr_offer",

                    filters: {
                        offer_status:
                            "expired",
                    },
                },
                {
                    key: "accepted",
                    module:
                        "outr_offer",

                    filters: {
                        offer_status:
                            "accepted",
                    },
                },
            ],
        },
    });

export const deleteOffer = (
    id
) =>
    http({
        method: "POST",
        body: {
            action:
                "delete_offer",
            id,
        },
    });

export const getOfferById = (
    id
) =>
    http({
        method: "POST",
        body: {
            action:
                "get_offer",
            id,
        },
    });