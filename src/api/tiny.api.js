import { apiRequest } from "../services/api";
import { getCRM } from "../services/utils";

/**
 * Get all tags
 */
export const getMarkTags = async () => {
    const data = await apiRequest({ endpoint: `${getCRM()}?entryPoint=add_tag`, params: { get_tag: 1 } })

    return data;
};
