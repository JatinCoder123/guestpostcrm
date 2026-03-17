import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { extractEmail, showConsole } from "../../assets/assets";

const unrepliedSlice = createSlice({
  name: "unreplied",
  initialState: {
    loading: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    unread: 0,
    showNewEmailBanner: false,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails, pageCount, pageIndex, unread } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.emails = emails;
      } else {
        state.emails = [...state.emails, ...emails];
      }
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.unread = unread;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    removeUnreplied(state, action) {
      state.emails = state.emails.filter(e => extractEmail(e?.from) !== action.payload);
      state.count = state.emails.length;
    },
    setShowNewEmailBanner(state, action) {
      state.showNewEmailBanner = action.payload;
    },
    updateUnread(state, action) {
      state.unread = state.unread - 1;
      state.emails = state.emails.map((email) => {
        if (email.thread_id === action.payload.thread_id) {
          email.is_seen = 1;
        }
        return email;
      });
    }
  },
});

export const getUnrepliedEmail = ({ page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(unrepliedSlice.actions.getEmailRequest());
    }
    try {
      let response;

      response = await axios.get(
        `${getState().user.crmEndpoint
        }&type=unreplied${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}`
      );


      showConsole && console.log(`Unreplied emails`, response.data);
      const data = response.data;
      dispatch(
        unrepliedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data ?? [],
          unread: data.unread ?? 0,
          pageCount: data.total_pages ?? 1,
          pageIndex: data.current_page ?? 1,
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
