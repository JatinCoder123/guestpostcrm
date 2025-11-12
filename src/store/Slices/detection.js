import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const detectionSlice = createSlice({
  name: "detection",
  initialState: {
    loading: false,
    detection: [],
    count: 0,
    error: null,
  },
  reducers: {
    getDetectionRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDetectionSucess(state, action) {
      const { count, detection } = action.payload;
      state.loading = false;
      state.detection = detection;
      state.count = count;
      state.error = null;
    },
    getDetectionFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getDetection = (filter, email) => {
  return async (dispatch) => {
    dispatch(detectionSlice.actions.getDetectionRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=spam_detection&filter=${filter}&email=${email}`
      );
      console.log(`detection`, data);
      dispatch(
        detectionSlice.actions.getDetectionSucess({
          count: data.data_count ?? 0,
          detection: data.data,
        })
      );
      dispatch(detectionSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        detectionSlice.actions.getDetectionFailed("Fetching detection  Failed")
      );
    }
  };
};

export const detectionAction = detectionSlice.actions;
export default detectionSlice.reducer;
