import { apiRequest, http } from "../services/api";

const METADATA_ENDPOINT = "https://gagan.guestpostcrm.com/index.php";

/**
 * Read the sidebar layout, groups and modules in rank order.
 *
 * Goes through `apiRequest` rather than a bare axios.get for
 * two reasons that both matter now that a reorder reads the new
 * order straight back:
 *
 *   1. `apiRequest` appends `db_name` and `dash_user_email`.
 *      Writes already send `db_name`, so a read without it can
 *      answer from a different database than the one just
 *      written to, and the new order would never show up.
 *
 *   2. This is a plain GET, so the browser is free to serve it
 *      from its HTTP cache. A cached response would hand back
 *      the pre-move order and quietly undo the reorder on
 *      screen. `_` busts that per request.
 */
export const fetchLayout = async () => {
  const data = await apiRequest({
    endpoint: METADATA_ENDPOINT,
    params: {
      entryPoint: "flexibility",
      global_component_name: "Sidebar",
      _: Date.now(),
    },
  });

  return data ?? {};
};
export const updateLayout = async ({ module, id, payload }) => {
  const response = await http({
    endpoint: METADATA_ENDPOINT,
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
