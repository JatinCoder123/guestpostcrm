import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";
export const websiteLists = [

    "https://www.outrightcrm.com/",
    "https://www.outrightsystems.org/",
    "https://techsauryacom1.odoo.com/",
    "https://www.guestpostcrm.com/",
    "https://store.outrightcrm.com/",
    "https://www.extractmails.com/",
    "https://www.wp-1click.com/"
];
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
        try {
            const { data } = await axios.get(`${getState().user.crmEndpoint}&type=get_website`, {
                headers: {
                    "Content-Type": "application/json",
                    "X-Api-Key": "nmD5WeHdY8i4kTUK!.7_Fzp7}K@AAX1X",
                },
            });
            showConsole && console.log(`website data`, data);
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
