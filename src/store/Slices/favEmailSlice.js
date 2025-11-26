import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../constants";

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

export const getFavEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=favourite&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=favourite&filter=${filter}&page=1&page_size=50`
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
export const favEmail = (id) => {
  return async (dispatch, getState) => {
    dispatch(favSlice.actions.favouriteEmailRequest());

    try {
      const response = await axios.post(
        `${MODULE_URL}&action_type=get_data`,
        {
          module: "outr_self_test",
          where: {
            thread_id: id,
            name: "favourite",
          },
        },
        {
          headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Favourite Check in fav`, response.data);
      const data = response.data;
      if (!data.success) {
        throw Error("Already Favourite ");
      } else {
        const response = await axios.post(
          `${MODULE_URL}&action_type=post_data`,
          {
            parent_bean: {
              module: "outr_self_test",
              thread_id: id,
              name: "favourite",
            },
          },
          {
            headers: {
              "x-api-key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Response while sendig fav ", response.data);
        dispatch(
          favSlice.actions.favouriteEmailSucess("Email Favourite Successfully")
        );
        dispatch(favSlice.actions.clearAllErrors());
      }
    } catch (error) {
      dispatch(favSlice.actions.favouriteEmailFailed(error.message));
    }
  };
};

export const favAction = favSlice.actions;
export default favSlice.reducer;
