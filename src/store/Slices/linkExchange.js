import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const exchangeSlice = createSlice({
  name: "exchange",
  initialState: {
    loading: false,
    emails: [],
    message: null,
    exchanging: false,
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    marked: {}, // threadId: boolean (true if marked, false if unmarked)
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.emails = emails;
      // Update exchange map for fetched marked emails
      emails.forEach((email) => {
        state.marked[email.thread_id || email.id] = true;
      });
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    exchangingRequest(state) {
      state.exchanging = true;
      state.error = null;
      state.message = null;
    },
    exchangingSucess(state, action) {
      state.exchanging = false;
      state.error = null;
      state.message = action.payload;
    },
    exchangingFailed(state, action) {
      state.exchanging = false;
      state.error = action.payload;
      state.message = null;
    },
    setMarkedStatus(state, action) {
      const { id, status } = action.payload;
      state.marked[id] = status;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
  },
});

export const getLinkExchange = (email) => {
  return async (dispatch, getState) => {
    dispatch(exchangeSlice.actions.getEmailRequest());
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=exchange${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=exchange${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=1&page_size=50`
        );
      }
      console.log(`Exchange links data`, response.data);
      const data = response.data;
      dispatch(
        exchangeSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data ?? [],
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(exchangeSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(exchangeSlice.actions.getEmailFailed("Fetching Bulk Emails Failed"));
    }
  };
};

export const linkExchange = () => {  // Assuming 'id' is the email/contact identifier for the endpoint
  return async (dispatch, getState) => {
    dispatch(exchangeSlice.actions.exchangingRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const response = await axios.get(
        `${domain}?entryPoint=contactAction&email=${getState().ladger.email}&field=exchange`,
        {}
      );
      console.log(`Exchange Toggle Response`, response.data);
      const data = response.data;
      if (!data.success) {
        throw new Error("Toggle failed");
      }
      // Determine message based on new_value
      const message = data.new_value === 1 ? "Email link exchage Successfully" : "Email unlink Successfully";
      dispatch(
        exchangeSlice.actions.exchangingSucess(message)
      );

      dispatch(exchangeSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(exchangeSlice.actions.exchangingFailed(error.message));
    }
  };
};

export const linkExchangeaction = exchangeSlice.actions;
export default exchangeSlice.reducer;