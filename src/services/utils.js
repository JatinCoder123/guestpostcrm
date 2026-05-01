import { showConsole } from "../assets/assets";
import { fetchGpc } from "./api";


export const updateActivity = async (
  entryPoint,
  email,
  last_user,
  last_user_email,
  last_activity,
) => {
  try {
    const data = await fetchGpc({
      method: "POST", params: { type: "last_activity" }, body: {
        email,
        last_activity,
        last_user,
        last_user_email,
      }
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
    const data = await fetchGpc({ method: "POST", body: payload, params: { type: "make_ledger" } });

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
    const { data } = await fetchGpc({
      method,
      params: { type: "hashtag", email, memo_no: memo_no },
    });

    showConsole && console.log("Hashtag Applied", data);
    return data;
  } catch (error) {
    showConsole && console.log("Hashtag API Failed", error);
  }
};
