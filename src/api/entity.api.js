import axios from "axios";

const client = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL });

export async function fetchList(entity, params) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.get(endpoint, { params });
    return data;
}

export async function fetchOne(entity, id) {
    const { endpoint } = getEntityConfig(entity);
    const { data } = await client.get(`${endpoint}/${id}`);
    return data;
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