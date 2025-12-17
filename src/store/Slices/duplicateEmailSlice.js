import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

/* =========================
   SLICE
========================= */
const duplicateEmailSlice = createSlice({
    name: "duplicateEmails",
    initialState: {
        loading: false,
        duplicateEmails: [],
        count: 0,
        error: null,
    },
    reducers: {
        getDuplicateEmailsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getDuplicateEmailsSuccess(state, action) {
            state.loading = false;
            state.duplicateEmails = action.payload.emails;
            state.count = action.payload.count;
        },
        getDuplicateEmailsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        clearDuplicateEmailErrors(state) {
            state.error = null;
        },
    },
});

/* =========================
   THUNK
========================= */
export const getDuplicateEmails = () => {
    return async (dispatch, getState) => {
        dispatch(duplicateEmailSlice.actions.getDuplicateEmailsRequest());

        try {
            const domain = getState().user.crmEndpoint.split("?")[0];

            const url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate&email=${getState().ladger.email}`;

            const { data } = await axios.get(url);

            console.log("🟢 Duplicate Email Response:", data);

            dispatch(
                duplicateEmailSlice.actions.getDuplicateEmailsSuccess({
                    emails: data?.data ?? [],
                    count: data?.data_count ?? 0,
                })
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

export const duplicateEmailActions = duplicateEmailSlice.actions;
export default duplicateEmailSlice.reducer;
