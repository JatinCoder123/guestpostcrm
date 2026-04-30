import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";

const gpcControllerSlice = createSlice({
  name: "gpcController",
  initialState: {
    loading: false,
    updating: false,
    checkboxes: [],
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

    updateGpcRequest(state, action) {
      state.updating = true;
      state.error = null;
      state.checkboxes = state.checkboxes.map(control => action.payload.id == control.id ? { ...control, is_allowed: action.payload.value } : control)
    },
    updateGpcSuccess(state, action) {
      state.updating = false;
    },
    updateGpcFailed(state, action) {
      state.updating = false;
      state.error = action.payload;
      state.checkboxes = state.checkboxes.map(control => action.payload.id == control.id ? { ...control, is_allowed: action.payload.value == "1" ? "0" : "1" } : control)
    },

    clearGpcMessage(state) {
      state.message = null;
    },


  },
});

export const fetchGpcController = () => {
  return async (dispatch, getState) => {
    dispatch(gpcControllerSlice.actions.getGpcRequest());

    try {

      const data = await fetchGpc({ method: "POST", params: { type: 'manage_gpc' }, body: { current_email: getState().user.user.email } });
      showConsole && console.log(`GPC Data`, data?.data?.available_checkbox);
      dispatch(gpcControllerSlice.actions.getGpcSuccess(data?.data || []));
    } catch (error) {
      dispatch(
        gpcControllerSlice.actions.getGpcFailed(
          "Failed to fetch GPC controller data"
        )
      );
    }
  };
};
export const updateGpcController = (id, value) => {
  return async (dispatch, getState) => {
    dispatch(gpcControllerSlice.actions.updateGpcRequest({ id, value }));

    try {
      const data = await fetchGpc({ method: "POST", params: { type: 'manage_gpc' }, body: { current_email: getState().user.user.email, id, value } });
      dispatch(gpcControllerSlice.actions.updateGpcSuccess());
    } catch (error) {
      dispatch(gpcControllerSlice.actions.updateGpcFailed({ id, value, message: "Failed to update GPC setting" }));
    }
  };
};


export const gpcControllerActions = gpcControllerSlice.actions;
export default gpcControllerSlice.reducer;
