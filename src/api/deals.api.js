import { http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";


export const getAllDeals = ({
    preferences,
    page = 1,
}) =>
    http({
        method: "POST",
        body: {
            "action": "fetch",
            "module": "outr_deal_fetch",
            "fields": ["first_name", "last_name", "email", "status", "date_entered", "website_c", "thread_id", "message_id", "dealamount", "note", "date_modified"],
            "page": page,
            "per_page": 20,
            ...buildTableRequestBody(preferences)
        }
    });

export const getDealStats = ({ filters }) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,
            queries: [
                {
                    "key": "active",
                    "module": "outr_deal_fetch",
                    "filters": {
                        "status": "active"
                    }
                },
                {
                    "key": "expiry",
                    "module": "outr_deal_fetch",
                    "filters": {
                        "status": "expiry"
                    }
                },
            ]
        },
    });

export const deleteDeal = (
    id
) =>
    http({
        method: "POST",
        params: {
            action: "deleteDeal",
        },
        body: { id },
    });

export const getDealById = (
    id
) =>
    http({
        method: "POST",
        params: {
            action: "getDeal",
        },
        body: { id },
    });