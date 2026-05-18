import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";
import { getCache, setCache } from "../../services/cache";


const duplicateEmailSlice = createSlice({
    name: "duplicateEmails",
    initialState: {
        loading: false,
        duplicateEmail: [],
        count: 0,
        error: null,
        lastResetTime: null,
        shouldIgnoreUpdates: false,
    },
    reducers: {
        getDuplicateEmailsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getDuplicateEmailsSuccess(state, action) {
            state.loading = false;
            state.duplicateEmail = action.payload.emails;

            if (!state.shouldIgnoreUpdates) {
                state.count = action.payload.count;
            }
        },
        getDuplicateEmailsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        clearDuplicateEmailErrors(state) {
            state.error = null;
        },

        updateDuplicateCount(state, action) {

            if (!state.shouldIgnoreUpdates) {
                state.count = action.payload;
            }
        },

        setDuplicateCount(state, action) {
            state.count = action.payload;

        },
    },
});

export const getDuplicateEmails = (
    email = null,
    force = false,
    loading = true
) => {
    return async (dispatch, getState) => {
        loading &&
            dispatch(
                duplicateEmailSlice.actions.getDuplicateEmailsRequest()
            );

        try {
            const targetEmail =
                email ??
                getState().viewEmail.contactInfo?.email1;

            const trimmedEmail = targetEmail?.trim();

            // =========================
            // CACHE CHECK
            // =========================
            if (!force) {
                const cachedData = getCache(
                    "duplicateEmails",
                    trimmedEmail
                );

                if (cachedData) {
                    dispatch(
                        duplicateEmailSlice.actions.getDuplicateEmailsSuccess(
                            cachedData
                        )
                    );

                    return;
                }
            }

            // =========================
            // API CALL
            // =========================
            const data = await fetchGpc({
                params: {
                    type: "get_dupliacte_threads",
                    email: trimmedEmail,
                },
            });

            showConsole && console.log("DUPLICATE", data);

            const freshData = {
                emails: data?.data ?? [],
                count: data?.data_count ?? 0,
            };

            // =========================
            // SAVE CACHE
            // =========================
            setCache(
                "duplicateEmails",
                trimmedEmail,
                freshData
            );

            // =========================
            // SAVE REDUX
            // =========================
            dispatch(
                duplicateEmailSlice.actions.getDuplicateEmailsSuccess(
                    freshData
                )
            );

            dispatch(
                duplicateEmailSlice.actions.clearDuplicateEmailErrors()
            );
        } catch (error) {
            console.error(error);

            dispatch(
                duplicateEmailSlice.actions.getDuplicateEmailsFailed(
                    "Fetching Duplicate Emails Failed"
                )
            );
        }
    };
};

export const getDuplicateCount = () => {
    return async (dispatch, getState) => {
        try {
            const state = getState();

            if (state.duplicateEmails.shouldIgnoreUpdates) {

                return;
            }
            const email = state.viewEmail.contactInfo?.email1

            const { data } = await fetchGpc({ params: { type: 'get_duplicate', ...(email ? { email } : {}) } });

            dispatch(
                duplicateEmailSlice.actions.updateDuplicateCount(data?.data_count ?? 0)
            );
        } catch (error) {
            console.error("❌ Error fetching duplicate count:", error);
        }
    };
};


export const checkForDuplicates = () => {
    return async (dispatch, getState) => {
        try {

            const timeline = getState().ladger.timeline
            const email = getState().ladger.email

            const data = await fetchGpc({ params: { type: "get_duplicate", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), ...(email ? { email } : {}), page: 1, page_size: 50 } });
            const newCount = data?.data_count ?? 0;
            if (!getState().duplicateEmails.shouldIgnoreUpdates) {
                dispatch(duplicateEmailSlice.actions.updateDuplicateCount(newCount));
            }
        } catch (error) {
            console.error("❌ Error checking duplicates:", error);
        }
    };
};





// ✅ Async Thunk for count
export const fetchDuplicateCount = createAsyncThunk(
    'duplicateEmails/fetchCount',
    async (_, { getState }) => {
        const state = getState();

        if (state.duplicateEmails.shouldIgnoreUpdates) {
            return state.duplicateEmails.count;
        }

        const timeline = getState().ladger.timeline
        const email = getState().ladger.email

        const data = await fetchGpc({ params: { type: "get_duplicate", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), ...(email ? { email } : {}), page: 1, page_size: 50 } });
        return data?.data_count ?? 0;
    }
);

// ✅ Export all actions
export const duplicateEmailActions = duplicateEmailSlice.actions;
export default duplicateEmailSlice.reducer;