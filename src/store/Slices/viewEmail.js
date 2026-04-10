import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { showConsole } from "../../assets/assets";
import { updateActivity } from "../../services/utils";
import { getCache, setCache } from "../../services/cache";

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
      state.contactInfo = contactInfo ? { ...contactInfo } : null;
      state.accountInfo = accountInfo ? { ...accountInfo } : null;
      state.dealInfo = dealInfo ? { ...dealInfo } : null;
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
      state.editMessage = null;
      state.error = null;
    },
    editContactSucess(state, action) {
      state.contactLoading = false;
      state.editMessage = !action.payload.message ?? "Contact updated successfully";
      state.error = null;
    },
    editContactFailed(state, action) {
      state.contactLoading = false;
      state.editMessage = null;
      state.error = action.payload;
    },
    sendEmailRequest(state) {
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
      state.sendedEmail = sendedEmail
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
      state.sendedEmail = action.payload.sendedEmail
    },
    clearAllMessage(state) {
      state.message = null;
      state.sendedEmail = null
      state.editMessage = null
    },
    clearFailedResponse(state) {
      state.sendFailedResponse = null
    },

    updateContactInfo(state, action) {
      const { key } = action.payload;
      state.contactInfo[key] = state.contactInfo[key] === "1" ? "0" : "1";
    },
  },
});

export const getViewEmail = ({
  email = null,
  force = false
}) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getViewEmailRequest());

    try {
      const trimmedEmail = email?.trim();

      if (!force) {
        const cachedData = getCache("viewMails", trimmedEmail);

        if (cachedData) {
          dispatch(
            viewEmailSlice.actions.getViewEmailSucess({
              viewEmail: cachedData.emails,
              threadId: cachedData.threadId,
              count: cachedData.count,
            })
          );
        }
      }

      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=view_email&email=${trimmedEmail}`
      );

      const freshData = {
        emails: data.emails,
        threadId: data.thread_id,
        count: data.total_emails,
      };

      setCache("viewMails", trimmedEmail, freshData);

      dispatch(
        viewEmailSlice.actions.getViewEmailSucess({
          viewEmail: freshData.emails,
          threadId: freshData.threadId,
          count: freshData.count,
        })
      );

      // PREFETCH NEXT / PREV
      const index = localStorage.getItem("currentIndex") && Number(localStorage.getItem("currentIndex"))
      if (index !== null) {
        const unreplied = getState().unreplied;

        const nextEmail =
          index + 1 < unreplied.count
            ? unreplied.emails[index + 1]?.email1
            : null;

        const prevEmail =
          index > 0
            ? unreplied.emails[index - 1]?.email1
            : null;

        [nextEmail, prevEmail].forEach(async (prefetchEmail) => {
          if (
            prefetchEmail &&
            !getCache("viewMails", prefetchEmail.trim())
          ) {
            try {
              const { data } = await axios.get(
                `${getState().user.crmEndpoint}&type=view_email&email=${prefetchEmail.trim()}`
              );

              setCache("viewMails", prefetchEmail.trim(), {
                emails: data.emails,
                threadId: data.thread_id,
                count: data.total_emails,
              });
            } catch (err) {
              console.error("Prefetch ViewEmail Failed", err);
            }
          }
        });
      }

      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getViewEmailFailed(
          "Fetching View Emails Failed"
        )
      );
    }
  };
};
export const getContact = (email = null, force = false) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.getContactRequest());

    try {
      const trimmedEmail = email?.trim();

      if (!force) {
        const cachedData = getCache("contacts", trimmedEmail);

        if (cachedData) {
          dispatch(
            viewEmailSlice.actions.getContactSucess(cachedData)
          );
        }
      }

      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=get_contact&email=${trimmedEmail}`
      );

      const freshData = {
        stage: data.stage,
        status: data.status,
        contactInfo: data.contact ?? null,
        accountInfo: data.account ?? null,
        customer_type: data.customer_type ?? null,
        dealInfo: data.deal_fetch ?? null,
      };

      setCache("contacts", trimmedEmail, freshData);

      dispatch(
        viewEmailSlice.actions.getContactSucess(freshData)
      );

      // PREFETCH NEXT / PREV
      const index = localStorage.getItem("currentIndex") && Number(localStorage.getItem("currentIndex"))

      if (index !== null) {
        const unreplied = getState().unreplied;

        const nextEmail =
          index + 1 < unreplied.count
            ? unreplied.emails[index + 1]?.email1
            : null;

        const prevEmail =
          index > 0
            ? unreplied.emails[index - 1]?.email1
            : null;

        [nextEmail, prevEmail].forEach(async (prefetchEmail) => {
          if (
            prefetchEmail &&
            !getCache("contacts", prefetchEmail.trim())
          ) {
            try {
              const { data } = await axios.get(
                `${getState().user.crmEndpoint}&type=get_contact&email=${prefetchEmail.trim()}`
              );

              setCache("contacts", prefetchEmail.trim(), {
                stage: data.stage,
                status: data.status,
                contactInfo: data.contact ?? null,
                accountInfo: data.account ?? null,
                customer_type: data.customer_type ?? null,
                dealInfo: data.deal_fetch ?? null,
              });
            } catch (err) {
              console.error("Prefetch Contact Failed", err);
            }
          }
        });
      }

      dispatch(viewEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.getContactFailed(
          "Fetching View Details failed"
        )
      );
    }
  };
};
export const editContact = (contactData, message = "") => {
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
        module: "Contacts",
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
      dispatch(viewEmailSlice.actions.editContactSucess({ message }));
      dispatch(viewEmailSlice.actions.clearAllErrors());
      dispatch(getContact(contactData?.email1));
    } catch (error) {
      dispatch(
        viewEmailSlice.actions.editContactFailed("Update Contact failed"),
      );
    }
  };
};

export const sendEmail = (
  formData,
) => {
  return async (dispatch, getState) => {
    dispatch(viewEmailSlice.actions.sendEmailRequest());
    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=thread_reply`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      showConsole && console.log("Reply Data", data);
      if (!data.success && data.response) {
        dispatch(viewEmailSlice.actions.sendEmailWrong({ response: data.response }))
        return
      }
      if (!data.success) {
        throw Error("Error While Sending Email")
      }

      dispatch(
        viewEmailSlice.actions.sendEmailSucess({
          message: `Reply Successfully Sent To ${formData.get("email")}`,
          sendedEmail: formData.get("email")
        }),
      );

      dispatch(viewEmailSlice.actions.clearAllErrors());
      localStorage.getItem("addActivity") && updateActivity(getState().user.crmEndpoint, formData.email, getState().user.user.name, getState().user.user.email, "Email Sent")
      dispatch(getViewEmail());
    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        viewEmailSlice.actions.sendEmailFailed("Error while sending email"),
      );
    }
  };
};

export const viewEmailAction = viewEmailSlice.actions;
export default viewEmailSlice.reducer;
