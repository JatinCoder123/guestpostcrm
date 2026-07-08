import { createSlice } from "@reduxjs/toolkit";
import { CREATE_DEAL_API_KEY } from "../constants";
import { getDomain, showConsole } from "../../assets/assets";
import { updateActivity } from "../../services/utils";
import { getCache, setCache } from "../../services/cache";
import { brandTimelineAction } from "./brandTimeline";
import { apiRequest, fetchGpc } from "../../services/api";
import { queryClient } from "../../lib/queryClient";
import { contactKeys } from "../../queries/contact.queries";
import { emailKeys } from "../../queries/email.queries";

const viewEmailSlice = createSlice({
  name: "viewEmail",
  initialState: {
    loading: false,
    contactLoading: false,
    count: 0,
    stage: null,
    status: null,
    viewEmail: [],
    contactInfo: null,
    customer_type: null,
    accountInfo: null,
    sendedEmail: null,
    sending: false,
    dealInfo: null,
    threadId: null,
    message: null,
    sendFailedResponse: null,
    editMessage: null,
    hashtags: [],
    error: null,
  },
  reducers: {
    getViewEmailRequest(state) {
      state.loading = true;
      state.viewEmail = [];
      state.threadId = null;
      state.error = null;
    },
    getViewEmailSucess(state, action) {
      const { viewEmail, threadId, count } = action.payload;
      state.loading = false;
      state.viewEmail = viewEmail;
      state.threadId = threadId;
      state.count = count;
      state.error = null;
    },
    getViewEmailFailed(state, action) {
      state.loading = false;
      state.viewEmail = [];
      state.error = action.payload;
    },
    editContactRequest(state) {
      state.contactLoading = true;
      state.editMessage = null;
      state.error = null;
    },
    editContactSucess(state, action) {
      state.contactLoading = false;
      state.editMessage =
        !action.payload.message ?? "Contact updated successfully";
      state.error = null;
    },
    editContactFailed(state, action) {
      state.contactLoading = false;
      state.editMessage = null;
      state.error = action.payload;
    },
    sendEmailRequest(state, action) {
      state.sending = true;
      state.message = null;
      state.error = null;
      state.sendFailedResponse = null;
    },
    sendEmailWrong(state, action) {
      const { response } = action.payload;
      state.sending = false;
      state.sendFailedResponse = response;
    },
    sendEmailSucess(state, action) {
      const { message, sendedEmail } = action.payload;
      state.sending = false;
      state.message = message;
      // state.sendedEmail = sendedEmail;
      state.error = null;
    },
    sendEmailFailed(state, action) {
      state.sending = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    compleConv(state, action) {
      state.message = action.payload.message;
      state.sendedEmail = action.payload.sendedEmail;
    },
    clearAllMessage(state) {
      state.message = null;
      state.sendedEmail = null;
      state.editMessage = null;
    },
    clearFailedResponse(state) {
      state.sendFailedResponse = null;
    },

    updateContactInfo(state, action) {
      const { key } = action.payload;
      state.contactInfo[key] = state.contactInfo[key] === "1" ? "0" : "1";
    },
    toggleHastage(state, action) {
      const { memo_no, name } = action.payload;
      state.hashtags = state.hashtags.find((tag) => tag.memo_no === memo_no)
        ? state.hashtags.filter((tag) => tag.memo_no !== memo_no)
        : [...state.hashtags, { memo_no, type: "static", name }];
    },
  },
});



export const editContact = (contactData, message = "") => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.editContactRequest());

    showConsole && console.log("contactData", contactData);
    try {
      // Base payload (always send parent_bean)
      const payload = {
        parent_bean: {
          module: "Contacts",
          ...contactData?.contact,
        },
        ...(Object.keys(contactData?.account ?? {}).length > 0 && {
          child_bean: {
            module: "Contacts",
            ...contactData?.account,
          },
        }),
      };
      const data = await apiRequest({
        method: "POST", body: payload, endpoint: getState().user.crmEndpoint.split('?')[0], params: { entryPoint: 'get_post_all', action_type: 'post_data' }, headers: {
          "X-Api-Key": CREATE_DEAL_API_KEY,
          "Content-Type": "application/json", // typo fixed
        },
      });

      showConsole && console.log("contact", data);
      dispatch(viewEmailSlice.actions.editContactSucess({ message }));
      dispatch(viewEmailSlice.actions.clearAllErrors());
      queryClient.invalidateQueries({ queryKey: contactKeys.all })
      queryClient.invalidateQueries({ queryKey: emailKeys.all })
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.editContactFailed("Update Contact failed"),
      );
    }
  };
};

export const sendEmail = (formData) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.sendEmailRequest());
    try {
      const data = await fetchGpc({ method: "POST", body: formData, headers: { "Content-Type": "multipart/form-data" }, params: { type: "thread_reply" } })
      showConsole && console.log("Reply Data", data);
      if (!data.success && data.response) {
        throw Error("Detect Outbound Message.");
      }
      if (!data.success) {
        throw Error("Error While Sending Email");
      }

      dispatch(
        viewEmailSlice.actions.sendEmailSucess({
          message: `Reply Successfully Sent To ${formData.get("email")}`,
          // sendedEmail: formData.get("email"),
        }),
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
      localStorage.getItem("addActivity") &&
        updateActivity(
          formData.get("email"),
          "Email Sent",
        );
    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        viewEmailSlice.actions.sendEmailFailed(error.message),
      );
    }
  };
};

export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
