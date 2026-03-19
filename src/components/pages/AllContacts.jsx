import React, { useContext, useEffect, useState } from "react";
import {
    Calendar,
    Table,
    User2,
    Contact2Icon,
    ChartNoAxesColumn,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import TableView from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { useNavigate, useParams } from "react-router-dom";
import { PageContext } from "../../context/pageContext";
import { ladgerAction } from "../../store/Slices/ladger"
import { getAllContacts } from "../../store/Slices/contacts";

export default function AllContacts() {

    const { contacts, loading: contactsLoading } =
        useSelector((state) => state.contacts);


    const dispatch = useDispatch();

    const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
        useContext(PageContext);
    const navigateTo = useNavigate();
    const handleOnClick = (email, navigate) => {
        localStorage.setItem("email", email);
        setSearch(email);
        setEnteredEmail(email);
        dispatch(ladgerAction.setTimeline(null));
        setWelcomeHeaderContent("Offers");
        navigateTo(navigate);
    };
    const columns = [
        {
            label: "Created At",
            accessor: "date_entered",
            headerClasses: "",
            icon: Calendar,

            onClick: (row) => handleOnClick(row?.email_address, "/"),
            classes: "truncate max-w-[200px]",
            render: (row) => (
                <span className="font-medium text-gray-700 cursor-pointer">
                    {row.date_entered}
                </span>
            )
        },
        {
            label: "Contact",
            accessor: "email_address",
            headerClasses: "",
            icon: User2,
            classes: "truncate max-w-[200px]",
            onClick: (row) => handleOnClick(row?.email_address, "/contacts/id"),

            render: (row) => (
                <span className="font-medium text-gray-700 cursor-pointer">
                    {row.email_address}
                </span>
            )
        },


        {
            label: "type",
            accessor: "type",
            headerClasses: "",
            icon: ChartNoAxesColumn,
            classes: "truncate max-w-[300px]",

            render: (row) => (
                <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                    {row?.type}
                </span>
            )
        },



    ]
    return (
        <TableView
            tableData={contacts}
            tableName={"Contacts"}
            columns={columns}
            slice={"contacts"}
        >
            <TableTitleBar Icon={Contact2Icon} title={"Contacts"} titleClass={"text-fuchsia-700"} />
            <Table headerStyle={"bg-fuchsia-600"} layoutStyle={"grid grid-cols-3"} />
        </TableView>
    )
}


