import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const threadEmailSlice = createSlice({
  name: "threadEmail",
  initialState: {
    loading: false,
    threadEmail: [],
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
    },
    getThreadEmailFailed(state, action) {
      state.loading = false;
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

export const getThreadEmail = (email, threadId) => {
  return async (dispatch) => {
    dispatch(threadEmailSlice.actions.getThreadEmailRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=view_thread&thread_id=${threadId}&email=${email}`
      );
      console.log(`threadEmail`, data);
      dispatch(
        threadEmailSlice.actions.getThreadEmailSucess({
          threadEmail: data.emails,
        })
      );
      dispatch(threadEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        threadEmailSlice.actions.getThreadEmailFailed("Fetching Deals  Failed")
      );
    }
  };
};
export const sendEmailToThread = (threadId, reply) => {
  return async (dispatch) => {
    dispatch(threadEmailSlice.actions.sendEmailRequest());

    try {
      const { data } = await axios.post(
        `${BACKEND_URL}&type=thread_reply`,
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
        threadEmailSlice.actions.sendEmailSucess({
          message: data.message,
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
