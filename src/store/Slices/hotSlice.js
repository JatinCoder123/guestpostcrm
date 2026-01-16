import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const hotSlice = createSlice({
  name: "hot",
  initialState: {
    loading: false,
    count: 0,
    hots: [],
    error: null,
  },
  reducers: {
    getAllHotsRequest(state) {
      state.loading = true;
      state.error = null;
      state.hots = [];
    },
    getAllhotsucess(state, action) {
      const { count, hots } = action.payload;
      state.loading = false;
      state.count = count;
      state.hots = hots;
      state.error = null;
    },
    getAllHotsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.hots = [];
    },
    clearAllErrors(state) {
      state.error = null;
    },
    updateCount(state, action) {
      if (action.payload === 1) {
        state.count += 1;
        return;
      }
      state.count = 0;

    }
  },
});

export const getAllHot = () => {
  return async (dispatch, getState) => {
    dispatch(hotSlice.actions.getAllHotsRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const { data } = await axios.get(`${domain}?entryPoint=fetch_gpc&type=get_alerts&filter=${getState().ladger.timeline}&page=1&page_size=50&label=hot`);
      console.log(`hot data`, data);
      dispatch(hotSlice.actions.getAllhotsucess({ count: 0, hots: data.data ?? [] }));
      dispatch(hotSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        hotSlice.actions.getAllHotsFailed("Fetching All Hot Record Failed")
      );
    }
  };
};


export const hotAction = hotSlice.actions;
export default hotSlice.reducer;
