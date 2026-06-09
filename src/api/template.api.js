import { apiRequest } from "../services/api";
import { CREATE_DEAL_API_KEY } from "../store/constants";
import { store } from "../store/store";
const getCRM = () =>
    store.getState()
        .user?.crmEndpoint
        ?.split("?")[0];
/**
 * Get All Templates
 */
export const getTemplates =
    async () => {
        const { data } =
            await api.get(
                "/templates"
            );

        return data;
    };

/**
 * Get Templates By Stage
 */
export const getTemplatesByStage =
    async (stage) => {
        const { data } =
            await api.get(
                `/templates/stage/${stage}`
            );

        return data;
    };

/**
 * Get Template By Id
 */
export const getTemplateById =
    async (id) => {
        const { data } =
            await api.get(
                `/templates/${id}`
            );

        return data;
    };

/**
 * Get Template By Name
 */
export const getTemplateByName =
    async (name) => {
        const data = await apiRequest({
            endpoint: `${getCRM()}?entryPoint=get_post_all&action_type=get_data`,
            method: "POST",
            headers: {
                "x-api-key": CREATE_DEAL_API_KEY,
                "Content-Type": "application/json",
            },
            body: {
                module: "EmailTemplates",
                where: { name: name },
            },
        });
        return data;
    };