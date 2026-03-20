import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";
import { CREATE_DEAL_API_KEY } from "../constants";

const contactSlice = createSlice({
    name: "contacts",
    initialState: {
        loading: false,
        count: 0,
        contacts: [],
        error: null,
        pageIndex: 1,
        pageCount: 1,

    },
    reducers: {
        getAllContactsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getAllContactsSucess(state, action) {
            const { count, pageCount, pageIndex, contacts } = action.payload;
            state.loading = false;
            state.count = count;
            state.contacts = contacts;
            state.pageCount = pageCount;
            state.pageIndex = pageIndex;
            state.error = null;
        },
        getAllContactsFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
            state.contacts = [];
        },
        clearAllErrors(state) {
            state.error = null;
        },

    },
});

export const getAllContacts = ({ page = 1 }) => {
    return async (dispatch, getState) => {
        dispatch(contactSlice.actions.getAllContactsRequest());
        const domain = getState().user.crmEndpoint.split("?")[0];
        try {
            const { data } = await axios.post(`${domain}?entryPoint=get_post_all&action_type=get_data&page=${page}&page_size=50`, { module: "Contacts" }, {
                headers: {
                    "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
                    "Content-Type": "aplication/json",
                },
            },
            );
            showConsole && console.log(`CONTACTS ALL `, data);
            dispatch(contactSlice.actions.getAllContactsSucess({
                count: data?.length ?? 0,
                contacts: data ?? [],

            }));
            dispatch(contactSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(
                contactSlice.actions.getAllContactsFailed("Fetching All Contact Record Failed")
            );
        }
    };
};


export const contactAction = contactSlice.actions;
export default contactSlice.reducer;
