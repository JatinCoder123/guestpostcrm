import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";
const initialState = {
  loading: false,
  threadEmail: [],
  message: null,
  error: null,
  count: 0,
}
const threadEmailSlice = createSlice({
  name: "threadEmail",
  initialState,
  reducers: {
    getThreadEmailRequest(state) {
      state.loading = true;
      state.threadEmail = [];
      state.error = null;
      state.count = 0
    },
    getThreadEmailSucess(state, action) {
      const { threadEmail, count } = action.payload;
      state.loading = false;
      state.threadEmail = threadEmail;
      state.error = null;
      state.message = null;
      state.count = count
    },
    getThreadEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
      state.count = 0
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessage(state) {
      state.message = null;
    },
  },
});

export const getThreadEmail = (email, threadId) => {
  return async (dispatch, getState) => {
    dispatch(threadEmailSlice.actions.getThreadEmailRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=view_thread&thread_id=${threadId}&email=${email}&page=1&page_size=50`
      );
      showConsole && console.log(`threadEmail`, data);
      dispatch(
        threadEmailSlice.actions.getThreadEmailSucess({
          threadEmail: data.emails,
          count: data.total_emails ?? 0
        })
      );
      dispatch(threadEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        threadEmailSlice.actions.getThreadEmailFailed(
          "Fetching Thread Email  Failed"
        )
      );
    }
  };
};

export const threadEmailAction = threadEmailSlice.actions;
export default threadEmailSlice.reducer;
