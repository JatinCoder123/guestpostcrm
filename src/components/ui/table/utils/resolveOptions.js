import { resolveRequest } from "../../../fields/actions/actionResolver";
import { fetchGpc, http } from "@/services/api";

/**
 * ------------------------------------------------------------
 * OPTION VALUE RESOLVER
 * ------------------------------------------------------------
 *
 * Resolves option configuration into:
 *
 * [
 *   {
 *     label: "...",
 *     value: "..."
 *   }
 * ]
 *
 * Supports:
 *
 * 1. Static options
 *
 * {
 *   options: [
 *     { label: "Group A", value: "group_a" }
 *   ]
 * }
 *
 * 2. Dynamic options
 *
 * {
 *   optionsSource: {
 *     actionType: "get_data",
 *     entryPoint: "get_post_all",
 *     method: "POST",
 *     module: "outr_ledger_manager",
 *     type: "endpoint"
 *   },
 *
 *   optionMapping: {
 *     label: "description",
 *     value: "name"
 *   }
 * }
 *
 * The final result is always:
 *
 * [
 *   {
 *     label: "...",
 *     value: "..."
 *   }
 * ]
 */
export async function resolveOptions(filter, record = {}, context = {}) {
    if (!filter) {
        return [];
    }

    /**
     * ------------------------------------------------------------
     * 1. STATIC OPTIONS
     * ------------------------------------------------------------
     *
     * If options are already supplied, don't make an API call.
     */
    if (Array.isArray(filter.options)) {
        return normalizeOptions(filter.options, filter.optionMapping);
    }

    /**
     * ------------------------------------------------------------
     * 2. EXISTING VALUES
     * ------------------------------------------------------------
     *
     * Supports existing configuration that already uses `values`.
     */
    if (Array.isArray(filter.values)) {
        return normalizeOptions(filter.values, filter.optionMapping);
    }

    /**
     * ------------------------------------------------------------
     * 3. NO OPTIONS SOURCE
     * ------------------------------------------------------------
     */
    if (!filter.optionsSource) {
        return [];
    }

    /**
     * ------------------------------------------------------------
     * 4. RESOLVE SOURCE REQUEST
     * ------------------------------------------------------------
     *
     * Same idea as useActionMutation:
     *
     * { id }
     * { client_email }
     * { context.user.id }
     *
     * can be resolved inside the source configuration.
     */
    const resolvedSource = resolveRequest(
        filter.optionsSource,
        record,
        context
    );

    const {
        endpoint,
        method = "POST",
        params,
        body,
        headers,
    } = resolvedSource;

    if (!endpoint) {
        throw new Error("Option source requires endpoint");
    }

    /**
     * ------------------------------------------------------------
     * 5. EXECUTE REQUEST
     * ------------------------------------------------------------
     */
    let result;

    /**
     * SMARTGATEWAY
     */
    if (endpoint.toLowerCase() === "smartgateway") {
        result = await http({
            method,
            params,
            headers,
            body,
        });
    }

    /**
     * FETCH GPC
     */
    else if (endpoint.toLowerCase() === "fetchgpc") {
        result = await fetchGpc({
            method,
            params,
            body,
            headers,
        });
    }

    /**
     * UNSUPPORTED ENDPOINT
     */
    else {
        throw new Error(`Unsupported option endpoint: ${endpoint}`);
    }


    const sourceOptions = extractOptions(result);
    const norm = normalizeOptions(sourceOptions, filter.optionMapping);
    return norm;
}


function extractOptions(result) {
    if (Array.isArray(result)) {
        return result;
    }

    if (Array.isArray(result?.records)) {
        return result.records;
    }

    if (Array.isArray(result?.data?.data)) {
        return result.data.data;
    }

    if (Array.isArray(result?.results)) {
        return result.results;
    }

    if (Array.isArray(result?.data?.results)) {
        return result.data.results;
    }

    return [];
}

/**
 * ------------------------------------------------------------
 * NORMALIZE OPTIONS
 * ------------------------------------------------------------
 *
 * Converts any source format into:
 *
 * {
 *   label,
 *   value
 * }
 */
function normalizeOptions(options, optionMapping = {}) {
    if (!Array.isArray(options)) {
        return [];
    }

    const labelKey = optionMapping?.label || "label";
    const valueKey = optionMapping?.value || "value";

    return options
        .map((option) => {
            /**
             * Already normalized option:
             *
             * {
             *   label: "Group A",
             *   value: "group_a"
             * }
             */
            if (option && typeof option === "object") {
                return {
                    label:
                        option[labelKey] ??
                        option.label ??
                        option.name ??
                        "",

                    value:
                        option[valueKey] ??
                        option.value ??
                        option.id ??
                        "",
                };
            }

            /**
             * Supports simple primitive options:
             *
             * ["A", "B", "C"]
             */
            return {
                label: String(option),
                value: option,
            };
        })
        .filter(
            (option) =>
                option.label !== "" &&
                option.value !== ""
        );
}

export default resolveOptions;