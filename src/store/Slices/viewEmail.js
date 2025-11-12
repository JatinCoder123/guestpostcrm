import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const viewEmailSlice = createSlice({
  name: "viewEmail",
  initialState: {
    loading: false,
    viewEmail: [],
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
  return async (dispatch) => {
    dispatch(viewEmailSlice.actions.getViewEmailRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=view_email&email=${email}`
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
export const sendEmail = (reply) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.sendEmailRequest());
    const threadId = getState().viewEmail.threadId;

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
        viewEmailSlice.actions.sendEmailSucess({
          message: data.message,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.sendEmailFailed("Fetching Deals  Failed")
      );
    }
  };
};

export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
