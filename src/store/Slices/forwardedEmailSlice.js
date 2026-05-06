import { createSlice, current } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { updateActivity, createLedgerEntry, buildLedgerItem } from "../../services/utils";
import { getLadger } from "./ladger";
import { fetchGpc } from "../../services/api";

const forwardedSlice = createSlice({
  name: "forwarded",
  initialState: {
    loading: false,
    forward: false,
    emails: [],
    count: 0,
    error: null,
    message: null,
    pageIndex: 1,
    pageCount: 1
  },
  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getEmailSucess(state, action) {
      const { count, emails } = action.payload;
      state.loading = false;
      state.emails = emails;
      state.count = count;
      state.error = null;
    },
    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    forwardEmailRequest(state) {
      state.forward = true;
      state.error = null;
      state.message = null;
    },
    forwardEmailSucess(state, action) {
      state.forward = false;
      state.error = null;
      state.message = action.payload;
    },
    forwardEmailFailed(state, action) {
      state.forward = false;
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

export const getForwardedEmails = ({ loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(forwardedSlice.actions.getEmailRequest());
    }

    try {
      const data = await fetchGpc({ params: { type: 'forwarded', current_email: getState().user.user.email } });
      showConsole && console.log(`forwarded emails`, data);
      dispatch(
        forwardedSlice.actions.getEmailSucess({
          count: data?.length ?? 0,
          emails: data,
        })
      );
      dispatch(forwardedSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        forwardedSlice.actions.getEmailFailed(
          "Fetching Forwarded Emails Failed"
        )
      );
    }
  };
};

export const forwardEmail = (email, id) => {
  return async (dispatch, getState) => {
    dispatch(forwardedSlice.actions.forwardEmailRequest());
    showConsole && console.log("CLIENT EMAIL", email)
    showConsole && console.log("CLIENT ID", id)

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const data = await fetchGpc({
        params: { type: 'assigned_task' }, body: {
          "client_email": email,
          "current_email": getState().user.user.email,
          "assigned_to": id,
        },
        method: "POST"
      }
      );
      showConsole && console.log("Assiging  ", data);
      dispatch(
        forwardedSlice.actions.forwardEmailSucess(
          "Email Forwarded Successfully"
        )
      );
      dispatch(forwardedSlice.actions.clearAllErrors());

      updateActivity(getState().ladger.email, "Email Assign")

      await createLedgerEntry({
        domain: domain,
        email: getState().ladger.email,
        group: "Activity",
        items: [
          buildLedgerItem({
            status: "Forward-To",
            detail: `email: {${getState().ladger.email}} name: {${email}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
        okHandler: () => dispatch(getLadger({ email: getState().ladger.email })),
      });

    } catch (error) {
      dispatch(forwardedSlice.actions.forwardEmailFailed(error.message));
    }
  };
};

export const forwardedAction = forwardedSlice.actions;
export default forwardedSlice.reducer;