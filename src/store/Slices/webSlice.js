import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { websiteLists } from "../../assets/assets";

const websiteSlice = createSlice({
    name: "website",
    initialState: {
        loading: false,
        count: 0,
        websites: [],
        error: null,
    },
    reducers: {
        getAllWebsitesRequest(state) {
            state.loading = true;
            state.error = null;
            state.websites = [];
        },
        getAllWebsitesSuccess(state, action) {
            const { websites } = action.payload;
            state.loading = false;
            state.websites = websites;
            state.error = null;
        },
        getAllWebsitesFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.websites = websiteLists;
        },
        clearAllErrors(state) {
            state.error = null;
        },
    },
});

export const getAllWebsites = () => {
    return async (dispatch, getState) => {
        dispatch(websiteSlice.actions.getAllWebsitesRequest());
        const domain = getState().user.crmEndpoint.split("?")[0];
        try {
            const { data } = await axios.get(`${domain}?entryPoint=fetch_gpc&type=get_website`);
            console.log(`website data`, data);
            dispatch(websiteSlice.actions.getAllWebsitesSuccess({ websites: data.data ?? websiteLists }));
            dispatch(websiteSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(
                websiteSlice.actions.getAllWebsitesFailed("Fetching All Website Record Failed")
            );
        }
    };
};


export const websiteAction = websiteSlice.actions;
export default websiteSlice.reducer;
