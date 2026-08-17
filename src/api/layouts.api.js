import { apiRequest } from "@/services/api";

export const getDetailLayout = () => ({
    module: "Contacts",
    layout: "detail",
    version: 3,
    request: {
        endpoint: "fetchgpc",
        method: "GET",
        params: { type: 'get_contact' },
    },

    navigation: {
        enabled: true,

        previous: {
            enabled: true,
        },

        next: {
            enabled: true,
        },

        source: "list",

        idField: "id",
    },

    // ============================================================
    // HEADER
    // ============================================================

    header: {
        id: "contact_header",

        type: "header",

        module: "contacts",

        titleField: {
            accessor: "full_name",
            source: {
                module: "contacts",
                path: "contact"
            }
        },

        subtitleField: {
            accessor: "name",
            source: {
                module: "accounts",
                path: "account"
            }
        },

        descriptionField: {
            accessor: "email1",
            source: {
                module: "contacts",
                path: "contact"
            }
        },

        actions: [
            {
                id: "edit",

                label: "Edit",

                icon: {
                    library: "fi",
                    name: "FiEdit2",
                    color: "",
                },

                placement: "primary",

                type: "navigate",

                targetType: "relative",

                target: "edit",
            },



            {
                id: "send_email",

                label: "Send Email",

                icon: {
                    library: "fi",
                    name: "FiMail",
                    color: "",
                },

                placement: "primary",

                type: "navigate",


                targetType: "absolute",

                target: "/thread/view?email={contact.email1}&thread_id={contact.thread_id}"
            },
        ],
    },

    // ============================================================
    // BLOCKS
    // ============================================================

    blocks: [
        // ========================================================
        // BLOCK 1
        // CONTACT TAB
        // ========================================================

        {
            id: "contact_tabs",

            type: "tabs",
            defaultTab: "contact",

            title: "Contact",

            weight: 10,

            visible: true,

            tabs: [
                // ==================================================
                // TAB 1 — CONTACT
                // ==================================================

                {
                    id: "contact",

                    label: "Contact",

                    module: "contacts",


                    sections: [
                        // ==========================================
                        // CONTACT INFORMATION
                        // ==========================================

                        {
                            id: "contact_information",

                            type: "section",

                            title: "Contact Information",

                            module: "Contacts",

                            columns: 2,
                            source: {
                                module: "Contacts",
                                path: "contact",
                            },

                            editable: true,

                            fields: [
                                {
                                    accessor: "salutation",

                                    label: "Salutation",

                                    type: "select",

                                    editable: true,

                                    visible: true,

                                    readonly: false,

                                    options: [
                                        {
                                            label: "Mr.",
                                            value: "Mr.",
                                        },

                                        {
                                            label: "Mrs.",
                                            value: "Mrs.",
                                        },

                                        {
                                            label: "Ms.",
                                            value: "Ms.",
                                        },

                                        {
                                            label: "Dr.",
                                            value: "Dr.",
                                        },
                                    ],
                                },

                                {
                                    accessor: "first_name",

                                    label: "First Name",

                                    type: "text",

                                    editable: true,

                                    visible: true,

                                    readonly: false,

                                    required: false,

                                    placeholder:
                                        "Enter First Name",

                                    validation: {
                                        minLength: 2,
                                        maxLength: 50,
                                    },
                                },

                                {
                                    accessor: "last_name",

                                    label: "Last Name",

                                    type: "text",

                                    editable: true,

                                    visible: true,

                                    readonly: false,

                                    required: true,

                                    placeholder:
                                        "Enter Last Name",

                                    validation: {
                                        minLength: 2,
                                        maxLength: 100,
                                    },
                                },

                                {
                                    accessor: "email1",

                                    label: "Email",

                                    type: "email",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "phone_home",

                                    label: "Home Phone",

                                    type: "phone",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "phone_mobile",

                                    label: "Mobile",

                                    type: "phone",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "phone_work",

                                    label: "Work Phone",

                                    type: "phone",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "phone_fax",

                                    label: "Fax",

                                    type: "phone",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "title",

                                    label: "Job Title",

                                    type: "text",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "department",

                                    label: "Department",

                                    type: "text",

                                    editable: true,

                                    visible: true,

                                    readonly: false,
                                },

                                {
                                    accessor: "lead_source",

                                    label: "Lead Source",

                                    type: "select",

                                    editable: true,

                                    visible: true,

                                    options: [
                                        {
                                            label: "Website",
                                            value: "website",
                                        },

                                        {
                                            label: "Facebook",
                                            value: "facebook",
                                        },

                                        {
                                            label: "Referral",
                                            value: "referral",
                                        },

                                        {
                                            label: "Cold Call",
                                            value: "cold_call",
                                        },

                                        {
                                            label: "Other",
                                            value: "other",
                                        },
                                    ],
                                },

                                {
                                    accessor: "birthdate",

                                    label: "Birthdate",

                                    type: "date",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor: "description",

                                    label: "Description",

                                    type: "textarea",

                                    editable: true,

                                    visible: true,

                                    placeholder:
                                        "Enter description...",
                                },
                            ],
                        },

                        // ==========================================
                        // ADDRESS
                        // ==========================================

                        {
                            id: "address_information",

                            type: "section",

                            title: "Address Information",

                            module: "Contacts",

                            columns: 2,

                            editable: true,
                            source: {
                                module: "Contacts",
                                path: "contact",
                            },
                            fields: [
                                {
                                    accessor:
                                        "primary_address_street",

                                    label: "Street",

                                    type: "textarea",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "primary_address_street_2",

                                    label: "Street 2",

                                    type: "text",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "primary_address_city",

                                    label: "City",

                                    type: "text",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "primary_address_state",

                                    label: "State",

                                    type: "text",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "primary_address_postalcode",

                                    label: "Postal Code",

                                    type: "text",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "primary_address_country",

                                    label: "Country",

                                    type: "text",

                                    editable: true,

                                    visible: true,
                                },
                            ],
                        },

                        // ==========================================
                        // CONTACT STATUS
                        // ==========================================

                        {
                            id: "contact_status",

                            type: "section",

                            title: "Contact Status",

                            module: "Contacts",

                            columns: 2,
                            source: {
                                module: "Contacts",
                                path: "contact",
                            },
                            editable: true,

                            fields: [
                                {
                                    accessor: "status",

                                    label: "Status",

                                    type: "status",

                                    editable: true,

                                    visible: true,

                                    options: [
                                        {
                                            label:
                                                "Not Accepted",

                                            value:
                                                "not_accepted",
                                        },

                                        {
                                            label: "Accepted",

                                            value: "accepted",
                                        },

                                        {
                                            label: "Completed",

                                            value: "completed",
                                        },
                                    ],
                                },

                                {
                                    accessor: "stage",

                                    label: "Stage",

                                    type: "select",

                                    editable: true,

                                    visible: true,

                                    options: [
                                        {
                                            label: "Offer",
                                            value: "offer",
                                        },

                                        {
                                            label: "Order",
                                            value: "order",
                                        },

                                        {
                                            label:
                                                "Completed",

                                            value:
                                                "completed",
                                        },
                                    ],
                                },

                                {
                                    accessor:
                                        "customer_type",

                                    label:
                                        "Customer Type",

                                    type: "select",

                                    editable: true,

                                    visible: true,

                                    options: [
                                        {
                                            label:
                                                "Unverified",

                                            value:
                                                "unverified",
                                        },

                                        {
                                            label:
                                                "Verified",

                                            value:
                                                "verified",
                                        },
                                    ],
                                },

                                {
                                    accessor:
                                        "trust_score",

                                    label:
                                        "Trust Score",

                                    type: "percent",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor: "favorite",

                                    label: "Favorite",

                                    type: "boolean",

                                    editable: true,

                                    visible: true,
                                },

                                {
                                    accessor: "hot",

                                    label: "Hot",

                                    type: "boolean",

                                    editable: true,

                                    visible: true,
                                },
                            ],
                        },
                    ],
                },

                // ==================================================
                // TAB 2 — ACCOUNT
                // ==================================================

                {
                    id: "account",

                    label: "Account",

                    module: "accounts",



                    sections: [
                        // ==========================================
                        // ACCOUNT INFORMATION
                        // ==========================================

                        {
                            id: "account_information",

                            type: "section",

                            title: "Account Information",

                            module: "accounts",

                            columns: 2,
                            source: {
                                module: "accounts",
                                path: "account",
                            },
                            editable: true,

                            fields: [
                                {
                                    accessor: "name",

                                    label: "Account Name",

                                    type: "text",

                                    editable: true,

                                    readonly: false,

                                    visible: true,
                                },

                                {
                                    accessor: "website",

                                    label: "Website",

                                    type: "url",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor: "industry",

                                    label: "Industry",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor: "employees",

                                    label: "Employees",

                                    type: "number",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "annual_revenue",

                                    label:
                                        "Annual Revenue",

                                    type: "currency",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor: "ownership",

                                    label: "Ownership",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor: "rating",

                                    label: "Rating",

                                    type: "rating",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },
                            ],
                        },

                        // ==========================================
                        // BILLING ADDRESS
                        // ==========================================

                        {
                            id: "billing_address",

                            type: "section",

                            title: "Billing Address",

                            module: "accounts",

                            columns: 2,
                            source: {
                                module: "accounts",
                                path: "account",
                            },
                            editable: false,

                            fields: [
                                {
                                    accessor:
                                        "billing_address_street",

                                    label: "Street",

                                    type: "textarea",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "billing_address_city",

                                    label: "City",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "billing_address_state",

                                    label: "State",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "billing_address_postalcode",

                                    label: "Postal Code",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "billing_address_country",

                                    label: "Country",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },
                            ],
                        },

                        // ==========================================
                        // SHIPPING ADDRESS
                        // ==========================================

                        {
                            id: "shipping_address",

                            type: "section",

                            title: "Shipping Address",

                            module: "accounts",

                            columns: 2,
                            source: {
                                module: "accounts",
                                path: "account",
                            },
                            editable: false,

                            fields: [
                                {
                                    accessor:
                                        "shipping_address_street",

                                    label: "Street",

                                    type: "textarea",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "shipping_address_city",

                                    label: "City",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "shipping_address_state",

                                    label: "State",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "shipping_address_postalcode",

                                    label: "Postal Code",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },

                                {
                                    accessor:
                                        "shipping_address_country",

                                    label: "Country",

                                    type: "text",

                                    editable: false,

                                    readonly: true,

                                    visible: true,
                                },
                            ],
                        },
                    ],
                },
            ],
        },
    ],
});

export const getLayout = async (module = 'orders', view_key = "table") => {
    const data = await apiRequest({
        endpoint: "https://gagan.guestpostcrm.com/index.php?entryPoint=flexibility&api_version=v1",
        params: { module_key: module, view_key },
    })
    return data;
}
