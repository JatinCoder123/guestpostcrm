import { createSlice, current } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

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
        const domain = getState().user.crmEndpoint.split("?")[0];
        try {
            const { data } = await axios.get(`${domain}?entryPoint=fetch_gpc&type=get_users`);
            showConsole && console.log(`users data`, data);
            const currentUser = data.find((user) => user.description === getState().user.user.email);
            dispatch(crmUserSlice.actions.getAllUsersSucess({ count: data.length ?? 0, users: data ?? [], currentUser }));
            dispatch(crmUserSlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(
                crmUserSlice.actions.getAllUsersFailed("Fetching All Users Failed")
            );
        }
    };
};


export const crmUserAction = crmUserSlice.actions;
export default crmUserSlice.reducer;