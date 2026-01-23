import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { act } from "react";
import { CREATE_DEAL_API_KEY } from "../constants";

const forwardedSlice = createSlice({
  name: "forwarded",
  initialState: {
    loading: false,
    forward: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    message: null,
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
    forwardEmailRequest(state) {
      state.forward = true;
      state.error = null;
      state.message = null;
    },
    forwardEmailSucess(state, action) {
      state.forward = false;
      state.error = null;
      state.message = action.payload;
    },
    forwardEmailFailed(state, action) {
      state.forward = false;
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

export const getForwardedEmails = (email) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=forwarded${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=forwarded${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
        );
      }

      console.log(`forwarded emails`, response.data);
      const data = response.data;
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(forwardedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        forwardedSlice.actions.getEmailFailed(
          "Fetching Forwarded Emails Failed"
        )
      );
    }
  };
};
export const getForwardedEmailsWithOutLoading = (email) => {
  return async (dispatch, getState) => {
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=forwarded${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=forwarded${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
        );
      }

      console.log(`forwarded emails`, response.data);
      const data = response.data;
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(forwardedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        forwardedSlice.actions.getEmailFailed(
          "Fetching Forwarded Emails Failed"
        )
      );
    }
  };
};
export const forwardEmail = (contactId, to, id) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.forwardEmailRequest());

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const response = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            id: contactId,
            module: "Contacts",
            thread_id: id,
            assigned_user_id: to,
            forwarded: 1
          },
        },
        {
          headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Response while sendig ", response.data);
      dispatch(
        forwardedSlice.actions.forwardEmailSucess(
          "Email Forwarded Successfully"
        )
      );
      dispatch(forwardedSlice.actions.clearAllErrors());

    } catch (error) {
      dispatch(forwardedSlice.actions.forwardEmailFailed(error.message));
    }
  };
};

export const forwardedAction = forwardedSlice.actions;
export default forwardedSlice.reducer;
