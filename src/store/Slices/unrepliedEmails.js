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
    emailType: "email_inbound",
    error: null,
    unread: 0,
    showNewEmailBanner: false,
    countLoading: false,
    emailsCount: {},
    countError: null,
    totalCount: 0
  },
  reducers: {
    getEmailRequest(state, action) {
      state.emailType = action.payload.type ?? state.emailType;
      state.loading = action.payload.loading;
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
    getEmailsCountRequest(state, action) {
      state.countLoading = action.payload.loading;
      state.countError = null;
    },
    getEmailsCountSucess(state, action) {
      state.countLoading = false;
      state.emailsCount = action.payload.emailsCount;
      state.totalCount = action.payload.totalCount
      state.countError = null;
    },
    getEmailsCountFailed(state, action) {
      state.countLoading = false;
      state.countError = action.payload;
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

export const getUnrepliedEmail = ({ page = 1, loading = true, type = null }) => {
  return async (dispatch, getState) => {
    dispatch(unrepliedSlice.actions.getEmailRequest({ type, loading }));

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=${type ?? getState().unreplied.emailType}${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}`
      );


      showConsole && console.log(`Unreplied emails`, data);
      dispatch(
        unrepliedSlice.actions.getEmailSucess({
          count: data.total ?? 0,
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
export const getEmailsCount = ({ loading = true }) => {
  return async (dispatch, getState) => {
    dispatch(unrepliedSlice.actions.getEmailsCountRequest({ loading }));
    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=email_stats${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}`
      );


      showConsole && console.log(`EMAILS COUNT`, data);
      dispatch(
        unrepliedSlice.actions.getEmailsCountSucess({ emailsCount: data?.data, totalCount: data?.total_contacts })
      );
      dispatch(unrepliedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        unrepliedSlice.actions.getEmailsCountFailed(
          "Fetching  Emails Count Failed"
        )
      );
    }
  };
};


export const unrepliedAction = unrepliedSlice.actions;
export default unrepliedSlice.reducer;
