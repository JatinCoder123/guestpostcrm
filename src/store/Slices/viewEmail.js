import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { showConsole } from "../../assets/assets";

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
    sending: false,
    dealInfo: null,
    threadId: null,
    message: null,
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
    getContactRequest(state) {
      state.contactLoading = true;
      state.stage = null;
      state.status = null;
      state.contactInfo = null;
      state.accountInfo = null;
      state.dealInfo = null;
      state.error = null;
    },
    getContactSucess(state, action) {
      const {
        contactInfo,
        accountInfo,
        dealInfo,
        stage,
        status,
        customer_type,
      } = action.payload;
      state.contactLoading = false;
      state.stage = stage;
      state.status = status;
      state.customer_type = customer_type;
      state.contactInfo = contactInfo;
      state.accountInfo = accountInfo;
      state.dealInfo = dealInfo;
      state.error = null;
    },
    getContactFailed(state, action) {
      state.contactLoading = false;
      state.stage = null;
      state.status = null;
      state.contactInfo = null;
      state.accountInfo = null;
      state.dealInfo = null;
      state.error = action.payload;
    },
    editContactRequest(state) {
      state.contactLoading = true;
      state.message = null;
      state.error = null;
    },
    editContactSucess(state, action) {
      state.contactLoading = false;
      state.message = "Contact updated successfully";
      state.error = null;
    },
    editContactFailed(state, action) {
      state.contactLoading = false;
      state.message = null;
      state.error = action.payload;
    },
    sendEmailRequest(state) {
      state.sending = true;
      state.message = null;
      state.error = null;
    },
    sendEmailSucess(state, action) {
      const { message } = action.payload;
      state.sending = false;
      state.message = message;
      state.error = null;
    },
    sendEmailFailed(state, action) {
      state.sending = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessage(state) {
      state.message = null;
    },
    resetViewEmail(state) {
      state.viewEmail = null;
      state.threadId = null;
      state.count = null;
      state.accountInfo = null;
      state.contactInfo = null;
      state.dealInfo = null;
      state.stage = null;
      state.status = null;
      state.customer_type = null;
    },
  },
});

export const getViewEmail = (email = null) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getViewEmailRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=view_email&email=${email ?? getState().ladger.email
        }`,
      );
      showConsole && console.log(`viewEmail`, data);
      dispatch(
        viewEmailSlice.actions.getViewEmailSucess({
          viewEmail: data.emails,
          threadId: data.thread_id,
          count: data.total_emails,
        }),
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getViewEmailFailed(
          "Fetching View Emails  Failed",
        ),
      );
    }
  };
};
export const getContact = (email = null) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getContactRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=get_contact&email=${email ?? getState().ladger.email}&page=1&page_size=50`,
      );
      showConsole && console.log(`Get contact`, data);
      dispatch(
        viewEmailSlice.actions.getContactSucess({
          stage: data.stage,
          status: data.status,
          contactInfo: data.contact ?? null,
          accountInfo: data.account ?? null,
          customer_type: data.customer_type ?? null,
          dealInfo: data.deal_fetch ?? null,
        }),
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getContactFailed("Fetching View Details failed"),
      );
    }
  };
};
export const editContact = (contactData) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.editContactRequest());

    showConsole && console.log("contactData", contactData);

    const domain = getState().user.crmEndpoint.split("?")[0];

    try {
      // Base payload (always send parent_bean)
      const payload = {
        parent_bean: {
          module: "Contacts",
          ...contactData.contact,
        },
      };

      payload.child_bean = {
        module: "Accounts",
        ...contactData.account,
      };

      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        payload,
        {
          headers: {
            "X-Api-Key": CREATE_DEAL_API_KEY,
            "Content-Type": "application/json", // typo fixed
          },
        },
      );

      showConsole && console.log("contact", data);
      dispatch(viewEmailSlice.actions.editContactSucess());
      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.editContactFailed("Update Contact failed"),
      );
    }
  };
};
export const sendEmail = (
  {
    reply,
    message = null,
    attachments = [],
    cc = [],
    bcc = [],
    email,
    threadId = null,
  }
) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.sendEmailRequest());

    try {
      const formData = new FormData();

      formData.append(
        "threadId",
        threadId
      );
      formData.append("replyBody", reply);
      formData.append("email", getState().ladger.email);
      formData.append(
        "current_email",
        getState().user.user.email
      );

      // ✅ ADD ONLY THESE TWO
      formData.append("cc", cc.join(","));
      formData.append("bcc", bcc.join(","));

      // existing attachments
      attachments.forEach((file) => {
        formData.append("attachments[]", file.file);
      });

      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=thread_reply`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      showConsole && console.log("Reply Data", data);

      dispatch(
        viewEmailSlice.actions.sendEmailSucess({
          message: message ?? data.message,
        })
      );
      dispatch(viewEmailSlice.actions.clearAllErrors());
      dispatch(getViewEmail());
    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        viewEmailSlice.actions.sendEmailFailed(
          "Error while sending email"
        )
      );
    }
  };
};


export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
