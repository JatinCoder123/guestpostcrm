import { apiRequest } from "../services/api";
import { getCRM } from "../services/utils";

/**
 * Get all tags
 */
export const getMarkTags = async () => {
    const data = await apiRequest({ endpoint: `${getCRM()}?entryPoint=add_tag`, params: { get_tag: 1 } })

    return data;
};

/**
 * Apply tag to email
 */
export const applyTag = async ({
    email,
    tagId,
}) => {
    const { data } = await api.post(
        "/tags/apply",
        {
            email,
            tag_id: tagId,
        }
    );

    return data;
};