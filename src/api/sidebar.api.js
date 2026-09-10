import { http } from "../services/api";
import {
    getMetadataEndpoint,
    SIDEBAR_GROUP_MODULE,
    SIDEBAR_MODULE_MODULE,
} from "../utils/sidebarLayout";

/**
 * Sugar's name for the outr_ui_groups <-> outr_ui_modules relationship.
 * SmartGateway currently resolves the relationship from the two module names,
 * but sending the name keeps the request compatible with endpoints that honor
 * the documented relationship_name parameter.
 */
export const SIDEBAR_GROUP_MODULE_RELATIONSHIP =
    "outr_ui_groups_outr_ui_modules_1";

const requestGroupModuleRelationship = async ({
    action,
    groupId,
    moduleId,
}) => {
    const response = await http({
        endpoint: getMetadataEndpoint(),
        method: "POST",
        body: {
            order_by: "",
            action,
            module: SIDEBAR_GROUP_MODULE,
            id: groupId,
            related_module: SIDEBAR_MODULE_MODULE,
            related_id: moduleId,
            relationship_name: SIDEBAR_GROUP_MODULE_RELATIONSHIP,
        },
    });

    if (!response || response.success !== true) {
        const reason =
            response?.error ||
            (response
                ? "unexpected response from smart_gateway"
                : "smart_gateway returned no response body");

        throw new Error(
            `Sidebar relationship ${action} failed for group ${groupId} and module ${moduleId}: ${reason}`,
        );
    }

    return response;
};

/**
 * Move an existing UI module between group relationships.
 *
 * SmartGateway exposes relationship changes as separate operations. If adding
 * the destination relationship fails after the source was removed, restore
 * the source relationship before reporting the failure so the module is not
 * left orphaned.
 */
export const moveSidebarModuleRelationship = async ({
    moduleId,
    sourceGroupId,
    targetGroupId,
}) => {
    if (!moduleId || !sourceGroupId || !targetGroupId) {
        throw new Error(
            "Moving a sidebar module requires module, source group, and target group ids.",
        );
    }

    if (String(sourceGroupId) === String(targetGroupId)) {
        return { success: true, unchanged: true };
    }

    await requestGroupModuleRelationship({
        action: "remove_relationship",
        groupId: sourceGroupId,
        moduleId,
    });

    try {
        return await requestGroupModuleRelationship({
            action: "add_relationship",
            groupId: targetGroupId,
            moduleId,
        });
    } catch (error) {
        try {
            await requestGroupModuleRelationship({
                action: "add_relationship",
                groupId: sourceGroupId,
                moduleId,
            });
        } catch (restoreError) {
            error.restoreError = restoreError;
            error.message = `${error.message} The original group relationship could not be restored: ${restoreError.message}`;
        }

        throw error;
    }
};

// contact.api.js

export const getSidebarStats = async (
    { email, queries = [] }
) => {
    const params = email ? { email } : {}

    return http({
        method: "POST",
        params: { ...params },
        body: {
            action: "get_stats",
            queries: queries,
        },
    });
};
