import axios from "axios";
import { FETCH_GPC_X_API_KEY } from "../store/constants";
import {store} from "../store/store";

let CRMENDPOINT = "";
let DB_NAME = "";
let USER_EMAIL = "";
const getCurrentUserId = () => store.getState()?.crmUser?.currentUser?.id;


export function setConfig(endpoint, db_name, dash_user_email) {
  CRMENDPOINT = endpoint;
  DB_NAME = db_name;
  USER_EMAIL = dash_user_email;
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
  console.log(`Current User ID: ${getCurrentUserId()}`);
  const params1 = {
    ...params,
    ...(DB_NAME ? { db_name: DB_NAME } : {}),
    ...(USER_EMAIL ? { dash_user_email: USER_EMAIL } : {}),
  };
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
