import {
  Calendar,
  User2,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  ArrowBigRightDashIcon,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../../context/pageContext";
import { useThreadContext } from "../../hooks/useThreadContext";

import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";

import { getmovedEmails } from "../../store/Slices/movedEmails";

import { toast } from "react-toastify";
import { fetchGpc } from "../../services/api";

export function MovedPage() {
  const dispatch = useDispatch();

  const { emails, pageIndex, loading } = useSelector((state) => state.moved);

  const [restoringId, setRestoringId] = useState(null);

  const { handleDateClick } = useContext(PageContext);

  const { handleMove } = useThreadContext();

  // INITIAL API CALL
  useEffect(() => {
    dispatch(getmovedEmails());
  }, [dispatch]);

  // RESTORE EMAIL
  const handleRestore = async (emailItem) => {
    try {
      setRestoringId(emailItem.thread_id);

      const res = await fetchGpc({
        params: {
          type: "restore_email",
          email: emailItem.email,
          label_id: emailItem.label_name,
          thread_id: emailItem.thread_id,
          subject: emailItem.subject,
        },
      });

      console.log("RESTORE RESPONSE => ", res);

      if (res?.success || res?.data || res) {
        toast.success("Email restored successfully ✅");

        // refresh moved emails
        dispatch(getmovedEmails());
      }
    } catch (error) {
      console.log("RESTORE ERROR => ", error);

      toast.error("Failed to restore email ❌");
    } finally {
      setRestoringId(null);
    }
  };

  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      icon: Calendar,

      onClick: (row) =>
        handleDateClick({
          email: row?.email,
          navigate: "/",
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row?.date_entered}
        </span>
      ),
    },

    {
      label: "Sender",
      accessor: "email",
      icon: User2,

      render: (row) => (
        <span className="font-medium text-gray-700">{row?.email}</span>
      ),
    },

    {
      label: "Subject",
      accessor: "subject",
      icon: Globe,

      onClick: (row) =>
        handleMove({
          email: row?.email,
          threadId: row?.thread_id,
        }),

      render: (row) => (
        <span className="font-medium text-purple-700 cursor-pointer">
          {row?.subject}
        </span>
      ),
    },

    {
      label: "Label",
      accessor: "label_name",
      icon: BadgeDollarSign,

      render: (row) => (
        <span className="font-medium text-green-700">{row?.label_name}</span>
      ),
    },

    {
      label: "Reason",
      accessor: "reason",
      icon: ChartNoAxesColumn,

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.reason || "Moved"}
        </span>
      ),
    },

    {
      label: "Action",
      accessor: "action",
      icon: Clapperboard,

      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleRestore(row);
          }}
          disabled={restoringId === row.thread_id}
          className="px-3 py-1 rounded-lg bg-green-500 text-white text-sm hover:bg-green-600 transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
      ),
    },
  ];

  return (
    <TableView
      tableData={emails}
      tableName={"Moved Emails"}
      columns={columns}
      slice={"moved"}
      loading={loading}
      fetchNextPage={() => dispatch(getmovedEmails("", pageIndex + 1))}
    >
      <TableTitleBar
        Icon={ArrowBigRightDashIcon}
        title={"Moved Emails"}
        titleClass={"text-blue-700"}
      />

      <Table
        headerStyle={"bg-blue-600"}
        layoutStyle={"grid grid-cols-[200px_1fr_1fr_200px_200px_1fr]"}
      />
    </TableView>
  );
}
