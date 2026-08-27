import axios from "axios";
import { http } from "../services/api";

export const fetchLayout = async () => {
  const data = await axios.get(
    "https://gagan.guestpostcrm.com/index.php?entryPoint=flexibility&global_component_name=Sidebar",
  );
  if (data?.status) return data.data;
  return {};
};
export const updateLayout = async ({ module, id, payload }) => {
  const response = await http({
    endpoint: "https://gagan.guestpostcrm.com/index.php",
    method: "POST",
    body: {
      action: "update",
      module: module,
      id: id,
      data: payload,
    },
  });

  /**
   * smart_gateway answers 200 even when the update did not
   * happen, so the status code alone means nothing.
   *
   * A successful update returns:
   *
   *     { success: true, action, module, id }
   *
   * A rejected one returns { success: false, error, code }.
   * And if the handler dies part way through - which is what
   * outr_ui_modules currently does - the body is empty, which
   * would otherwise sail through as a silent no-op.
   */
  if (!response || response.success !== true) {
    const reason =
      response?.error ||
      (response
        ? "unexpected response from smart_gateway"
        : `no response body, the ${module} update handler did not complete`);

    throw new Error(`Layout update failed for ${module}/${id}: ${reason}`);
  }

  return response;
};
