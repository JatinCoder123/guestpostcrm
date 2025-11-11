import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const spamDetectionSlice = createSlice({
  name: "spamDetection",
  initialState: {
    loading: false,
    emails: null,
    count: 0,
    error: null,
  },
  reducers: {
    getSpamRequest(state) {
      state.loading = true;
      state.count = 0;
      state.emails = null;
      state.error = null;
    },
    getSpamSuccess(state, action) {
      const { count, emails } = action.payload;
      state.loading = false; // loading false karna mat bhoolen
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getSpamFailed(state, action) {
      state.loading = false;
      state.emails = null;
      state.count = 0;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getSpamDetection = (filter = "this_month", email) => {
  return async (dispatch) => {
    dispatch(spamDetectionSlice.actions.getSpamRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=spam_detection&filter=${filter}`
      );
      console.log(`Spam detection emails`, data);
      dispatch(
        spamDetectionSlice.actions.getSpamSuccess({
          count: data.data_count,
          emails: data.data,
        })
      );
    } catch (error) {
      dispatch(
        spamDetectionSlice.actions.getSpamFailed(
          error.response?.data?.message || "Fetching Spam Detection Emails Failed"
        )
      );
    }
  };
};

export const spamDetectionActions = spamDetectionSlice.actions;
export default spamDetectionSlice.reducer;