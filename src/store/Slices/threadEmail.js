import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const threadEmailSlice = createSlice({
  name: "threadEmail",
  initialState: {
    loading: false,
    sending: false,
    threadEmail: [],
    message: null,
    error: null,
  },
  reducers: {
    getThreadEmailRequest(state) {
      state.loading = true;
      state.threadEmail = [];
      state.error = null;
    },
    getThreadEmailSucess(state, action) {
      const { threadEmail } = action.payload;
      state.loading = false;
      state.threadEmail = threadEmail;
      state.error = null;
      state.message = null;
    },
    getThreadEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
    },
    sendEmailRequest(state) {
      state.sending = true;
      state.loading = true;
      state.message = null;
      state.error = null;
    },
    sendEmailSucess(state, action) {
      const { message } = action.payload;
      state.sending = false;

      state.loading = false;
      state.message = message;
      state.error = null;
    },
    sendEmailFailed(state, action) {
      state.sending = false;
      state.loading = false;
      state.message = null;
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

export const getThreadEmail = (email, threadId) => {
  return async (dispatch, getState) => {
    dispatch(threadEmailSlice.actions.getThreadEmailRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=view_thread&thread_id=${threadId}&email=${email}&page=1&page_size=50`
      );
      showConsole && console.log(`threadEmail`, data);
      dispatch(
        threadEmailSlice.actions.getThreadEmailSucess({
          threadEmail: data.emails,
        })
      );
      dispatch(threadEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        threadEmailSlice.actions.getThreadEmailFailed(
          "Fetching Thread Email  Failed"
        )
      );
    }
  };
};
export const sendEmailToThread = (threadId, reply) => {
  return async (dispatch, getState) => {
    dispatch(threadEmailSlice.actions.sendEmailRequest());

    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=thread_reply`,
        {
          threadId,
          replyBody: reply,
          email: getState().ladger.email,
          current_email: getState().user.user.email,
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      showConsole && console.log(`Reply Data`, data);
      dispatch(
        threadEmailSlice.actions.sendEmailSucess({
          message: "Reply To Thread Sent Successfully",
        })
      );
      dispatch(threadEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        threadEmailSlice.actions.sendEmailFailed("Error while sending email")
      );
    }
  };
};

export const threadEmailAction = threadEmailSlice.actions;
export default threadEmailSlice.reducer;
