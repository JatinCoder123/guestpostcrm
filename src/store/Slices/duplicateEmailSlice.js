import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


const duplicateEmailSlice = createSlice({
    name: "duplicateEmails",
    initialState: {
        loading: false,
        duplicateEmails: [],
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
            state.duplicateEmails = action.payload.emails;
            
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
        
        resetDuplicateCount(state) {
            state.count = 0;
            state.shouldIgnoreUpdates = true;
            state.lastResetTime = Date.now();
        },

        enableDuplicateUpdates(state) {
            state.shouldIgnoreUpdates = false;
            
        },
        setDuplicateCount(state, action) {
            state.count = action.payload;
            
        },
    },
});



// ✅ GET: Fetch duplicate emails (full data) - DON'T UPDATE COUNT AFTER RESET
export const getDuplicateEmails = () => {
    return async (dispatch, getState) => {
        dispatch(duplicateEmailSlice.actions.getDuplicateEmailsRequest());

        try {
            const domain = getState().user.crmEndpoint.split("?")[0];
            const url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate&email=${getState().ladger.email}`;

            const { data } = await axios.get(url);

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


export const getDuplicateCount = () => {
    return async (dispatch, getState) => {
        try {
            const state = getState();
            
            if (state.duplicateEmails.shouldIgnoreUpdates) {
                
                return;
            }
            
            const domain = state.user.crmEndpoint.split("?")[0];
            let url;
            
            if (state.ladger.email) {
                url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate&email=${state.ladger.email}`;
            } else {
                url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate`;
            }

            const { data } = await axios.get(url);

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
            const state = getState();
            const domain = state.user.crmEndpoint.split("?")[0];
            
            let url;
            if (state.ladger.email) {
                url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate&email=${state.ladger.email}`;
            } else {
                url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate`;
            }

            const { data } = await axios.get(url);
            const newCount = data?.data_count ?? 0;
            
            
            
            if (!state.duplicateEmails.shouldIgnoreUpdates) {
                dispatch(duplicateEmailSlice.actions.updateDuplicateCount(newCount));
            }
        } catch (error) {
            console.error("❌ Error checking duplicates:", error);
        }
    };
};


export const resetDuplicateCount = () => {
    return (dispatch) => {
        dispatch(duplicateEmailSlice.actions.resetDuplicateCount());
    };
};


export const enableDuplicateUpdates = () => {
    return (dispatch) => {
        dispatch(duplicateEmailSlice.actions.enableDuplicateUpdates());
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
        
        const domain = state.user.crmEndpoint.split("?")[0];
        let url;
        
        if (state.ladger.email) {
            url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate&email=${state.ladger.email}`;
        } else {
            url = `${domain}?entryPoint=fetch_gpc&type=get_duplicate`;
        }
        
        const { data } = await axios.get(url);
        return data?.data_count ?? 0;
    }
);

// ✅ Export all actions
export const duplicateEmailActions = duplicateEmailSlice.actions;
export default duplicateEmailSlice.reducer;