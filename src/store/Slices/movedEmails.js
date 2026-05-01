import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";

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
      if (pageIndex === 1) {
        state.emails = emails;
      } else {
        state.emails = [...state.emails, ...emails];
      }
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

export const getmovedEmails = (email, page = 1) => {
  return async (dispatch, getState) => {
    dispatch(movedSlice.actions.getEmailRequest());

    try {
      const data = await fetchGpc({ params: { type: "moved_email", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), ...(email ? { email } : {}), page, page_size: "50" } });
      showConsole && console.log(`moved emails`, data);
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
