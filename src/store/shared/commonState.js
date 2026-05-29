// commonState.js
export const commonState = {
    loading: false,
    error: null,
    message: null,
    pageIndex: 0,
    pageCount: 0,
    count: 0,
    date_filter: {
        date_range: "today",
        date_field: "date_entered",
        date_from: "",
        date_to: "",
    },
    filters: {},
    search: "",
    search_fields: [],
    order_by: "",
    order_dir: "DESC",
    per_page: 20,
    summary: {},
};