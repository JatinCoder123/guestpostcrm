import { useQuery } from "@tanstack/react-query";



export const preferenceKeys = {
    all: ["preferences"],

    layout: () => [
        "preferences",
        "layout"
    ],

};


export const useLayoutPreferences = () =>
    useQuery({
        queryKey: preferenceKeys.layout(),
        queryFn: () => [
            {
                group_name: "Communication",
                group_priority: 1,
                count: 4,
                data: [
                    {
                        route: "",
                        weight: "1",
                        color: "",
                        icon: "FiInbox",
                        library: "fi",
                        name: "Inbox",
                    },
                    {
                        route: "",
                        weight: "2",
                        color: "",
                        icon: "FaRegUser",
                        library: "fa",
                        name: "Assigned To Me",
                    },
                    {
                        route: "",
                        weight: "3",
                        color: "",
                        icon: "FaRegHeart",
                        library: "fa",
                        name: "Favourites",
                    },
                ],
            },

            {
                group_name: "CRM",
                group_priority: 2,
                count: 5,
                data: [
                    {
                        route: "",
                        weight: "1",
                        color: "",
                        icon: "LuContact",
                        library: "lu",
                        name: "Contacts",
                    },
                    {
                        route: "",
                        weight: "2",
                        color: "",
                        icon: "GrAnnounce",
                        library: "gr",
                        name: "Offers",
                    },
                    {
                        route: "",
                        weight: "3",
                        color: "",
                        icon: "FaRegHandshake",
                        library: "fa",
                        name: "Deals",
                    },
                    {
                        route: "",
                        weight: "4",
                        color: "",
                        icon: "GiShoppingCart",
                        library: "gi",
                        name: "Orders",
                    },
                    {
                        route: "",
                        weight: "5",
                        color: "",
                        icon: "LiaFileInvoiceSolid",
                        library: "lia",
                        name: "Invoices",
                    },
                ],
            },

            {
                group_name: "Content & Outreach",
                group_priority: 3,
                count: 2,
                data: [
                    {
                        route: "",
                        weight: "1",
                        color: "",
                        icon: "GoLink",
                        library: "go",
                        name: "Link Exchange",
                    },
                    {
                        route: "",
                        weight: "2",
                        color: "",
                        icon: "BsListNested",
                        library: "bs",
                        name: "Link Removal",
                    },
                ],
            },

            {
                group_name: "Productivity",
                group_priority: 4,
                count: 3,
                data: [
                    {
                        route: "",
                        weight: "1",
                        color: "",
                        icon: "LuBellRing",
                        library: "lu",
                        name: "Reminders",
                    },
                ],
            },

            {
                group_name: "Analytics",
                group_priority: 5,
                count: 1,
                data: [
                    {
                        route: "/view-reports",
                        weight: "1",
                        color: "",
                        icon: "IoBarChart",
                        library: "io5",
                        name: "Reports",
                    },
                ],
            },
            {
                group_name: "Other",
                group_priority: 6,
                count: 1,
                data: [
                    {
                        route: "/market-place",
                        weight: "1",
                        color: "",
                        icon: "IoStorefrontOutline",
                        library: "io5",
                        name: "Market Place",
                    },
                    {
                        route: "/moved-emails",
                        weight: "1",
                        color: "",
                        icon: "CgMoveDown",
                        library: "cg",
                        name: "Moved Emails",
                    },
                    {
                        route: "/tag-manager",
                        weight: "1",
                        color: "",
                        icon: "IoPricetagOutline",
                        library: "io5",
                        name: "Tag Manager",
                    },

                    {
                        route: "/ip-manager",
                        weight: "1",
                        color: "",
                        icon: "CiGlobe",
                        library: "ci",
                        name: "IP Manager",
                    },
                ],
            },
        ],
        staleTime:
            5 * 60 * 1000,
    });