import axios from "axios";
let CRMENDPOINT = ""
export function setCrmEndpoint(endpoint) {
    CRMENDPOINT = endpoint
    return;
}
/**
 * Create Axios instance (you can change baseURL anytime)
 */
const apiClient = axios.create({
    baseURL: "", // optional: set your base URL here
    timeout: 15000,
});

/**
 * Generic API function (super flexible)
 */
export const apiRequest = async ({
    endpoint,
    method = "GET",
    body = null,
    headers = {},
    params = {},
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
        });

        return response.data;
    } catch (error) {
        console.error("API Error:", error?.response || error.message);

        throw error?.response?.data || {
            message: "Something went wrong",
        };
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
    try {
        const response = await apiClient({
            url: CRMENDPOINT,
            method,
            data: body,
            params,
            headers: {
                "Content-Type": "application/json",
                "X-Api-Key": "nmD5WeHdY8i4kTUK!.7_Fzp7}K@AAX1X", // 🔥 replace with env variable
                ...headers,
            },
        });

        return response.data;
    } catch (error) {
        console.error("GPC API Error:", error?.response || error.message);

        throw error?.response?.data || {
            message: "GPC request failed",
        };
    }
};