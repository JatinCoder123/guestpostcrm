import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../constants";

const backlinksSlice = createSlice({
  name: "backlinks",
  initialState: {
    loading: false,
    backlinks: [],
    backlinkDetail: null,
    error: null,
    message: null,
  },
  reducers: {
    getBacklinksRequest(state) {
      state.loading = true;
      state.backlinks = [];
      state.error = null;
    },
    getBacklinksSuccess(state, action) {
      const { backlinks } = action.payload;
      state.loading = false;
      state.backlinks = backlinks;
      state.error = null;
    },
    getBacklinksFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    getBacklinkDetailRequest(state) {
      state.loading = true;
      state.backlinkDetail = null;
      state.error = null;
    },
    getBacklinkDetailSuccess(state, action) {
      const { backlinkDetail } = action.payload;
      state.loading = false;
      state.backlinkDetail = backlinkDetail;
      state.error = null;
    },
    getBacklinkDetailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessage(state) {
      state.message = null;
    },
    clearBacklinkDetail(state) {
      state.backlinkDetail = null;
    },
  },
});

export const getBacklinks = () => {
  return async (dispatch, getState) => {
    dispatch(backlinksSlice.actions.getBacklinksRequest());

    try {
      const { data } = await axios.post(
        "https://errika.guestpostcrm.com/index.php?entryPoint=get_post_all&action_type=get_data",
        {
          module: "outr_seo_backlinks",
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CREATE_DEAL_API_KEY,
          },
        }
      );

      console.log("Backlinks Data:", data);
      dispatch(
        backlinksSlice.actions.getBacklinksSuccess({
          backlinks: data,
        })
      );
      dispatch(backlinksSlice.actions.clearAllErrors());
    } catch (error) {
      console.error("Error fetching backlinks:", error);
      dispatch(
        backlinksSlice.actions.getBacklinksFailed(
          error.response?.data?.message || "Fetching Backlinks Failed"
        )
      );
    }
  };
};

export const getBacklinkDetail = (backlinkId) => {
  return async (dispatch, getState) => {
    dispatch(backlinksSlice.actions.getBacklinkDetailRequest());

    try {
      const { backlinks } = getState().backlinks;
      const backlinkDetail = backlinks.find((bl) => bl.id === backlinkId);

      if (backlinkDetail) {
        dispatch(
          backlinksSlice.actions.getBacklinkDetailSuccess({
            backlinkDetail,
          })
        );
      } else {
        throw new Error("Backlink not found");
      }

      dispatch(backlinksSlice.actions.clearAllErrors());
    } catch (error) {
      console.error("Error fetching backlink detail:", error);
      dispatch(
        backlinksSlice.actions.getBacklinkDetailFailed(
          error.message || "Fetching Backlink Detail Failed"
        )
      );
    }
  };
};

export const clearBacklinkMessages = () => {
  return (dispatch) => {
    dispatch(backlinksSlice.actions.clearAllErrors());
    dispatch(backlinksSlice.actions.clearAllMessage());
  };
};

export const clearBacklinkDetail = () => {
  return (dispatch) => {
    dispatch(backlinksSlice.actions.clearBacklinkDetail());
  };
};

export const backlinksActions = backlinksSlice.actions;
export default backlinksSlice.reducer;
