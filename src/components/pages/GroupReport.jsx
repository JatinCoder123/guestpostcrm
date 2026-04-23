import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import { PageContext } from "../../context/pageContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import {
  Calendar,
  FileText,
  Mail,
  User,
  BarChart4,
  ActivityIcon,
} from "lucide-react";
import { getGroupReport } from "../../store/Slices/reportSlice";
import { data, useParams } from "react-router-dom";

export default function GroupReport() {
  const { count, data, loading, pageIndex } = useSelector(
    (state) => state.report,
  );
  const { handleDateClick } = useContext(PageContext);
  const { grp } = useParams();
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(getGroupReport({ grp }));
  }, []);
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,
      onClick: (row, index) =>
        handleDateClick({ email: row.sender_email, navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },

    {
      label: "Contact",
      accessor: "sender_email",
      headerClasses: "",
      icon: User,
      classes: "truncate ",
      onClick: (row, index) =>
        handleDateClick({ email: row.sender_email, navigate: "/contacts" }),

      render: (row) => (
        <div className="flex items-center gap-2 cursor-pointer">
          <span className="font-medium text-gray-800">{row.sender_email}</span>
        </div>
      ),
    },
    {
      label: "Action",
      accessor: "action",
      headerClasses: "",
      icon: ActivityIcon,
      classes: "truncate max-w-[600px]",
      render: (row) => (
        <span className="px-6 py-4 text-green-600 cursor-pointer">
          {row.action}
        </span>
      ),
    },
    {
      label: "Stage",
      accessor: "description",
      headerClasses: "",
      icon: BarChart4,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <div className="flex items-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm border flex items-center `}
          >
            {row.description}
          </span>
        </div>
      ),
    },
    {
      label: "User",
      accessor: "user_details",
      headerClasses: "",
      icon: User,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <div className="flex items-center">
          <span
            className={`px-3 py-1.5 rounded-full text-sm border flex items-center `}
          >
            {row.user_details == false ? "GPC" : row.user_details.name}
          </span>
        </div>
      ),
    },
  ];

  return (
    <>
      <TableView
        tableData={data}
        tableName={`${grp} Group Report`}
        columns={columns}
        slice={"report"}
        fetchNextPage={() =>
          dispatch(getGroupReport({ grp, page: pageIndex + 1 }))
        }
      >
        <TableTitleBar
          Icon={Mail}
          title={`${grp.toUpperCase()} Group Report`}
          titleClass={"text-teal-700"}
        />

        {/* 🔥 TABLE WRAPPER */}
        <div className="relative">
          <Table
            headerStyle={"bg-teal-600"}
            layoutStyle={"grid grid-cols-[200px_1fr_1fr_200px_1fr]"}
          />

          {/* 🔥 LOADING OVERLAY */}
          {loading && (
            <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px] flex items-center justify-center z-50">
              <div className="flex flex-col items-center gap-3">
                {/* Spinner */}
                <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>

                {/* Dynamic Text */}
                <p className="text-gray-700 font-medium">Report Loading...</p>
              </div>
            </div>
          )}
        </div>
      </TableView>
    </>
  );
}
