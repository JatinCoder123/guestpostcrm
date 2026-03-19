import {
  Calendar,
  FileText,
  User,
  Heart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getFavEmails } from "../../store/Slices/favEmailSlice.js";

export function FavouritePage() {
  const { count, emails, loading, pageIndex, } = useSelector(
    (state) => state.fav
  );
  const { handleMove } = useThreadContext()
  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
    useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate) => {
    localStorage.setItem("email", email);
    setSearch(email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Favourite");
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
      icon: User,
      classes: "truncate ",
      onClick: (row) => handleOnClick(row?.email_address, "/contacts"),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.first_name} {row?.last_name}        </span>
      )
    },
    {
      label: "Subject",
      accessor: "subject",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleMove({
        email: row.email_address,
        threadId: row.thread_id,
      }),
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.subject}
        </span>
      )
    },
    {
      label: "Description",
      accessor: "description",
      headerClasses: "",
      icon: FileText,
      classes: "truncate max-w-[300px]",
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.description}
        </span>
      )
    },
  ]


  return (
    <>

      <TableView tableData={emails} tableName={"Favourite Emails"} columns={columns} slice={"fav"} fetchNextPage={() => dispatch(getFavEmails({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={Heart} title={"Favourite Emails"} titleClass={"text-pink-700"} />
        <Table headerStyle={"  bg-pink-600"} body layoutStyle={"grid grid-cols-[200px_200px_1fr_1fr]"} />
      </TableView></>

  );
}