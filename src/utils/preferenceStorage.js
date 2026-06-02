// preferenceStorage.js

export const getStoredPreferences = () => {
    try {
        return JSON.parse(
            localStorage.getItem("preferences") || "{}"
        );
    } catch {
        return {};
    }
};
// utils/buildTableRequestBody.js

export const buildTableRequestBody = (
    preferences,
    defaults
) => {
    const body = {};

    // Date Filters
    if (preferences?.date_filter) {
        body.date_range =
            preferences.date_filter.date_range;

        body.date_field =
            preferences.date_filter.date_field;

        if (
            preferences.date_filter.date_range ===
            "custom"
        ) {
            body.date_from =
                preferences.date_filter.date_from;

            body.date_to =
                preferences.date_filter.date_to;
        }
    }

    // Merge Default Filters + User Filters
    const mergedFilters = {
        ...(defaults?.filters || {}),
        ...(preferences?.filters || {}),
    };

    if (Object.keys(mergedFilters).length) {
        body.filters = mergedFilters;
    }

    // Search
    if (
        preferences?.search_filter?.search?.trim()
    ) {
        body.search =
            preferences.search_filter.search.trim();
    }

    // Search Fields
    if (
        preferences?.search_filter?.search_fields
            ?.length
    ) {
        body.search_fields =
            preferences.search_filter.search_fields;
    }

    // Sorting
    if (
        preferences?.sorting?.order_by
    ) {
        body.order_by =
            preferences.sorting.order_by;

        body.order_dir =
            preferences.sorting.order_dir ||
            "DESC";
    }

    return body;
};