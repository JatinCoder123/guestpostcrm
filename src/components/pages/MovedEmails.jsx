import {
  Calendar,
  User2,
  Gift,
  Pen,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  Trash,
  ShieldCheckIcon,
  HandCoins,
  ShieldAlert,
  ArrowBigRightDashIcon,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { getmovedEmails } from "../../store/Slices/movedEmails.js"
import { LoadingChase } from "../Loading.jsx";;
export function MovedPage() {
  const {
    count,
    emails,
    pageIndex,
  } = useSelector((state) => state.moved);
  const [restoringId, setRestoringId] = useState(null);
  const { handleDateClick } =
    useContext(PageContext);
  const { handleMove } =
    useThreadContext();
  const dispatch = useDispatch();

  const handleRestore = async (emailItem) => {
    try {
      setRestoringId(emailItem.thread_id);

      const res = await axios.get(
        crmEndpiont,
        {
          params: {
            type: "restore_email",
            email: emailItem.email,
            label_id: emailItem.label_name,
            thread_id: emailItem.thread_id,
          },
        }
      );

      if (res?.data) {
        toast.success("Email restored successfully ✅");

        // 🔥 Refresh list
        dispatch(getmovedEmails());
      }
    } catch (err) {
      toast.error("Failed to restore email ❌");
    } finally {
      setRestoringId(null);
    }
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleDateClick({ email: row?.email, navigate: "/" })
      ,
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },
    {
      label: "SENDER",
      accessor: "email",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) =>
        handleDateClick({ email: row?.email, navigate: "/contacts" }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.email}
        </span>
      ),
    },
    {
      label: "Subject",
      accessor: "website",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      onClick: (row) =>
        handleMove({
          email: row?.email,
          threadId: row.thread_id,
        }),
      render: (row) => (
        <span className="font-medium text-purple-700 cursor-pointer ">{row?.subject}</span>
      ),
    },
    {
      label: "Label",
      accessor: "label_name",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">
          {row?.label_name}
        </span>
      ),
    },
    {
      label: "Reason",
      accessor: "reason",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",
      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.reason}
        </span>
      ),
    },
    {
      label: "Action",
      accessor: "action",
      headerClasses: "ml-auto",
      icon: Clapperboard,
      classes: "truncate max-w-[300px] ml-auto",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRestore(row);
            }}
            disabled={restoringId === row.thread_id}
            className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm
                    hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {restoringId === row.thread_id ? (
              <>
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Restoring...
              </>
            ) : (
              "Restore"
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <TableView
      tableData={emails}
      tableName={"Moved Emails"}
      columns={columns}
      slice={"moved"}
      fetchNextPage={() => dispatch(getmovedEmails(null, pageIndex + 1))}
    >
      <TableTitleBar
        Icon={ArrowBigRightDashIcon}
        title={"Moved Emails"}
        titleClass={"text-blue-700"}
      />
      <Table
        headerStyle={"  bg-blue-600"}
        layoutStyle={"grid grid-cols-[200px_1fr_1fr_200px_200px_1fr]"}
      />
    </TableView>
  );
}
