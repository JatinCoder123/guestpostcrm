import { http } from "../services/api";
import { buildTableRequestBody } from "../utils/preferenceStorage";

// contact.api.js

export const getContactStats = async (
    filters = {}
) => {
    return http({
        method: "POST",
        body: {
            action: "get_stats",
            ...filters,
            queries: [
                {
                    "key": "new",
                    "module": "Contacts",
                    "filters": {
                        "stage": "new"
                    }
                },
                {
                    "key": "offer",
                    "module": "Contacts",
                    "filters": {
                        "stage": "offer"
                    }
                },
                {
                    "key": "order",
                    "module": "Contacts",
                    "filters": {
                        "stage": "order"
                    }
                },
                {
                    "key": "deal",
                    "module": "Contacts",
                    "filters": {
                        "stage": "deal"
                    }
                },
                {
                    "key": "all",
                    "module": "Contacts"
                },
                {
                    "key": "unverified",
                    "module": "Contacts",
                    "filters": {
                        "customer_type": "unverified"
                    }
                },
                {
                    "key": "verified",
                    "module": "Contacts",
                    "filters": {
                        "customer_type": "verified"
                    }
                },
                {
                    "key": "defaulter",
                    "module": "Contacts",
                    "filters": {
                        "customer_type": "defaulter"
                    }
                },
                {
                    "key": "replied",
                    "module": "Contacts",
                    "filters": {
                        "status": "replied"
                    }
                },
                {
                    "key": "unreplied",
                    "module": "Contacts",
                    "filters": {
                        "status": "unreplied"
                    }
                },
                {
                    "key": "brand",
                    "module": "Contacts",
                    "filters": {
                        "type": "Brand"
                    }
                },
                {
                    "key": "completed",
                    "module": "Contacts",
                    "filters": {
                        "conversation_complete": "1"
                    }
                },
                {
                    "key": "stop",
                    "module": "Contacts",
                    "filters": {
                        "is_stop": "1"
                    }
                }


            ]
        },
    });
};
/**
 * Get paginated contact list
 */
export const getAllContacts = async ({
    page = 1,
    preferences
} = {}) => {
    const data = await http({
        method: "POST",
        body: {
            "action": "fetch",
            "module": "Contacts",
            "fields": ["first_name", "last_name", "type", "stage", "status", "customer_type", "date_entered", "email1", 'full_name', "subject", "thread_id", "message_id"],
            "page": page,
            "per_page": 20,
            ...buildTableRequestBody(preferences)
        }
    });
    return data;
};

/**
 * Get single contact by email
 */
export const getContactByEmail = async (email) => {
    if (!email) {
        throw new Error("Email is required");
    }

    const response = await http({
        method: "GET",
        params: {
            email,
        },
    });

    return response;
};

/**
 * Create contact
 */
export const createContact = async (payload) => {
    const response = await http({
        method: "POST",

        body: {
            "action": "create",
            "module": "Contacts", data: { ...payload }
        },
    });

    return response;
};

/**
 * Update contact
 */
export const updateContact = async ({
    email,
    payload,
}) => {
    const response = await http({
        method: "PUT",
        body: {
            email,
            ...payload,
        },
    });

    return response;
};