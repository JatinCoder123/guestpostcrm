import {
  Calendar,
  User,
  FileText,
  MessageSquare,
  BarChart,
  EqualApproximatelyIcon,
  User2,
  BookA,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { getUnansweredEmails } from "../../store/Slices/unansweredEmails";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView from "../ui/table/Table";

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
    const input = extractEmail(email.from);
    localStorage.setItem("email", input);
    setSearch(input);
    setEnteredEmail(input);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Replied");
    navigateTo(navigate);
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      icon: Calendar,
      bgColor: "bg-blue-100 text-blue-600",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.date_entered}
        </span>
      )
    },
    {
      label: "Contact",
      accessor: "email",
      icon: User2,
      bgColor: "bg-blue-100 text-blue-600",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.from?.split("<")[0]?.trim()}
        </span>
      )
    },
    {
      label: "Subject",
      accessor: "subject",
      icon: BookA,
      bgColor: "bg-blue-100 text-blue-600",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.subject}
        </span>
      )
    },
    {
      label: "Count",
      accessor: "thread_count",
      icon: User2,
      bgColor: "bg-blue-100 text-blue-600",
      render: (row) => (
        <span className="font-medium text-gray-900">
          {row.thread_count}
        </span>
      )
    }
  ]

  return (
    <TableView tableData={emails} tableName={"Replied"} columns={columns} slice={"unanswered"} fetchNextPage={() => dispatch(getUnansweredEmails({ page: pageIndex + 1, loading: false }))} />
  );
}