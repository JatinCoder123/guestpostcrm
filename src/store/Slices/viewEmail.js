import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const viewEmailSlice = createSlice({
  name: "viewEmail",
  initialState: {
    loading: false,
    viewEmail: [],
    contactInfo: null,
    accountInfo: null,
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
      state.loading = true;
      state.contactInfo = null;
      state.accountInfo = null;
      state.error = null;
    },
    getContactSucess(state, action) {
      const { contactInfo, accountInfo } = action.payload;
      state.loading = false;
      state.contactInfo = contactInfo;
      state.accountInfo = accountInfo;
      state.error = null;
    },
    getContactFailed(state, action) {
      state.loading = false;
      state.contactInfo = null;
      state.accountInfo = null;
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
        `${getState().user.crmEndpoint}&type=view_email&email=${email}`
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
        viewEmailSlice.actions.getViewEmailFailed("Fetching Deals  Failed")
      );
    }
  };
};
export const getContact = (email) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getContactRequest());

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=get_contact&email=${email}&page=1&page_size=50`
      );
      console.log(`contact`, data);
      dispatch(
        viewEmailSlice.actions.getContactSucess({
          contactInfo: data.contact ?? null,
          accountInfo: data.account ?? null,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getContactFailed(
          "Fetching Contact Details failed"
        )
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
