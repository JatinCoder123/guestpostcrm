import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const unansweredSlice = createSlice({
  name: "unanswered",
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
    updateUnanswered(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;
      state.count = count;
      state.emails = emails;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
  },
});

export const getUnansweredEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(unansweredSlice.actions.getEmailRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=replied&filter=${filter}&email=${email}`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=replied&filter=${filter}`
        );
      }

      console.log(`Unanswered emails`, response.data);
      const data = response.data;
      dispatch(
        unansweredSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,

        })
      );
      dispatch(unansweredSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        unansweredSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};
export const getUnansweredEmailWithOutLoading = (filter, email) => {
  return async (dispatch, getState) => {
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=replied&filter=${filter}&email=${email}`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=replied&filter=${filter}`
        );
      }

      console.log(`Unanswered emails`, response.data);
      const data = response.data;
      dispatch(
        unansweredSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
        })
      );
      dispatch(unansweredSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        unansweredSlice.actions.getEmailFailed(
          "Fetching Unreplied Emails Failed"
        )
      );
    }
  };
};
export const updateUnansweredEmails = (email) => {
  return (dispatch, getState) => {
    const updatedEmails = [email, ...getState().unanswered.emails];
    dispatch(unansweredSlice.actions.updateUnanswered({
      count: getState().unanswered.count + 1,
      emails: updatedEmails,
    }))
  }
};

export const unansweredAction = unansweredSlice.actions;
export default unansweredSlice.reducer;
