import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../constants";

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
          }&type=mark_bulk&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=mark_bulk&filter=${filter}&page=1&page_size=50`
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
export const markingEmail = (id) => {
  return async (dispatch, getState) => {
    dispatch(bulkSlice.actions.markingRequest());

    try {
      const response = await axios.post(
        `${MODULE_URL}&action_type=get_data`,
        {
          module: "outr_self_test",
          where: {
            thread_id: id,
            name: "mark_bulk",
          },
        },
        {
          headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Bulk Cheking `, response.data);
      const data = response.data;
      if (!data.success) {
        throw Error("Already Marked! ");
      } else {
        const response = await axios.post(
          `${MODULE_URL}&action_type=post_data`,
          {
            parent_bean: {
              module: "outr_self_test",
              thread_id: id,
              name: "mark_bulk",
            },
          },
          {
            headers: {
              "x-api-key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "application/json",
            },
          }
        );
        console.log("Response While Marking ", response.data);
        dispatch(
          bulkSlice.actions.markingSucess("Email Mark Bulk Successfully")
        );
        dispatch(bulkSlice.actions.clearAllErrors());
      }
    } catch (error) {
      dispatch(bulkSlice.actions.markingFailed(error.message));
    }
  };
};
export const bulkAction = bulkSlice.actions;
export default bulkSlice.reducer;
