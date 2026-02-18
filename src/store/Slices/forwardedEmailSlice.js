import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const forwardedSlice = createSlice({
  name: "forwarded",
  initialState: {
    loading: false,
    forward: false,
    emails: [],
    count: 0,
    error: null,
    message: null,
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
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

export const getForwardedEmails = ({ loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(forwardedSlice.actions.getEmailRequest());
    }

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=forwarded&current_email=${getState().user.user.email}`
      );


      showConsole && console.log(`forwarded emails`, data);
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data?.length ?? 0,
          emails: data,
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

export const forwardEmail = (email, id) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.forwardEmailRequest());
    showConsole && console.log("EMAIL", email)
    showConsole && console.log("EMAIL", id)

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const response = await axios.get(
        `${domain}?entryPoint=fetch_gpc&type=assigned_task&client_email=${email}&id=${id}`,
      );
      showConsole && console.log("Assiging  ", response.data);
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
