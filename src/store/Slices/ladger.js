import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const ladgerSlice = createSlice({
  name: "ladger",
  initialState: {
    loading: false,
    email: null,
    ladger: [],
    mailersSummary: null,
    error: null,
    timeline: "this_week",
    message: null,
    duplicate: 0,
  },
  reducers: {
    getLadgerRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getLadgerSuccess(state, action) {
      const { duplicate, ladger, email, mailersSummary } = action.payload;
      state.loading = false;
      state.ladger = ladger;
      state.mailersSummary = mailersSummary;
      state.email = email;
      state.duplicate = duplicate;
      state.error = null;
    },
    getLadgerFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    setTimeline(state, action) {
      state.timeline = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getLadger = () => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getLadgerRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=ledger&filter=${getState().ladger.timeline}`,
        {
          withCredentials: false,
        }
      );
      console.log("Ladger", data);
      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          duplicate: data.duplicate_threads_count,
          ladger: data.data,
          mailersSummary: data.mailers_summary,
          email: data.data && data.data[0].name,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(error.response?.data?.message)
      );
    }
  };
};
export const getLadgerEmail = (email) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getLadgerRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=ledger&filter=${
          getState().ladger.timeline
        }&email=${email}`,
        {
          withCredentials: false,
        }
      );
      console.log("Ladger Of Email", data);
      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          duplicate: data.duplicate_threads_count,
          ladger: data.data,
          mailersSummary: data.mailers_summary[0],
          email: email,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(error.response?.data?.message)
      );
    }
  };
};

export const ladgerAction = ladgerSlice.actions;
export default ladgerSlice.reducer;
