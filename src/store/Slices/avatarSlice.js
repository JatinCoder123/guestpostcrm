import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { apiRequest } from "../../services/api";

const avatarSlice = createSlice({
  name: "avatar",
  initialState: {
    loading: false,
    avatars: [],
    avatar: null,
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
    getAvatarRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getAvatarSucess(state, action) {
      state.loading = false;
      state.avatar = action.payload;
      state.error = null;
    },
    getAvatarFailed(state, action) {
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
      const data = await apiRequest({ endpoint: `${domain}?entryPoint=avtar` });
      showConsole && console.log(`avatars`, data);
      dispatch(avatarSlice.actions.getAllAvatarSucess(data));
      dispatch(avatarSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        avatarSlice.actions.getAllAvatarFailed("Fetching All Avatars Failed")
      );
    }
  };
};
export const getAvatar = () => {
  return async (dispatch, getState) => {
    dispatch(avatarSlice.actions.getAvatarRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const data = await apiRequest({ endpoint: `${domain}?entryPoint=avtar&email=${getState().viewEmail.contactInfo?.email1}` });
      showConsole && console.log(`avatar of email`, data);
      dispatch(avatarSlice.actions.getAvatarSucess(data.avatar_url));
      dispatch(avatarSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        avatarSlice.actions.getAvatarFailed("Fetching Avatar of email Failed")
      );
    }
  };
};

export const avatarAction = avatarSlice.actions;
export default avatarSlice.reducer;
