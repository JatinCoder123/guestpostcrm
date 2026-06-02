// preferenceSlice.js

import { createSlice } from "@reduxjs/toolkit";
import { getStoredPreferences } from "../../utils/preferenceStorage";


export const getDefaultTablePreference = () => ({
    filters: {},
    search_filter: {
        search: "",
        search_fields: [],
    },

    sorting: {
        order_by: "",
        order_dir: "DESC",
    },
    hiddenColumns: [],
    per_page: 20,
    date_filter: {
        date_range: "",
        date_field: "",
        date_from: "",
        date_to: "",
    },
});



const storedPreferences = getStoredPreferences();

const initialState = {
    theme: "light",
    sidebarCollapsed: false,

    ...storedPreferences,

    tables: {
        ...(storedPreferences?.tables || {}),
    },
};

const preferenceSlice = createSlice({
    name: "preferences",

    initialState,

    reducers: {
        setTheme: (state, action) => {
            state.theme = action.payload;
        },
        ensureTableExists: (state, action) => {
            const table = action.payload;

            if (!state.tables[table]) {
                state.tables[table] = getDefaultTablePreference();
            }
        },
        setSidebarCollapsed: (state, action) => {
            state.sidebarCollapsed = action.payload;
        },

        updateTablePreference: (state, action) => {
            const { table, key, value } = action.payload;

            if (!state.tables[table]) {
                state.tables[table] = getDefaultTablePreference();
            }

            state.tables[table][key] = value;
        },

        updateMultipleTablePreferences: (state, action) => {
            const { table, data } = action.payload;

            if (!state.tables[table]) {
                state.tables[table] = getDefaultTablePreference();
            }

            Object.assign(state.tables[table], data);
        },

        resetTablePreferences: (state, action) => {
            const table = action.payload;

            state.tables[table] = getDefaultTablePreference();
        },

        hydratePreferences: (state, action) => {
            return {
                ...state,
                ...action.payload,
            };
        },

        resetAllPreferences: () => initialState,
    },
});

export const getPreference = (state, table) => {
    return (
        state.preferences.tables[table] ||
        getDefaultTablePreference()
    );
};
export const selectTablePreference =
    (table) => (state) =>
        state.preferences.tables[table] ||
        getDefaultTablePreference();
export const preferencesAction =
    preferenceSlice.actions;

export default preferenceSlice.reducer;