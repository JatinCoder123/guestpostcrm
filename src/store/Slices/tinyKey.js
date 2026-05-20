import { createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

const tinyKey = createSlice({
    name: "tinyKey",
    initialState: {
        loading: false,
        tinyKey: '',
        error: null,
    },
    reducers: {
        getTinyKeyRequest(state) {
            state.loading = true;
            state.error = null;
            state.websites = [];
        },
        getTinyKeySuccess(state, action) {
            const { tinyKey } = action.payload;
            state.loading = false;
            state.tinyKey = tinyKey;
            state.error = null;
        },
        getTinyKeyFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.websites = websiteLists;
        },
        clearAllErrors(state) {
            state.error = null;
        },
    },
});

export const getTinyKey = () => {
    return async (dispatch) => {
        dispatch(tinyKey.actions.getTinyKeyRequest());
        try {
            const data = await apiRequest({ endpoint: 'https://crm.outrightsystems.org/index.php', method: "GET", params: { entryPoint: "get_tiny" }, headers: { 'X-Api-Key': import.meta.env.VITE_TINY_MCE_KEY_X_API_KEY } })
            dispatch(tinyKey.actions.getTinyKeySuccess({ tinyKey: data.token }));
            dispatch(tinyKey.actions.clearAllErrors());
        } catch (error) {
            dispatch(tinyKey.actions.getTinyKeyFailed("Fetching Tiny Key Failed"));
        }
    };
};


export const tinyAction = tinyKey.actions;
export default tinyKey.reducer;
