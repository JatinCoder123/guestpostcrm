import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const gpcControllerSlice = createSlice({
  name: "gpcController",
  initialState: {
    loading: false,
    updating: false,
    checkboxes: {},
    error: null,
    message: null,
  },
  reducers: {
    getGpcRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getGpcSuccess(state, action) {
      state.loading = false;
      state.checkboxes = action.payload;
    },
    getGpcFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    updateGpcRequest(state) {
      state.updating = true;
      state.error = null;
    },
    updateGpcSuccess(state, action) {
      state.updating = false;
      state.message = action.payload;
    },
    updateGpcFailed(state, action) {
      state.updating = false;
      state.error = action.payload;
    },

    clearGpcMessage(state) {
      state.message = null;
    },
    applyBackendUpdate(state, action) {
      const { key, value } = action.payload;
      state.checkboxes[key] = value;
    }

  },
});

export const fetchGpcController = () => {
  return async (dispatch, getState) => {
    dispatch(gpcControllerSlice.actions.getGpcRequest());

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];

      const { data } = await axios.get(
        `${domain}?entryPoint=fetch_gpc&type=manage_gpc&get_name=1`
      );
      showConsole && console.log(`GPC Data`, data?.data?.available_checkbox);

      dispatch(
        gpcControllerSlice.actions.getGpcSuccess(
          data?.data?.available_checkbox || {}
        )
      );
    } catch (error) {
      dispatch(
        gpcControllerSlice.actions.getGpcFailed(
          "Failed to fetch GPC controller data"
        )
      );
    }
  };
};
export const updateGpcController = (key, value) => {
  return async (dispatch, getState) => {
    dispatch(gpcControllerSlice.actions.updateGpcRequest());

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];

      const { data } = await axios.get(
        `${domain}?entryPoint=fetch_gpc&type=manage_gpc&field=${key}&value=${value ? 1 : 0
        }`
      );

      if (data?.success) {
        dispatch(
          gpcControllerSlice.actions.applyBackendUpdate({
            key: data.update,
            value: data.new,
          })
        );
      }

      dispatch(
        gpcControllerSlice.actions.updateGpcSuccess(
          "GPC setting updated"
        )
      );
    } catch (error) {
      dispatch(
        gpcControllerSlice.actions.updateGpcFailed(
          "Failed to update GPC setting"
        )
      );
    }
  };
};


export const gpcControllerActions = gpcControllerSlice.actions;
export default gpcControllerSlice.reducer;
