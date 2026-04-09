import {
  Calendar,
  User2,
  Gift,
  Globe,
  BadgeDollarSign,
  ChartNoAxesColumn,
  Clapperboard,
  Trash,
  ShieldCheckIcon,
  HandCoins,
  ShieldAlert,
  Eye,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext } from "react";
import { deleteOffer, getOffers } from "../../store/Slices/offers.js";
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingChase } from "../Loading.jsx";
import useAccess from "../../hooks/useAccess.js";
const STATUS_CONFIG = [
  {
    value: "active",
    label: "Active",
    icon: ShieldCheckIcon,
    color: "#F59E0B", // orange (amber-500)
  },
  {
    value: "accepted",
    label: "Accepted",
    icon: HandCoins,
    color: "#10B981", // green (emerald-500)
  },
  {
    value: "expired",
    label: "Expired",
    icon: ShieldAlert,
    color: "#EF4444", // red (red-500)
  },
];
export function OffersPage() {
  const {
    count,
    offers,
    loading,
    pageIndex,
    deleting,
    deleteOfferId,
    summary,
  } = useSelector((state) => state.offers);

  const { handleDateClick } = useContext(PageContext);
  const { isAllow } = useAccess()
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) =>
        handleDateClick({ email: extractEmail(row?.real_name), navigate: "/" }),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      ),
    },
    {
      label: "Contact",
      accessor: "real_name",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) =>
        handleDateClick({
          email: extractEmail(row?.real_name),
          navigate: "/contacts",
        }),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.real_name?.split("<")[0]?.trim()}
        </span>
      ),
    },
    {
      label: "Website",
      accessor: "website",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      render: (row) => (
        <span className="font-medium text-blue-700 ">{row?.website}</span>
      ),
    },
    {
      label: "Client Offer",
      accessor: "client_offer_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">
          {row?.client_offer_c}
        </span>
      ),
    },
    {
      label: "Our OFfer",
      accessor: "our_offer_c",
      headerClasses: "",
      icon: BadgeDollarSign,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-gray-700 ">{row?.our_offer_c}</span>
      ),
    },
    {
      label: "Stage",
      accessor: "offer_status",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",
      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row?.offer_status}
        </span>
      ),
    },
    {
      label: "Expiry Date",
      accessor: "expiry_date",
      headerClasses: "",
      icon: Calendar,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-gray-700 ">{row?.expiry_date}</span>
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
          {/* Update Button */}
          <button
            className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
            title="View"
            onClick={() =>
              navigateTo(`/offers/view`, {
                state: {
                  email: extractEmail(row.real_name),
                  threadId: row?.thread_id,
                  id: row?.id,
                },
              })
            }
          >
            <Eye className="w-5 h-5 text-blue-600" />
          </button>
          {deleting && deleteOfferId === row.id ? (
            <LoadingChase size="20" color="red" />
          ) : (
            <button
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete"
              onClick={() =>
                dispatch(deleteOffer(extractEmail(row.real_name), row.id, row))
              }
            >
              <Trash className="w-5 h-5 text-red-600" />
            </button>
          )}
        </div>
      ),
    },
  ];
  const statusList = STATUS_CONFIG.map((config) => {
    return {
      ...config,
      count: Number(summary?.[`${config.value}_offers`] || 0),
    };
  });

  return (
    <TableView
      tableData={offers}
      tableName={"Offers"}
      allowToView={isAllow("view_offer")}
      columns={columns}
      slice={"offers"}
      statusKey={"offer_status"}
      statusList={statusList}
      fetchNextPage={() => dispatch(getOffers({ page: pageIndex + 1 }))}
    >
      <TableTitleBar
        Icon={Gift}
        title={"Offers"}
        titleClass={"text-green-700"}
      />
      <Table
        headerStyle={"  bg-green-600"}
        layoutStyle={"grid grid-cols-[200px_200px_1fr_200px_1fr_1fr_1fr_1fr]"}
      />
    </TableView>
  );
}
