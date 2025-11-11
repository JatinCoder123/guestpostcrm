import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const unrepliedSlice = createSlice({
  name: "unreplied",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    error: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.count = 0;
      state.emails = [];
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = true;
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.emails = [];
      state.count = 0;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getUnrepliedEmail = (filter, email) => {
  return async (dispatch) => {
    dispatch(unrepliedSlice.actions.getEmailRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=unreplied&filter=${filter}&email=${email}`
      );
      console.log(`Unreplied emails`, data);
      dispatch(
        unrepliedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
        })
      );
      dispatch(unrepliedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        unrepliedSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};

export const unrepliedAction = unrepliedSlice.actions;
export default unrepliedSlice.reducer;
