import axios from "axios";
import { FETCH_GPC_X_API_KEY } from "../store/constants";
let CRMENDPOINT = "";
let DB_NAME = "";
export function setConfig(endpoint, db_name) {
  CRMENDPOINT = endpoint;
  DB_NAME = db_name;
  return;
}

const apiClient = axios.create({
  baseURL: "", // optional: set your base URL here
  // timeout: 15000,
});

export const apiRequest = async ({
  endpoint,
  method = "GET",
  body = null,
  headers = {},
  params = {},
  withCredentials = false,
}) => {
  const response = await apiClient({
    url: endpoint,
    method,
    data: body,
    headers,
    params: {
      db_name: DB_NAME,
      ...params,
    },
    withCredentials,
  });

  return response.data;
};

/**
 * Special API function for GPC (with default API key)
 */
export const fetchGpc = async ({
  method = "GET",
  body = null,
  params = {},
  headers = {},
}) => {
  const params1 = DB_NAME ? { ...params, db_name: DB_NAME } : params;
  const response = await apiClient({
    url: CRMENDPOINT,
    method,
    data: body,
    params: params1,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": FETCH_GPC_X_API_KEY, // 🔥 replace with env variable
      ...headers,
    },
  });

  return response.data;
};
