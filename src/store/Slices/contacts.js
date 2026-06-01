import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc, http } from "../../services/api";
import { commonState } from "../shared/commonState";
import { buildTableRequestBody } from "../../utils/preferenceStorage";

const contactSlice = createSlice({
    name: "contacts",
    initialState: {
        contacts: [],
        adding: false,
        ...commonState

    },
    reducers: {
        getAllContactsRequest(state) {
            state.loading = true;
            state.error = null;
        },
        getAllContactsSucess(state, action) {
            const { count, pageCount, pageIndex, contacts, summary } = action.payload;
            state.loading = false;
            state.count = count;
            if (pageIndex === 1) {
                state.contacts = contacts;
            } else {
                state.contacts = [...state.contacts, ...contacts];
            }
            state.pageCount = pageCount;
            state.summary = summary;
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


export const addContact = (contactData) => {
    return async (dispatch, getState) => {
        dispatch(contactSlice.actions.addContactRequest());
        showConsole && console.log("contactData", contactData);
        try {
            const data = await fetchGpc({ params: { type: 'create_contact' }, method: "POST", body: contactData });
            showConsole && console.log("added contact", data);
            // dispatch(getAllContacts({}));
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
