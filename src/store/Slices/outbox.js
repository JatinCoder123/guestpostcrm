import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { apiRequest, fetchGpc } from "../../services/api";
import { CREATE_DEAL_API_KEY } from "../constants";
const outboxSlice = createSlice({
    name: "outbox",
    initialState: {
        loading: false,
        count: 0,
        emails: [],
        pageCount: 1,
        pageIndex: 1,
        error: null,
        message: null,
        deleting: false
    },
    reducers: {
        getOutboxRequest(state, action) {
            state.loading = action.payload.loading;
            state.error = null;
            state.emails = [];
        },
        getOutboxSuccess(state, action) {
            const { emails, pageCount, pageIndex } = action.payload;
            state.loading = false;
            state.emails = emails;
            state.pageCount = pageCount || 1;
            state.pageIndex = pageIndex || 1;
            state.error = null;
        },
        getOutboxFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        deleteRequest(state, action) {
            state.deleting = true;
            state.error = null;
        },
        deleteSuccess(state, action) {
            state.deleting = false;
            state.error = null;
            state.message = action.payload;
        },
        deleteFailed(state, action) {
            state.deleting = false;
            state.error = action.payload;
        },
        clearAllErrors(state) {
            state.error = null;
        },
        clearAllMessage(state) {
            state.message = null;
        },
    },
});

export const getOutboxEmails = ({ loading = true }) => {
    return async (dispatch, getState) => {
        loading && dispatch(outboxSlice.actions.getOutboxRequest({ loading }));
        try {
            const data = await apiRequest({
                endpoint: `${getState().user.crmEndpoint.split('?')[0]}?entryPoint=get_post_all`, method: "POST", params: { action_type: 'get_data', }, headers: {
                    "x-api-key": CREATE_DEAL_API_KEY,
                    "Content-Type": "application/json",
                },
                body: {
                    "module": "outr_outbox"
                },
            })
            showConsole && console.log(`OutBox `, data);
            dispatch(outboxSlice.actions.getOutboxSuccess({ emails: data }));
            dispatch(outboxSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(outboxSlice.actions.getOutboxFailed("Fetching OutBox Record Failed"));
        }
    };
};
export const deleteOutBoxEmail = (id) => {
    return async (dispatch, getState) => {
        dispatch(outboxSlice.actions.deleteRequest());

        try {
            const data = await fetchGpc({
                params: { type: 'delete_record', module_name: "outr_outbox", record_id: id },

            })
            console.log("DELTE ", data)
            dispatch(getOutboxEmails({ loading: false }))
            dispatch(outboxSlice.actions.deleteSuccess('Outbox Email Deleted Successfully'));

        } catch (error) {
            dispatch(outboxSlice.actions.getOutboxFailed("Deleting OutBox Record Failed"));
        }
    };
};


export const outboxAction = outboxSlice.actions;
export default outboxSlice.reducer;
