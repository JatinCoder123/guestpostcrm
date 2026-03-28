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
  Cable,
  Text,
  Edit,
  Pencil,
  X,
  Eye,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useState } from "react";
import { deleteOffer, getOffers } from "../../store/Slices/offers.js"
import { PageContext } from "../../context/pageContext";
import { useNavigate } from "react-router-dom";
import { extractEmail } from "../../assets/assets";
import { ladgerAction } from "../../store/Slices/ladger";
import { useThreadContext } from "../../hooks/useThreadContext";
import TableView, { Table } from "../ui/table/Table";
import TableTitleBar from "../ui/table/TableTitleBar";
import { LoadingChase } from "../Loading.jsx"
import { getBacklinks, updateBacklink } from "../../store/Slices/backlinks.js";
import BacklinkDetailBox from "./BacklinkDetailBox.jsx"
import { toast } from "react-toastify";

export function BacklinksPage() {
  const { count, backlinks, loading, pageIndex, summary } = useSelector(
    (state) => state.backlinks
  );


  const { setWelcomeHeaderContent, setEnteredEmail } =
    useContext(PageContext);
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const handleOnClick = (email, navigate) => {
    localStorage.setItem("email", email);
    setEnteredEmail(email);
    dispatch(ladgerAction.setTimeline(null));
    setWelcomeHeaderContent("Backlinks");
    navigateTo(navigate);
  };
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentBacklinkId, setCurrentBacklinkId] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleEditClick = (backlink) => {
    setEditData(backlink);
    setShowEditModal(true);
  };
  const handleEditChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSaveEdit = async () => {
    try {
      setSaving(true);

      dispatch(updateBacklink(editData));

      toast.success("Backlink updated successfully");

      setShowEditModal(false);
    } catch (err) {
      toast.error("Update failed");
    } finally {
      setSaving(false);
    }
  };
  const columns = [
    {
      label: "Created At",
      accessor: "date_entered",
      headerClasses: "",
      icon: Calendar,

      onClick: (row) => handleOnClick(extractEmail(row?.post_author_email_c), "/"),
      classes: "truncate max-w-[200px]",
      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.date_entered}
        </span>
      )
    },
    {
      label: "AUTHOR",
      accessor: "post_author_email_c",
      headerClasses: "",
      icon: User2,
      classes: "truncate max-w-[200px]",
      onClick: (row) => handleOnClick(extractEmail(row?.post_author_email_c), "/contacts"),

      render: (row) => (
        <span className="font-medium text-gray-700 cursor-pointer">
          {row.post_author_email_c?.substring(0, 20)}
        </span>
      )
    },
    {
      label: "Target url",
      accessor: "target_url_c",
      headerClasses: "",
      icon: Globe,
      classes: "truncate ",
      render: (row) => (
        <span className="font-medium text-blue-700 ">
          <a
            href={row.target_url_c}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {row.target_url_c?.substring(0, 40)}...
          </a>        </span>
      )
    },
    {
      label: "Anchor Text ",
      accessor: "anchor_text_c",
      headerClasses: "",
      icon: Text,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-green-700 ">
          {row.anchor_text_c || "N/A"}
        </span>
      )
    },
    {
      label: "Expiry",
      accessor: "expiry_date_c",
      headerClasses: "",
      icon: Calendar,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="font-medium text-gray-700 ">
          {row?.expiry_date_c}
        </span>
      )
    },
    {
      label: "Link Type",
      accessor: "link_type",
      headerClasses: "",
      icon: ChartNoAxesColumn,
      classes: "truncate max-w-[300px]",

      render: (row) => (
        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
          {row.link_type}
        </span>
      )
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
            onClick={() => handleEditClick(row)}
            className="flex items-center gap-1 px-3 py-1  text-blue-700 rounded cursor-pointer"
          >
            <Pen className="w-5 h-5" />
          </button>

        </div>
      )
    },


  ]
  if (showDetail && currentBacklinkId) {
    return (
      <BacklinkDetailBox
        onClose={() => setShowDetail(false)}
        backlinkId={currentBacklinkId}
      />
    );
  }

  return (
    <>
      {showEditModal && editData && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-[500px] rounded-xl shadow-xl p-6 relative">
            {/* CLOSE */}

            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4"
            >
              <X />
            </button>

            <h2 className="text-xl font-semibold mb-6">Edit Backlink</h2>

            {/* AUTHOR */}

            <input
              type="text"
              name="post_author_name_c"
              value={editData.post_author_name_c || ""}
              onChange={handleEditChange}
              placeholder="Author Name"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* EMAIL */}

            <input
              type="email"
              name="post_author_email_c"
              value={editData.post_author_email_c || ""}
              onChange={handleEditChange}
              placeholder="Author Email"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* TARGET URL */}

            <input
              type="text"
              name="target_url_c"
              value={editData.target_url_c || ""}
              onChange={handleEditChange}
              placeholder="Target URL"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* ANCHOR TEXT */}

            <input
              type="text"
              name="anchor_text_c"
              value={editData.anchor_text_c || ""}
              onChange={handleEditChange}
              placeholder="Anchor Text"
              className="w-full border p-2 mb-3 rounded"
            />

            {/* EXPIRY */}

            <input
              type="date"
              name="expiry_date_c"
              value={editData.expiry_date_c || ""}
              onChange={handleEditChange}
              className="w-full border p-2 mb-4 rounded"
            />

            {/* LINK TYPE */}

            <select
              name="link_type"
              value={editData.link_type || ""}
              onChange={handleEditChange}
              className="w-full border p-2 mb-6 rounded"
            >
              <option value="dofollow">dofollow</option>
              <option value="nofollow">nofollow</option>
            </select>

            {/* ACTIONS */}

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 bg-gray-300 rounded"
              >
                Cancel
              </button>

              <button
                onClick={handleSaveEdit}
                disabled={saving}
                className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
              >
                {saving && (
                  <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
      <TableView tableData={backlinks} tableName={"Backlinks"} columns={columns} slice={"backlinks"} fetchNextPage={() => dispatch(getBacklinks({ page: pageIndex + 1 }))}   >
        <TableTitleBar Icon={Cable} title={"Backlinks"} titleClass={"text-teal-700"} />
        <Table headerStyle={"  bg-teal-600"} layoutStyle={"grid grid-cols-[200px_200px_1fr_200px_200px_200px_1fr]"} />
      </TableView>
    </>

  );
}