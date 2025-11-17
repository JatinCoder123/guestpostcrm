import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getUnrepliedEmail = (filter, email) => {
  return async (dispatch ,getState) => {
    dispatch(unrepliedSlice.actions.getEmailRequest());
    console.log(email);
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint}&type=unreplied&filter=${filter}&email=${email}`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint}&type=unreplied&filter=${filter}`
        );
      }

      console.log(`Unreplied emails`, response.data);
      const data = response.data;
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
