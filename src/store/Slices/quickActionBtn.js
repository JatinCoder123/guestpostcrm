import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const quickActionBtnSlice = createSlice({
    name: "quickActionBtn",
    initialState: {
        loading: false,
        buttons: [],
        error: null,
    },
    reducers: {
        getQuickActionBtnRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getQuickActionBtnSuccess(state, action) {
            const { buttons } = action.payload;
            state.loading = false;
            state.buttons = buttons;
            state.error = null;
        },
        getQuickActionBtnFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        clearErrors(state) {
            state.error = null;
        },
    },
});

// Named export: thunk
export const getQuickActionBtn = () => {
    return async (dispatch, getState) => {
        dispatch(quickActionBtnSlice.actions.getQuickActionBtnRequest());

        try {
            const response = await axios.get(
                `${getState().user.crmEndpoint}&type=quick_actions`
            );

            const data = response.data;
            showConsole && console.log("QUICK ACTION:", data);

            dispatch(
                quickActionBtnSlice.actions.getQuickActionBtnSuccess({
                    buttons: data.data ?? [],
                })
            );

            dispatch(quickActionBtnSlice.actions.clearErrors());
        } catch (error) {
            dispatch(
                quickActionBtnSlice.actions.getQuickActionBtnFailed(
                    "Fetching Quick Action Failed"
                )
            );
        }
    };
};

// Named export: slice actions
export const quickActionBtnActions = quickActionBtnSlice.actions;

// Default export: reducer
export default quickActionBtnSlice.reducer;
