import { createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { AUTH_URL } from "../constants";
import { showConsole } from "../../assets/assets";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: {},
    isAuthenticated: false,
    crmEndpoint: null,
    id: null,
    currentScore: null,
    businessEmail: null,
    error: null,
    message: null,
  },
  reducers: {
    loadUserRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.crmEndpoint = null;
      state.id = null;
      state.currentScore = null;
      state.businessEmail = null;
      state.error = null;
    },
    loadUserSuccess(state, action) {
      const { crmEndpoint, businessEmail, user, currentScore, id } = action.payload;
      state.loading = false;
      state.isAuthenticated = true;
      state.user = user;
      state.crmEndpoint = crmEndpoint;
      state.id = id;
      state.currentScore = currentScore;
      state.businessEmail = businessEmail;
      state.error = null;
    },
    loadUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.crmEndpoint = null;
      state.currentScore = null;
      state.id = null;
      state.businessEmail = null;
      state.error = action.payload;
    },
    logoutRequest(state) {
      state.loading = true;
    },
    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.currentScore = null;
      state.id = null;
      state.crmEndpoint = null;
      state.businessEmail = null;
      state.error = null;
      state.message = action.payload;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getUser = () => {
  return async (dispatch) => {
    dispatch(userSlice.actions.loadUserRequest());

    try {
      const { data } = await axios.get(
        `${AUTH_URL}?controller=auth&action=me`,
        { withCredentials: true }
      );
      showConsole && console.log("user", data);
      dispatch(
        userSlice.actions.loadUserSuccess({
          user: data.user,
          crmEndpoint: data.crmEndpoint,
          currentScore: data.current_score,
          businessEmail: data.businessEmail,
          id: data.id,
        })
      );

      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      showConsole && console.log(error);

      let message = "Something went wrong. Please try again.";

      if (error.response) {
        const status = error.response.status;
        const backendError = error.response.data?.error || "";

        switch (status) {
          case 404:
            message = null;
            break;

          case 401:
            if (backendError.includes("Invalid token")) {
              message = "Your session seems to have expired. Please sign in again.";
            } else if (backendError.includes("Unauthorized user")) {
              message = "You don’t have permission to access this area.";
            } else if (backendError.includes("email missing")) {
              message = "We couldn’t verify your session. Please log in again.";
            } else {
              message = "For security reasons, please sign in again.";
            }
            break;

          case 400:
            message = "We couldn’t complete your request. Please try again.";
            break;

          default:
            message = "Something went wrong on our side. Please try again in a moment.";
        }

      }

      dispatch(userSlice.actions.loadUserFailed(message));
    }
  };
};

export const logout = () => {
  return async (dispatch) => {
    dispatch(userSlice.actions.logoutRequest());
    try {
      const { data } = await axios.get(
        `${AUTH_URL}?controller=auth&action=logout`,
        {
          withCredentials: true,
        }
      );

      dispatch(userSlice.actions.logoutSuccess(data.message));
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(userSlice.actions.logoutFailed(error.response.data.message));
    }
  };
};

export const clearAllUserErrors = () => {
  return async (dispatch) => {
    dispatch(userSlice.actions.clearAllErrors);
  };
};
export const userAction = userSlice.actions;
export default userSlice.reducer;
