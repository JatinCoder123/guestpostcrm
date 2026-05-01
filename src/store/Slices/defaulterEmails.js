import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";

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
      const timeline = getState().ladger.timeline

      const data = await fetchGpc({ params: { type: "get_defaulters", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), ...(email ? { email } : {}), page: 1, page_size: 50 } });

      showConsole && console.log(`defaulter emails`, data);
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
