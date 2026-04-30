import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { updateActivity, createLedgerEntry, buildLedgerItem } from "../../services/utils";
import { apiRequest } from "../../services/api";

const exchangeSlice = createSlice({
  name: "linkExchange",
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
      if (pageIndex === 1) {
        state.emails = emails;
      } else {
        state.emails = [...state.emails, ...emails];
      }
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

export const getLinkExchange = () => {
  return async (dispatch, getState) => {
    dispatch(exchangeSlice.actions.getEmailRequest());
    try {

      const data = await fetchGpc({ params: { type: "exchange", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), page: 1, page_size: 50 } });
      showConsole && console.log(`Exchange links data`, data);
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
      const data = await apiRequest({ endpoint: `${domain}?entryPoint=contactAction`, params: { email: getState().viewEmail.contactInfo?.email1, field: 'exchange' } }
      );
      showConsole && console.log(`Exchange Toggle Response`, data);
      if (!data.success) {
        throw new Error("Toggle failed");
      }
      const message = data.new_value === 1 ? "Email link exchage Successfully" : "Email unlink Successfully";
      dispatch(
        exchangeSlice.actions.exchangingSucess(message)
      );

      dispatch(exchangeSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, data.new_value === 1 ? "Email link exchange " : "Email unlink ")
      await createLedgerEntry({
        domain: domain,
        email: getState().ladger.email,
        group: "Activity",
        items: [
          buildLedgerItem({
            status: data.new_value === 1 ? "Mark-Link-Exchange" : "Unmark-Link-Exchange",
            detail: `email: {${getState().ladger.email}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
      });

    } catch (error) {
      dispatch(exchangeSlice.actions.exchangingFailed(error.message));
    }
  };
};

export const linkExchangeaction = exchangeSlice.actions;
export default exchangeSlice.reducer;