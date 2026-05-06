import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import {
  updateActivity,
  createLedgerEntry,
  buildLedgerItem,
  applyHashtag,
} from "../../services/utils";
import { getLadger } from "./ladger";
import { apiRequest, fetchGpc } from "../../services/api";

const favSlice = createSlice({
  name: "fav",
  initialState: {
    loading: false,
    emails: [],
    favourite: false,
    message: null,
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
    favouriteEmailRequest(state) {
      state.favourite = true;
      state.error = null;
      state.message = null;
    },
    favouriteEmailSucess(state, action) {
      state.favourite = false;
      state.error = null;
      state.message = action.payload;
    },
    favouriteEmailFailed(state, action) {
      state.favourite = false;
      state.error = action.payload;
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
  },
});

export const getFavEmails = ({ page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    loading && dispatch(favSlice.actions.getEmailRequest());
    try {
      const timeline = getState().ladger.timeline
      const data = await fetchGpc({ params: { type: "favorite", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), page, page_size: 50 } });
      showConsole && console.log(`favorite emails`, data);
      dispatch(
        favSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        }),
      );
      dispatch(favSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(favSlice.actions.getEmailFailed("Fetching Fav Emails Failed"));
    }
  };
};
export const favEmail = ({ threadId, email }) => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.favouriteEmailRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const data = await apiRequest({ endpoint: `${domain}?entryPoint=contactAction`, params: { field: 'favorite', email } });
      showConsole && console.log(`Favourite Toggle data`, data);
      if (!data.success) {
        throw new Error("Toggle failed");
      }
      const message =
        data.new_value === 1
          ? "Email Favorited Successfully"
          : "Email Unfavorited Successfully";
      dispatch(favSlice.actions.favouriteEmailSucess(message));
      dispatch(favSlice.actions.clearAllErrors());
      updateActivity(
        email,
        data.new_value === 1 ? "Email Favorited " : "Email Unfavorited ",
      );
      await createLedgerEntry({
        domain: domain,
        email,
        thread_id: threadId,
        group: "Activity",
        items: [
          buildLedgerItem({
            status:
              data.new_value === 1 ? "Mark-Favourite" : "Mark-Unfavourite",
            detail: `email: {${email}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
        okHandler: () => dispatch(getLadger({ email }))
      });
    } catch (error) {
      dispatch(favSlice.actions.favouriteEmailFailed(error.message));
    }
  };
};

export const favAction = favSlice.actions;
export default favSlice.reducer;
