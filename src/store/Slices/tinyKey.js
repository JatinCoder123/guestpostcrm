import { createSlice } from "@reduxjs/toolkit";
import { apiRequest } from "../../services/api";

const tinyKey = createSlice({
    name: "tinyKey",
    initialState: {
        loading: false,
        tinyKey: localStorage.getItem("tinyKey") || "",
        error: null,
    },
    reducers: {
        getTinyKeyRequest(state) {
            state.loading = true;
            state.error = null;
        },

        getTinyKeySuccess(state, action) {
            const { tinyKey } = action.payload;

            state.loading = false;
            state.tinyKey = tinyKey;
            state.error = null;

            // Store in localStorage
            localStorage.setItem("tinyKey", tinyKey);
        },

        getTinyKeyFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },

        clearAllErrors(state) {
            state.error = null;
        },
    },
});

export const getTinyKey = () => {
    return async (dispatch, getState) => {
        // Prevent API call if key already exists
        const existingKey =
            getState().tinyKey.tinyKey || localStorage.getItem("tinyKey");

        if (existingKey) {
            return;
        }

        dispatch(tinyKey.actions.getTinyKeyRequest());

        try {
            const data = await apiRequest({
                endpoint: "https://crm.outrightsystems.org/index.php",
                method: "GET",
                params: {
                    entryPoint: "get_tiny",
                },
                headers: {
                    "X-Api-Key":
                        import.meta.env.VITE_TINY_MCE_KEY_X_API_KEY,
                },
            });

            dispatch(
                tinyKey.actions.getTinyKeySuccess({
                    tinyKey: data.token,
                })
            );

            dispatch(tinyKey.actions.clearAllErrors());
        } catch (error) {
            dispatch(
                tinyKey.actions.getTinyKeyFailed(
                    "Fetching Tiny Key Failed"
                )
            );
        }
    };
};

export const tinyAction = tinyKey.actions;
export default tinyKey.reducer;