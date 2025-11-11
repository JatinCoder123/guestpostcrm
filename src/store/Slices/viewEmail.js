import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const viewEmailSlice = createSlice({
  name: "viewEmail",
  initialState: {
    loading: false,
    viewEmail: [],
    error: null,
  },
  reducers: {
    getViewEmailRequest(state) {
      state.loading = true;
      state.viewEmail = [];
      state.error = null;
    },
    getViewEmailSucess(state, action) {
      const { viewEmail } = action.payload;
      state.loading = true;
      state.viewEmail = viewEmail;
      state.error = null;
    },
    getViewEmailFailed(state, action) {
      state.loading = false;
      state.viewEmail = [];
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getViewEmail = (filter, email) => {
  return async (dispatch) => {
    dispatch(viewEmailSlice.actions.getViewEmailRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=view_email&email=${email}`
      );
      console.log(`viewEmail`, data);
      dispatch(
        viewEmailSlice.actions.getViewEmailSucess({
          viewEmail: data.data,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getViewEmailFailed("Fetching Deals  Failed")
      );
    }
  };
};

export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
