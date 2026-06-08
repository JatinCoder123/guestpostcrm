import axios from "axios";
import { FETCH_GPC_X_API_KEY } from "../store/constants";

let CRMENDPOINT = "";
let DB_NAME = "";

export function setConfig(endpoint, db_name) {
  CRMENDPOINT = endpoint;
  DB_NAME = db_name;
}

const apiClient = axios.create({
  baseURL: "",
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

export const fetchGpc = async ({
  method = "GET",
  body = null,
  params = {},
  headers = {},
}) => {
  const params1 = DB_NAME ? { ...params, db_name: DB_NAME } : params;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
  const requestHeaders = {
    "X-Api-Key": FETCH_GPC_X_API_KEY,
    ...headers,
  };

  if (!isFormData && !requestHeaders["Content-Type"]) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const response = await apiClient({
    url: CRMENDPOINT,
    method,
    data: body,
    params: params1,
    headers: requestHeaders,
  });

  return response.data;
};
