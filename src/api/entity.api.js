import axios from "axios";
import { fetchGpc, http } from "../services/api";

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export async function fetchList(entity, params) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.get(endpoint, { params });
    return data;
}

export async function fetchOne({ request, entity, recordInfo }) {
    if (
        request.endpoint.toLowerCase() === "smartgateway"
    ) {
        const data = http({
            method: "POST",
            body: {
                action: "fetch",
                module: entity,
                filters: {
                    ...recordInfo
                }
            },
        });
        return data?.records || [];
    }

    /*
     * ------------------------------------------------------------
     * FETCH GPC
     * ------------------------------------------------------------
     */

    if (
        request.endpoint.toLowerCase() === "fetchgpc"
    ) {
        return fetchGpc({
            method: "GET",
            params: { ...request.params || {}, ...recordInfo || {} },
        });
    }
    throw new Error(
        `Unsupported action endpoint: ${request.endpoint}`
    );
}

export async function createOne(entity, payload) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.post(endpoint, payload);
    return data;
}

export async function updateOne(entity, id, payload) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.patch(`${endpoint}/${id}`, payload);
    return data;
}

export async function deleteOne(entity, id) {
    const { endpoint } = getEntityConfig(entity);
    await client.delete(`${endpoint}/${id}`);
}