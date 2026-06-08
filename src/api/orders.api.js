// orders.api.js

import { http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";


export const getAllOrders = ({
    preferences,
    page = 1,
    email = "",
}) =>
    http({
        method: "POST",
        body: {
            "action": "fetch",
            "module": "outr_order_gp_li",
            page,
            ...buildTableRequestBody(
                preferences
            ),
        },
        params: { email }
    });

export const getOrderById = (
    id
) =>
    http({
        method: "POST",
        body: {
            "action": "fetch",
            "module": "outr_order_gp_li", filter: { id }
        },
    });

export const createOrder = (
    order
) =>
    http({
        method: "POST",
        params: {
            action:
                "createOrder",
        },
        body: order,
    });

export const updateOrder = ({
    order,
}) =>
    http({
        method: "POST",
        params: {
            action:
                "updateOrder",
        },
        body: order,
    });

export const getOrderStats = (
    filters = {}
) =>
    http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,
            queries: [
                {
                    "key": "new",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "new"
                    }
                },
                {
                    "key": "accepted",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "accepted"
                    }
                },
                {
                    "key": "pending",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "pending"
                    }
                },
                {
                    "key": "wrong",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "wrong"
                    }
                },
                {
                    "key": "completed",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "completed"
                    }
                },
                {
                    "key": "rejected_nontechnical",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "rejected_nontechnical"
                    }
                },
                {
                    "key": "marketplace",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "marketplace"
                    }
                },
                {
                    "key": "listacle",
                    "module": "outr_order_gp_li",
                    "filters": {
                        "order_status": "listacle"
                    }
                },
                {
                    "key": "all",
                    "module": "outr_order_gp_li"
                },
            ]
        },
    });