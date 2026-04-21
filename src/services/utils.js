import axios from "axios";
import { showConsole } from "../assets/assets";

export const ManualSideCall = async (
  entryPoint,
  email,
  description,
  match_no,
  okHandler,
) => {
  try {
    const { data } = await axios.post(`${entryPoint}&type=ledger_entry`, {
      email,
      description,
      match_no,
    });
    showConsole && console.log("manual side call", data);
    if (data == "ok") {
      okHandler();
    }
  } catch (error) {
    showConsole && console.log(error);
  }
};
export const updateActivity = async (
  entryPoint,
  email,
  last_user,
  last_user_email,
  last_activity,
) => {
  try {
    const { data } = await axios.post(`${entryPoint}&type=last_activity`, {
      email,
      last_activity,
      last_user,
      last_user_email,
    });
    showConsole && console.log("Activity Added", data);
  } catch (error) {
    showConsole && console.log(error);
  }
};
export const createLedgerEntry = async ({
  domain,
  email,
  thread_id,
  message_id,
  group = "General",
  items = [],
  okHandler,
}) => {
  try {
    const payload = {
      email,
      thread_id,
      message_id,
      group,
      item: items,
    };
    const { data } = await axios.post(
      `${domain}?entryPoint=fetch_gpc&type=make_ledger`,
      payload,
    );

    showConsole && console.log("Ledger Created", data);
    okHandler();
  } catch (error) {
    showConsole && console.log("Ledger API Failed", error);
  }
};

export const buildLedgerItem = ({
  status,
  detail,
  ladgerState,
  user,
  parent_name,
}) => ({
  status,
  detail,
  prompt_id: ladgerState.prompt_id || "",
  prompt_ledger_id: ladgerState.prompt_ledger_id || "",
  parent_id: ladgerState.parent_id || "",
  parent_name,
  template_id: ladgerState.template_id || "",
  assigned_user_id: user?.id || "",
});

export const applyHashtag = async ({
  domain,
  email,
  memo_no,
  method = "GET",
}) => {
  try {
    const { data } = await axios({
      method,
      url: `${domain}&type=hashtag&email=${email}&memo_no=${memo_no}`,
    });

    showConsole && console.log("Hashtag Applied", data);
    return data;
  } catch (error) {
    showConsole && console.log("Hashtag API Failed", error);
  }
};
