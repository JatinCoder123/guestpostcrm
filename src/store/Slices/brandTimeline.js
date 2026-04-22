import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
const brandTimelineSlice = createSlice({
    name: "brandTimeline",
    initialState: {
        loading: false,
        account: {},
        ladger: [],
        offers: [],
        deals: [],
        orders: [],
        contacts: [],
        error: null,
        message: null,
        showBrandTimeline: false,
    },
    reducers: {
        getBTRequest(state) {
            state.loading = true;
            state.showBrandTimeline = true;
            state.ladger = [];
            state.contacts = [];
            state.account = {};
            state.error = null;
            state.email = null;
        },

        getBTSuccess(state, action) {
            const { ladger, contacts, account } = action.payload;
            state.loading = false;
            state.ladger = ladger;
            state.contacts = contacts;
            state.account = account;
            state.error = null;
        },

        getBTFailed(state) {
            state.loading = false;
            state.showBrandTimeline = false;
            state.error = "Failed To Get Brand Timeline";
        },
        clearAllErrors(state) {
            state.error = null;
        },
        setShowBrandTimeline(state, action) {
            state.showBrandTimeline = action.payload
        }
    },
});

export const getBrandTimeline = ({ email = null, loading = true, }) => {
    return async (dispatch, getState) => {
        if (loading) {
            dispatch(brandTimelineSlice.actions.getBTRequest());
        }
        try {
            const { data } = await axios.get(`${getState().user.crmEndpoint}&type=brandTimeline&email=${email}`);
            console.log("BRAND TIMELINE", data.data)
            const freshData = {
                account: data.account,
                contacts: data.contacts,
                ladger: data.timeline
            };

            dispatch(brandTimelineSlice.actions.getBTSuccess(freshData));
            dispatch(brandTimelineSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(
                brandTimelineSlice.actions.getBTFailed(
                    error.response?.data?.message
                )
            );
        }
    };
};
export const brandTimelineAction = brandTimelineSlice.actions;
export default brandTimelineSlice.reducer;
