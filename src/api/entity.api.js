import axios from "axios";
import { http } from "../services/api";

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export async function fetchList(entity, params) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.get(endpoint, { params });
    return data;
}

export async function fetchOne(entity, id) {
    // const { endpoint } = getEntityConfig(entity);
    const data = await http({
        method: "POST", body: {
            filters: { id }, "action": "fetch",
            "module": "Contacts",
        }
    });
    return data?.records?.[0];
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