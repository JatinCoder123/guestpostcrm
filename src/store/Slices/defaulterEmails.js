import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const defaulterSlice = createSlice({
  name: "defaulter",
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

export const getdefaulterEmails = (email) => {
  return async (dispatch, getState) => {
    dispatch(defaulterSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_defaulters${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_defaulters${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
        );
      }

      console.log(`defaulter emails`, response.data);
      const data = response.data;
      dispatch(
        defaulterSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data ?? [],
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(defaulterSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        defaulterSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};

export const defaulterAction = defaulterSlice.actions;
export default defaulterSlice.reducer;
