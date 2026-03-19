import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  BarChart,
  EqualApproximatelyIcon,
  User2,
  BookA,
  Mail,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { getUnansweredEmails } from "../../store/Slices/unansweredEmails";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import TableHeader from "../ui/table/TableHeader";

export function UnansweredPage() {
  const { count, emails, loading, pageIndex, pageCount } = useSelector(
    (state) => state.unanswered
  );

  const { setWelcomeHeaderContent, setSearch, setEnteredEmail } =
    useContext(PageContext);

  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const { handleMove } = useThreadContext();


  const handleOnClick = (email, navigate) => {
    localStorage.setItem("email", email);
    setSearch(email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Replied");
    navigateTo(navigate);
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,
      onClick: (row) => handleOnClick(extractEmail(row?.from), "/"),
      classes: "",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },
    {
      label: "Contact",
      accessor: "email",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[300px]",
      onClick: (row) => handleOnClick(extractEmail(row?.from), "/"),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.from?.split("<")[0]?.trim()}
        </span>
      )
    },
    {
      label: "Subject",
      accessor: "subject",
      headerClasses: "",
      icon: BookA,
      classes: "truncate max-w-[400px]",
      onClick: (row) => handleMove({ email: extractEmail(row?.from), threadId: row.thread_id }),

      render: (row) => (
        <span className="font-medium text-purple-600  cursor-pointer">
          {row.subject}
        </span>
      )
    },
    {
      label: "Count",
      accessor: "thread_count",
      headerClasses: "ml-auto",
      icon: BarChart,
      classes: "ml-auto",
      render: (row) => (
        <span className="font-medium text-purple-600  ">
          {row.thread_count}
        </span>
      )
    }
  ]


  return (
    <TableView tableData={emails} tableName={"Replied"} columns={columns} slice={"unanswered"} fetchNextPage={() => dispatch(getUnansweredEmails({ page: pageIndex + 1, loading: false }))}   >
      <TableTitleBar Icon={Mail} title={"Replied Emails"} titleClass={"text-purple-500"} />
      <Table headerStyle={"grid grid-cols-4  bg-purple-600"} />
    </TableView>
  );
}