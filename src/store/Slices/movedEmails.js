import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const movedSlice = createSlice({
  name: "moved",
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

export const getmovedEmails = (email) => {
  return async (dispatch, getState) => {
    dispatch(movedSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=moved_email&${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=moved_email&${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
        );
      }

      console.log(`moved emails`, response.data);
      const data = response.data;
      dispatch(
        movedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(movedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        movedSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};

export const movedAction = movedSlice.actions;
export default movedSlice.reducer;
