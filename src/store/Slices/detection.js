import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
  return async (dispatch, getState) => {
    dispatch(detectionSlice.actions.getDetectionRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=spam_detection&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=spam_detection&filter=${filter}&page=1&page_size=50`
        );
      }
      const data = response.data;
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
