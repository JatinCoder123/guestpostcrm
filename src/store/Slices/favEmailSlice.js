import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const favSlice = createSlice({
  name: "fav",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
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

export const getFavEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=favourite&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=favourite&filter=${filter}&page=1&page_size=50`
        );
      }

      console.log(`favorite emails`, response.data);
      const data = response.data;
      dispatch(
        favSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(favSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(favSlice.actions.getEmailFailed("Fetching Fav Emails Failed"));
    }
  };
};

export const favAction = favSlice.actions;
export default favSlice.reducer;
