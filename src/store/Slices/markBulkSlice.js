import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const bulkSlice = createSlice({
  name: "bulk",
  initialState: {
    loading: false,
    emails: [],
    message: null,
    marking: false,
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
      // Update marked map for fetched marked emails
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
    markingRequest(state) {
      state.marking = true;
      state.error = null;
      state.message = null;
    },
    markingSucess(state, action) {
      state.marking = false;
      state.error = null;
      state.message = action.payload;
    },
    markingFailed(state, action) {
      state.marking = false;
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

export const getBulkEmails = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(bulkSlice.actions.getEmailRequest());
    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=bulk&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=bulk&filter=${filter}&page=1&page_size=50`
        );
      }
      console.log(`Bulk emails`, response.data);
      const data = response.data;
      dispatch(
        bulkSlice.actions.getEmailSucess({
          count: data.data_count ?? 0,
          emails: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(bulkSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(bulkSlice.actions.getEmailFailed("Fetching Bulk Emails Failed"));
    }
  };
};

export const markingEmail = () => {  // Assuming 'id' is the email/contact identifier for the endpoint
  return async (dispatch, getState) => {
    dispatch(bulkSlice.actions.markingRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      const response = await axios.get(
        `${domain}?entryPoint=contactAction&email=${getState().ladger.email}&field=bulk`,
        {}
      );
      console.log(`Mark Toggle Response`, response.data);
      const data = response.data;
      if (!data.success) {
        throw new Error("Toggle failed");
      }
      // Determine message based on new_value
      const message = data.new_value === 1 ? "Email Marked Successfully" : "Email Unmarked Successfully";
      dispatch(
        bulkSlice.actions.markingSucess(message)
      );
      
      dispatch(bulkSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(bulkSlice.actions.markingFailed(error.message));
    }
  };
};

export const bulkAction = bulkSlice.actions;
export default bulkSlice.reducer;