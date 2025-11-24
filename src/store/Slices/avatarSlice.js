import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const avatarSlice = createSlice({
  name: "avatar",
  initialState: {
    loading: false,
    avatars: [],
    error: null,
  },
  reducers: {
    getAllAvatarRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getAllAvatarSucess(state, action) {
      state.loading = false;
      state.avatars = action.payload;
      state.error = null;
    },
    getAllAvatarFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getAllAvatar = () => {
  return async (dispatch, getState) => {
    dispatch(avatarSlice.actions.getAllAvatarRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const { data } = await axios.get(`${domain}?entryPoint=avtar`);
      console.log(`avatars`, data);
      dispatch(avatarSlice.actions.getAllAvatarSucess(data));
      dispatch(avatarSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        avatarSlice.actions.getAllAvatarFailed("Fetching All Avatars Failed")
      );
    }
  };
};

export const avatarAction = avatarSlice.actions;
export default avatarSlice.reducer;
