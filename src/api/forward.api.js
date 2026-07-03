import { http } from "../services/api";


export const getForwardStats = async (
    filters = {}, userId
) => {
    return http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,
            queries: [
                {
                    "key": "forwarded",
                    "module": "Contacts",
                    "filters": {
                        "gpc_assigned_to": userId
                    }
                },

            ]
        },
    });
}