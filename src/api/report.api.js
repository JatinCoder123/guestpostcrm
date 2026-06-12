import { fetchGpc, http } from "../services/api";

export const getReports = ({
    filters = {},
    page = 1,
}) =>
    fetchGpc({
        method: "POST",
        params: {
            type: "newReport",
        },
        body: {
            page,
            size: 50,

            category:
                filters.category || "",

            phase:
                filters.phase || "",

            stage:
                filters.stage || "",

            report_user_id:
                filters.report_user_id ||
                "",

            from:
                filters.from || "",

            from_time:
                filters.from_time ||
                "00:00:00",

            to:
                filters.to || "",

            to_time:
                filters.to_time ||
                "23:59:59",
        },
    });