import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../constants";

const viewEmailSlice = createSlice({
  name: "viewEmail",
  initialState: {
    loading: false,
    contactLoading: false,
    viewEmail: [],
    contactInfo: null,
    accountInfo: null,
    dealInfo:null,
    threadId: null,
    message: null,
    error: null,
  },
  reducers: {
    getViewEmailRequest(state) {
      state.loading = true;
      state.viewEmail = [];
      state.error = null;
    },
    getViewEmailSucess(state, action) {
      const { viewEmail, threadId } = action.payload;
      state.loading = false;
      state.viewEmail = viewEmail;
      state.threadId = threadId;
      state.error = null;
    },
    getViewEmailFailed(state, action) {
      state.loading = false;
      state.viewEmail = [];
      state.error = action.payload;
    },
    getContactRequest(state) {
      state.contactLoading = true;
      state.contactInfo = null;
      state.accountInfo = null;
      state.dealInfo = null;
      state.error = null;
    },
    getContactSucess(state, action) {
      const { contactInfo, accountInfo, dealInfo } = action.payload;
      state.contactLoading = false;
      state.contactInfo = contactInfo;
      state.accountInfo = accountInfo;
      state.dealInfo = dealInfo;
      state.error = null;
    },
    getContactFailed(state, action) {
      state.contactLoading = false;
      state.contactInfo = null;
      state.accountInfo = null;
      state.dealInfo = null;
      state.error = action.payload;
    },
    editContactRequest(state) {
      state.contactLoading = true;
      state.message = null;
      state.error = null;
    },
    editContactSucess(state, action) {
      state.contactLoading = false;
      state.message = "Contact updated successfully";
      state.error = null;
    },
    editContactFailed(state, action) {
      state.contactLoading = false;
      state.message = null;
      state.error = action.payload;
    },
    sendEmailRequest(state) {
      state.loading = true;
      state.message = null;
      state.error = null;
    },
    sendEmailSucess(state, action) {
      const { message } = action.payload;
      state.loading = false;
      state.message = message;
      state.error = null;
    },
    sendEmailFailed(state, action) {
      state.loading = false;
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

export const getViewEmail = (email) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getViewEmailRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=view_email&email=${getState().ladger.email
        }`
      );
      console.log(`viewEmail`, data);
      dispatch(
        viewEmailSlice.actions.getViewEmailSucess({
          viewEmail: data.emails,
          threadId: data.thread_id,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getViewEmailFailed(
          "Fetching View Emails  Failed"
        )
      );
    }
  };
};
export const getContact = () => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getContactRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=get_contact&email=${getState().ladger.email}&page=1&page_size=50`
      );
      console.log(`contact`, data);
      dispatch(
        viewEmailSlice.actions.getContactSucess({
          contactInfo: data.contact ?? null,
          accountInfo: data.account ?? null,
          dealInfo: data.deal_fetch ?? null,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getContactFailed("Fetching View Details failed")
      );
    }
  };
};
export const editContact = (contactData) => {
  return async (dispatch) => {
    dispatch(viewEmailSlice.actions.editContactRequest());
    console.log("contactData", contactData);

    try {
      const data = await axios.post(
        `${MODULE_URL}&action_type=post_data`,

        {
          parent_bean: {
            module: "Contacts",
            ...contactData["contact"],
          },
          child_bean: {
            module: "Accounts",
            ...contactData["account"],
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      console.log(`contact`, data);
      dispatch(viewEmailSlice.actions.editContactSucess());
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.editContactFailed("Update Contact failed")
      );
    }
  };
};
export const sendEmail = (reply) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.sendEmailRequest());
    const threadId = getState().viewEmail.threadId;

    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=thread_reply`,
        {
          threadId,
          replyBody: reply,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(`Reply Data`, data);
      dispatch(
        viewEmailSlice.actions.sendEmailSucess({
          message: data.message,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      console.log(error);
      dispatch(
        viewEmailSlice.actions.sendEmailFailed("Error while sending email")
      );
    }
  };
};

export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
