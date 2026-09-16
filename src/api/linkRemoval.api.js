import { http } from "../services/api";

export const getLinkRemovalById = async (id) =>
    http({
        method: "POST",
        body: {
            action: "fetch",
            module: "outr_link_queue",
            filters: {
                id,
            },
        },
    });