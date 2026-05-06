import axios from "axios";
import { FETCH_GPC_X_API_KEY } from "../store/constants";
let CRMENDPOINT = "";
export function setCrmEndpoint(endpoint) {
  CRMENDPOINT = endpoint;
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
  try {
    const response = await apiClient({
      url: endpoint,
      method,
      data: body,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      params,
      withCredentials,
    });

    return response.data;
  } catch (error) {
    console.error("API Error:", error?.response || error.message);

    throw (
      error?.response?.data || {
        message: "Something went wrong",
      }
    );
  }
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
  const response = await apiClient({
    url: CRMENDPOINT,
    method,
    data: body,
    params,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": FETCH_GPC_X_API_KEY, // 🔥 replace with env variable
      ...headers,
    },
  });

  return response.data;
};
