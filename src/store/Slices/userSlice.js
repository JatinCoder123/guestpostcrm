import { createSlice } from "@reduxjs/toolkit";

import axios from "axios";
import { AUTH_URL, BACKEND_URL } from "../constants";

const userSlice = createSlice({
  name: "user",
  initialState: {
    loading: false,
    user: {},
    isAuthenticated: false,
    error: null,
    message: null,
    isUpdated: false,
  },
  reducers: {
    loginRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    loginSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loginFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },
    loadUserRequest(state) {
      state.loading = true;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
    },
    loadUserSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.error = null;
    },
    loadUserFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = action.payload;
    },

    logoutSuccess(state, action) {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = {};
      state.error = null;
      state.message = action.payload;
    },
    logoutFailed(state, action) {
      state.loading = false;
      state.isAuthenticated = state.isAuthenticated;
      state.user = state.user;
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
    console.log("gettin user");
    try {
      const { data } = await axios.get(
        `${AUTH_URL}?controller=auth&action=me`,
        {
          withCredentials: true,
        }
      );
      console.log("res", data);
      dispatch(userSlice.actions.loadUserSuccess(data.user));
      dispatch(userSlice.actions.clearAllErrors());
    } catch (error) {
      console.log(error);
      dispatch(userSlice.actions.loadUserFailed(error.response.data.message));
    }
  };
};
export const logout = () => {
  return async (dispatch) => {
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
