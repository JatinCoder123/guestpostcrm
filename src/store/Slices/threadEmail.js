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
    clearAllErrors(state) {
      state.error = null;
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

export const threadEmailAction = threadEmailSlice.actions;
export default threadEmailSlice.reducer;
