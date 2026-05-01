import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";

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
    sendReminderId: null,
    message: null,
  },
  reducers: {
    getOrderRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrderRemSucess(state, action) {
      const { count, reminders, pageCount, pageIndex, dropdownOptions } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.reminders = reminders;
      } else {
        state.reminders = [...state.reminders, ...reminders];
      }
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
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
export const getOrderRem = (email, page) => {
  return async (dispatch, getState) => {
    dispatch(orderRemSlice.actions.getOrderRemRequest());

    try {
      const timeline = getState().ladger.timeline
      const data = await fetchGpc({ params: { type: "all_reminders", ...(timeline && timeline !== "null" ? { filter: timeline } : {}), email, page } });
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
