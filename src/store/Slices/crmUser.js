import { createSlice, current } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";
import { setCurrentUser } from "../../services/utils";

const crmUserSlice = createSlice({
  name: "crmUser",
  initialState: {
    loading: false,
    count: 0,
    users: [],
    currentUser: null,
    error: null,
  },
  reducers: {
    getAllUsersRequest(state) {
      state.loading = true;
      state.error = null;
      state.users = [];
    },
    getAllUsersSucess(state, action) {
      const { count, users, currentUser } = action.payload;
      state.loading = false;
      state.count = count;
      state.users = users;
      state.currentUser = currentUser;
      state.error = null;
    },
    getAllUsersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.users = [];
      state.currentUser = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getAllUsers = () => {
  return async (dispatch, getState) => {
    dispatch(crmUserSlice.actions.getAllUsersRequest());
    try {
      const data = await fetchGpc({
        params: { type: 'get_users' }
      }
      );
      showConsole && console.log(`users data`, data);
      const currentUser = data.find(
        (user) => user.description === getState().user.user.email,
      );
      console.log(currentUser)
      setCurrentUser(currentUser)
      dispatch(
        crmUserSlice.actions.getAllUsersSucess({
          count: data.length ?? 0,
          users: data ?? [],
          currentUser,
        }),
      );
      dispatch(crmUserSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        crmUserSlice.actions.getAllUsersFailed("Fetching All Users Failed"),
      );
    }
  };
};

export const crmUserAction = crmUserSlice.actions;
export default crmUserSlice.reducer;
