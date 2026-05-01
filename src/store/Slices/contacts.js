import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { CREATE_DEAL_API_KEY } from "../constants";
import { apiRequest } from "../../services/api";

const contactSlice = createSlice({
    name: "contacts",
    initialState: {
        loading: false,
        count: 0,
        contacts: [],
        error: null,
        pageIndex: 1,
        pageCount: 1,
        adding: false,
        message: null

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
        addContactRequest(state) {
            state.adding = true;
            state.error = null;
        },
        addContactSucess(state, action) {
            state.adding = false;
            state.error = null;
            state.message = action.payload
        },
        addContactFailed(state, action) {
            state.adding = false;
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

export const getAllContacts = ({ page = 1 }) => {
    return async (dispatch, getState) => {
        dispatch(contactSlice.actions.getAllContactsRequest());
        const domain = getState().user.crmEndpoint.split("?")[0];
        try {
            const data = await apiRequest({
                endpoint: `${domain}?entryPoint=get_post_all`, params: { action_type: 'get_data', page, page_size: 50 }, body: { module: "Contacts" },
                headers: {
                    "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
                    "Content-Type": "aplication/json",
                },
                method: "POST"
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
export const addContact = (contactData) => {
    return async (dispatch, getState) => {
        dispatch(contactSlice.actions.addContactRequest());

        showConsole && console.log("contactData", contactData);

        const domain = getState().user.crmEndpoint.split("?")[0];

        try {
            // Base payload (always send parent_bean)
            const payload = {
                parent_bean: {
                    module: "Contacts",
                    ...contactData,
                },
            };



            const { data } = await axios.post(
                `${domain}?entryPoint=get_post_all&action_type=post_data`,
                payload,
                {
                    headers: {
                        "X-Api-Key": CREATE_DEAL_API_KEY,
                        "Content-Type": "application/json", // typo fixed
                    },
                },
            );

            showConsole && console.log("added contact", data);
            dispatch(getAllContacts({}));
            dispatch(contactSlice.actions.addContactSucess("Contact Created Successfully."));
            dispatch(contactSlice.actions.clearAllErrors());

        } catch (error) {
            console.log(error)
            dispatch(
                contactSlice.actions.addContactFailed("Update Contact failed"),
            );
        }
    };
};

export const contactAction = contactSlice.actions;
export default contactSlice.reducer;
