import { fetchGpc } from "../services/api";

export const getReports = ({
    filters = {},
    page = 1,
}) => {
    const body = {
        page,
        size: 50,

        category:
            filters.category || "",

        phase:
            filters.phase || "",

        stage:
            filters.stage || "",

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
    };

    if (filters.report_user_id) {
        body.report_user_id = filters.report_user_id;
    }

    return fetchGpc({
        method: "POST",
        params: {
            type: "newReport",
        },
        body,
    });
};
