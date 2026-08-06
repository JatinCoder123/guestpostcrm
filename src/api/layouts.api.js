export const getDetailLayout = (entity) => {
    return {
        "module": "contacts",
        "layout": "default",
        "version": 1,
        "blocks": [
            {
                "id": "header",
                "type": "header",
                "titleField": "full_name",
                "imageField": "profile_image",
                "subtitleField": "account_name",
                "actions": [
                    {
                        "id": "edit",
                        "label": "Edit",
                        "icon": "Pencil"
                    },
                    {
                        "id": "email",
                        "label": "Send Email",
                        "icon": "Mail"
                    },
                    {
                        "id": "more",
                        "icon": "MoreHorizontal"
                    }
                ]
            },
            {
                "id": "tabs",
                "type": "tabs",
                "defaultTab": "contact",
                "tabs": [
                    {
                        "id": "contact",
                        "label": "Contact",
                        "blocks": [
                            {
                                "id": "summary",
                                "type": "summary",
                                "columns": 2,
                                "fields": [
                                    "owner",
                                    "email",
                                    "phone",
                                    "mobile"
                                ]
                            },
                            {
                                "id": "contact_information",
                                "type": "section",
                                "title": "Contact Information",
                                "columns": 2,
                                "editable": true,

                                "fields": [

                                    {
                                        "accessor": "first_name",
                                        "label": "First Name",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true,
                                        "required": false,
                                        "readonly": false,

                                        "placeholder": "Enter First Name",

                                        "validation": {
                                            "minLength": 2,
                                            "maxLength": 50
                                        }
                                    },

                                    {
                                        "accessor": "last_name",
                                        "label": "Last Name",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true,
                                        "required": true,
                                        "readonly": false,

                                        "placeholder": "Enter Last Name",

                                        "validation": {
                                            "minLength": 2,
                                            "maxLength": 100
                                        }
                                    },

                                    {
                                        "accessor": "email",
                                        "label": "Email",

                                        "type": "email",

                                        "editable": true,
                                        "visible": true,
                                        "required": false,
                                        "readonly": false,

                                        "placeholder": "example@gmail.com",

                                        "actions": [
                                            {
                                                "icon": "Mail",
                                                "action": "send_email"
                                            }
                                        ]
                                    },

                                    {
                                        "accessor": "phone",
                                        "label": "Phone",

                                        "type": "phone",

                                        "editable": true,
                                        "visible": true,

                                        "placeholder": "+91XXXXXXXXXX"
                                    },

                                    {
                                        "accessor": "mobile",
                                        "label": "Mobile",

                                        "type": "phone",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "title",
                                        "label": "Job Title",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "department",
                                        "label": "Department",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "lead_source",
                                        "label": "Lead Source",

                                        "type": "select",

                                        "editable": true,
                                        "visible": true,

                                        "options": [
                                            {
                                                "label": "Website",
                                                "value": "website"
                                            },
                                            {
                                                "label": "Facebook",
                                                "value": "facebook"
                                            },
                                            {
                                                "label": "Referral",
                                                "value": "referral"
                                            },
                                            {
                                                "label": "Cold Call",
                                                "value": "cold_call"
                                            }
                                        ]
                                    }

                                ]
                            },
                            {
                                "id": "address_information",
                                "type": "section",
                                "title": "Address Information",
                                "columns": 2,
                                "editable": true,

                                "fields": [

                                    {
                                        "accessor": "mailing_street",
                                        "label": "Street",

                                        "type": "textarea",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "mailing_city",
                                        "label": "City",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "mailing_state",
                                        "label": "State",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "mailing_country",
                                        "label": "Country",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    },

                                    {
                                        "accessor": "mailing_zip",
                                        "label": "Zip Code",

                                        "type": "text",

                                        "editable": true,
                                        "visible": true
                                    }

                                ]
                            },
                            // {
                            //     "id": "description",
                            //     "type": "section",
                            //     "title": "Description",
                            //     "columns": 1,
                            //     "editable": true,
                            //     "fields": [
                            //         {
                            //             "field": "description",
                            //             "component": "textarea",
                            //             "editable": true
                            //         }
                            //     ]
                            // }
                        ]
                    },
                    {
                        "id": "account",
                        "label": "Account",
                        "blocks": [
                            {
                                "id": "account_header",
                                "type": "related_record",
                                "module": "accounts",
                                "relationshipField": "account_id"
                            },
                            {
                                "id": "account_information",
                                "type": "section",
                                "title": "Account Information",
                                "columns": 2,
                                "editable": false,

                                "fields": [

                                    {
                                        "accessor": "account_name",
                                        "label": "Account Name",

                                        "type": "text",

                                        "editable": false
                                    },

                                    {
                                        "accessor": "website",
                                        "label": "Website",

                                        "type": "url",

                                        "editable": false
                                    },

                                    {
                                        "accessor": "industry",
                                        "label": "Industry",

                                        "type": "text",

                                        "editable": false
                                    },

                                    {
                                        "accessor": "employees",
                                        "label": "Employees",

                                        "type": "number",

                                        "editable": false
                                    },

                                    {
                                        "accessor": "annual_revenue",
                                        "label": "Annual Revenue",

                                        "type": "currency",

                                        "editable": false,

                                        "props": {
                                            "currency": "USD"
                                        }
                                    },

                                    {
                                        "accessor": "billing_city",
                                        "label": "Billing City",

                                        "type": "text",

                                        "editable": false
                                    }

                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    }
}