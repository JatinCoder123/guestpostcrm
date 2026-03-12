import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { showConsole } from "../../assets/assets";

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
    /* ---------------- GET BACKLINKS ---------------- */

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

    /* ---------------- GET BACKLINK DETAIL ---------------- */

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

    /* ---------------- UPDATE BACKLINK ---------------- */

    updateBacklinkRequest(state) {
      state.loading = true;
    },

    updateBacklinkSuccess(state, action) {
      state.loading = false;

      const updated = action.payload;

      const index = state.backlinks.findIndex(
        (item) => item.id === updated.id
      );

      if (index !== -1) {
        state.backlinks[index] = updated;
      }

      state.message = "Backlink updated successfully";
    },

    updateBacklinkFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    /* ---------------- CLEARERS ---------------- */

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

/* =====================================================
   GET ALL BACKLINKS
===================================================== */

export const getBacklinks = () => {
  return async (dispatch) => {
    dispatch(backlinksSlice.actions.getBacklinksRequest());

    try {
      const { data } = await axios.post(
        "https://sales.guestpostcrm.com/index.php?entryPoint=fetch_gpc&type=get_seo_backlinks",
        {
          module: "outr_seo_backlinks",
        }
      );

      showConsole && console.log("Backlinks Data:", data);

      dispatch(
        backlinksSlice.actions.getBacklinksSuccess({
          backlinks: data.data ,
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

/* =====================================================
   GET SINGLE BACKLINK DETAIL
===================================================== */

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

/* =====================================================
   UPDATE BACKLINK
===================================================== */

export const updateBacklink = (formData) => {
  return async (dispatch) => {
    dispatch(backlinksSlice.actions.updateBacklinkRequest());

    try {
      const payload = {
        parent_bean: {
          module: "outr_seo_backlinks",
          id: formData.id, // Required for update

          post_author_name_c: formData.post_author_name_c,
          post_author_email_c: formData.post_author_email_c,
          target_url_c: formData.target_url_c,
          anchor_text_c: formData.anchor_text_c,
          expiry_date_c: formData.expiry_date_c,
          status_c: formData.status_c,
        },
      };

      const { data } = await axios.post(
        "https://sales.guestpostcrm.com/index.php?entryPoint=get_post_all&action_type=post_data",
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            "x-api-key": CREATE_DEAL_API_KEY,
          },
        }
      );

      showConsole && console.log("Update Response:", data);

      dispatch(
        backlinksSlice.actions.updateBacklinkSuccess(formData)
      );

      dispatch(backlinksSlice.actions.clearAllErrors());
    } catch (error) {
      console.error("Error updating backlink:", error);

      dispatch(
        backlinksSlice.actions.updateBacklinkFailed(
          error.response?.data?.message || "Updating Backlink Failed"
        )
      );
    }
  };
};

/* =====================================================
   CLEAR HELPERS
===================================================== */

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