import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { apiRequest, fetchGpc } from "../../services/api";
import { CREATE_DEAL_API_KEY } from "../constants";
import { getLadger } from "./ladger";
import { buildLedgerItem, createLedgerEntry } from "../../services/utils";

const orderRemSlice = createSlice({
  name: "reminders",
  initialState: {
    loading: false,
    reminders: [],
    dropdownOptions: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    sending: false,
    summary: {},
    sendReminderId: null,
    message: null,
  },
  reducers: {
    getOrderRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrderRemSucess(state, action) {
      const { count, reminders, pageCount, pageIndex, dropdownOptions, summary } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.reminders = reminders;
      } else {
        state.reminders = [...state.reminders, ...reminders];
      }
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.summary = summary;
      state.dropdownOptions = dropdownOptions;
      state.error = null;
    },
    getOrderRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    sendReminderRequest(state, action) {
      state.sending = true;
      state.sendReminderId = action.payload

    },

    sendReminderSuccess(state, action) {
      state.sending = false;
      state.message = action.payload

    },
    sendReminderFailed(state, action) {
      state.sending = false;
      state.error = action.payload


    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessage(state) {
      state.message = null;
    },
  },
});

export const sendReminder = (reminderId) => {
  return async (dispatch, getState) => {
    dispatch(orderRemSlice.actions.sendReminderRequest(reminderId));

    try {
      const data = await fetchGpc({ params: { type: "send_reminder", reminder_id: reminderId } });
      showConsole && console.log(`Send Reminders`, data);
      if (data?.success) {
        dispatch(
          orderRemSlice.actions.sendReminderSuccess("Reminder Sent Successfully.")
        );
        dispatch(orderRemSlice.actions.clearAllErrors());
      }
      else {
        throw new Error("Failed To send Reminder")
      }

    } catch (error) {
      dispatch(
        orderRemSlice.actions.sendReminderFailed("Failed To Send Reminder")
      );
    }
  };
};
export const cancelReminder = ({ email, reminderId }) => {
  return async (dispatch, getState) => {
    dispatch(orderRemSlice.actions.sendReminderRequest(reminderId));

    try {
      const data = await apiRequest({
        endpoint: `${getState().user.crmEndpoint.split("?")[0]}?entryPoint=get_post_all`, params: { action_type: "post_data" }, body: {
          parent_bean: {
            "module": "outr_snts",
            "id": reminderId,
            "status": "cancel"
          }
        },
        method: "POST",
        headers: {
          "x-api-key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json",
        },
      });
      showConsole && console.log(`Send Reminders`, data);
      dispatch(
        orderRemSlice.actions.sendReminderSuccess("Reminder Cancel Successfully.")
      );

      dispatch(orderRemSlice.actions.clearAllErrors());
      await createLedgerEntry({
        domain: getState().user.crmEndpoint.split("?")[0],
        email: email,
        group: "Reminder",
        items: [
          buildLedgerItem({
            status: "Cancel Reminder",
            detail: `Reminder Id ${reminderId}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
        okHandler: () => dispatch(getLadger({ email: getState().ladger.email })),
      });


    } catch (error) {
      dispatch(
        orderRemSlice.actions.sendReminderFailed("Failed To Cancel Reminder")
      );
    }
  };
};
export const getOrderRem = ({ email = null, page = 1 }) => {
  return async (dispatch, getState) => {
    dispatch(orderRemSlice.actions.getOrderRemRequest());

    try {
      const timeline = getState().ladger.timeline
      const data = await fetchGpc({ params: { type: "all_reminders", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), email: email, page } });
      showConsole && console.log(`Reminders`, data);
      dispatch(
        orderRemSlice.actions.getOrderRemSucess({
          count: data.data_count ?? 0,
          reminders: data.data,
          dropdownOptions: Object.keys(data.reminder_type_list).map((key) => (
            {

              value: key,
              label: data.reminder_type_list[key],
            })).filter((key) => key.value.trim()),
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          summary: data.summary,
        })
      );
      dispatch(orderRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        orderRemSlice.actions.getOrderRemFailed("Fetching  Reminders  Failed")
      );
    }
  };
};

export const orderRemAction = orderRemSlice.actions;
export default orderRemSlice.reducer;
