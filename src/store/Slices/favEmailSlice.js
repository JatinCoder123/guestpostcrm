import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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

export const getFavEmails = (email) => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.getEmailRequest());
    console.log("email", email)
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=favorite${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=favorite${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
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
export const getFavEmailsWithOutLoading = (email) => {
  return async (dispatch, getState) => {
    console.log("email", email)
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=favorite${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=favorite${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
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

export const favEmail = () => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.favouriteEmailRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const response = await axios.get(
        `${domain}?entryPoint=contactAction&email=${getState().ladger.email}&field=favorite`,
        {}
      );
      console.log(`Favourite Toggle Response`, response.data);
      const data = response.data;
      if (!data.success) {
        throw new Error("Toggle failed");
      }
      const message = data.new_value === 1 ? "Email Favorited Successfully" : "Email Unfavorited Successfully";
      dispatch(
        favSlice.actions.favouriteEmailSucess(message)
      );
      dispatch(favSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(favSlice.actions.favouriteEmailFailed(error.message));
    }
  };
};

export const favAction = favSlice.actions;
export default favSlice.reducer;