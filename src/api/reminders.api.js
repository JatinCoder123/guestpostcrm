import { fetchGpc, http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";

export const getAllReminders = ({
    preferences,
    page = 1,
    email
}) => {
    const params = email ? { email } : {}
    return http({
        method: "POST",
        body: {
            action: "fetch",
            module: "outr_snts",
            page,
            ...buildTableRequestBody(
                preferences
            ),
        },
        params: { ...params }
    });
}


export const getReminderStats = (
    filters = {}
) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,

            queries: [
                {
                    key: "Sent",
                    module:
                        "outr_snts",

                    filters: {
                        status:
                            "Sent",
                    },
                },
                {
                    key: "Pending",
                    module:
                        "outr_snts",

                    filters: {
                        status:
                            "Pending",
                    },
                },
                {
                    key: "cancel",
                    module:
                        "outr_snts",

                    filters: {
                        status:
                            "cancel",
                    },
                },
                {
                    key: "all",
                    module:
                        "outr_snts",
                },

            ],
        },
    });

