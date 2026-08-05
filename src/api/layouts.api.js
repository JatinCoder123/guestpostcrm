export const getDetailLayout = (entity) => {
    return setTimeout(() => {
        return {
            "status": true,
            "statusText": "success",
            "code": 200,
            "timestamp": "2026-08-05T16:12:45.345Z",
            "requestId": "req_17f788e6474e92252c8e",
            "message": "Layout retrieved successfully.",
            "payload": {
                "layout_id": 1,
                "schema": [
                    {
                        "type": "row",
                        "key": "row_271d",
                        "properties": {
                            "columns": [
                                {
                                    "type": "column",
                                    "key": "column_b576",
                                    "properties": {
                                        "width": 100
                                    },
                                    "children": [
                                        {
                                            "type": "widget",
                                            "key": "widget_422a",
                                            "properties": {
                                                "widgetType": "list",
                                                "widgetId": "related_list_contact",
                                                "title": "Contacts List",
                                                "relatedEntity": "contact",
                                                "relatedView": "list",
                                                "pageSize": 10,
                                                "filter": "",
                                                "sort": "",
                                                "showAddButton": true,
                                                "addButtonText": "Add Contact"
                                            }
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            }
        }
    }, 4000)
}