import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const unrepliedSlice = createSlice({
  name: "unreplied",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    showNewEmailBanner: false,
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
    updateUnreplied(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    setShowNewEmailBanner(state, action) {
      state.showNewEmailBanner = action.payload;
    }
  },
});

export const getUnrepliedEmail = ({ email = null, page = 1, newEmail = false, loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(unrepliedSlice.actions.getEmailRequest());
    }
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=unreplied${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=${page}`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=unreplied${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}`
        );
      }

      showConsole && console.log(`Unreplied emails`, response.data);
      const data = response.data;
      dispatch(
        unrepliedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data ?? [],
          pageCount: data.total_pages ?? 1,
          pageIndex: data.current_page ?? 1,
        })
      );
      if (newEmail) {
        dispatch(unrepliedSlice.actions.setShowNewEmailBanner(true));
      }
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

export const updateUnrepliedEmails = (threadId) => {
  return (dispatch, getState) => {
    const updatedEmails = getState().unreplied.emails.filter((email) => email.thread_id !== threadId);
    dispatch(unrepliedSlice.actions.updateUnreplied({
      count: getState().unreplied.count - 1,
      emails: updatedEmails,

    }))
  }
};

export const unrepliedAction = unrepliedSlice.actions;
export default unrepliedSlice.reducer;
