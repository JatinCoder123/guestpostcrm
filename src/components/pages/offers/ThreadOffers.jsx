import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import SummaryCard from "../../SummaryCard";
import PageHeader from "../../PageHeader";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { buildTable } from "../../Preview";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { deleteOffer, offersAction, updateOffer } from "../../../store/Slices/offers";
import { LoadingChase } from "../../Loading";
import { toast } from "react-toastify";

export default function ThreadOffers({ threadId, email }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentOffers, setCurrentOffers] = useState([]);

  // 🔥 INLINE EDIT STATE
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});
  const { websites: websiteLists } = useSelector((state) => state.website);

  const { offers, deleteOfferId, deleting, updating, updateOfferId, message, error } = useSelector(
    (state) => state.offers
  );
  const { deals } = useSelector(
    (state) => state.deals
  );
  const { crmEndpoint } = useSelector((state) => state.user);
  const { handleMove } = useThreadContext();

  const [validWebsite, setValidWebsite] = useState([]);


  // 🔥 TEMPLATE FETCH
  const { data: templateData } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { name: "OfferORG" },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "TemplateData",
  });

  useEffect(() => {
    const threadOffers = offers.filter(
      (d) => d.thread_id == threadId
    );

    const threadDeals = deals.filter(
      (d) => d.thread_id == threadId
    );

    const valid = websiteLists.filter((w) => {
      // ❌ already used in OTHER offers
      const usedInOffers = threadOffers.some(
        (o) => o.website === w && o.id !== editData.id
      );

      // ❌ already used in deals
      const usedInDeals = threadDeals.some(
        (d) => d.website_c === w
      );

      return !usedInOffers && !usedInDeals;
    });
    const activeOffers = threadOffers.filter(o => o.offer_status == "active")
    setValidWebsite(valid);
    setCurrentOffers(activeOffers);
  }, [offers, deals, editData, threadId]);


  // 🔥 INLINE EDIT HANDLERS
  const handleEdit = (offer) => {
    setEditingId(offer.id);
    setEditData({ ...offer });
  };

  const handleSave = (id) => {
    dispatch(updateOffer(editData))
  };

  const handleCancel = () => {
    setEditingId(null);
  };

  const handleDelete = (id) => {
    dispatch(deleteOffer(email, id));
  };

  const handleCreate = () => {
    navigate(`/offers/${threadId}/create`, {
      state: { email },
    });
  };

  const handlePreview = () => {
    let html = templateData?.[0]?.body_html || "";
    const tableHtml = buildTable(
      currentOffers,
      "Offers",
      "website",
      "our_offer_c"
    );

    html = html
      .replace("{{USER_EMAIL}}", email)
      .replace("{{TABLE}}", tableHtml);

    handleMove({ email, threadId, reply: html });
  };
  useEffect(() => {
    if (!updating) {
      setEditingId(null);
    }
    if (message) {
      toast.success(message)
      dispatch(offersAction.clearAllMessages())
    }
    if (error) {
      toast.error(error)
      dispatch(offersAction.clearAllErrors())
    }
  }, [updating, message, error]);
  return (
    <div className="w-full flex gap-6 items-start">

      {/* 🔥 TABLE */}
      <div className="flex-1 border rounded-2xl p-6 bg-white shadow-sm">

        <PageHeader title={"OFFERS"} onAdd={handleCreate} />

        {/* HEADER */}
        <div className="grid grid-cols-10 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
          <div className="col-span-1">No</div>
          <div className="col-span-3">Website</div>
          <div className="col-span-2 text-center">Client Offer</div>
          <div className="col-span-2 text-center">Our Offer</div>
          <div className="col-span-2 text-center">Actions</div>
        </div>

        {/* ROWS */}
        <div className="space-y-2 mt-2">
          {currentOffers.length === 0 && (
            <div className="text-center text-gray-400 py-6">
              No offers found
            </div>
          )}

          {currentOffers.map((offer, index) => {
            const isEditing = editingId === offer.id;

            return (
              <motion.div
                key={offer.id}
                className="grid grid-cols-10 items-center px-4 py-3 bg-gray-50 rounded-xl border"
              >
                {/* No */}
                <div className="col-span-1 font-semibold text-gray-500">
                  {index + 1}
                </div>

                {/* Website */}
                <div className="col-span-3">
                  {isEditing ? (
                    <select
                      value={editData.website}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          website: e.target.value,
                        })
                      }
                      className="w-full border rounded-lg px-2 py-1"
                    >
                      {validWebsite.map((site, i) => (
                        <option key={i} value={site}>
                          {site}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="text-blue-600 truncate block">
                      {offer.website}
                    </span>
                  )}
                </div>

                {/* Client Offer */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.client_offer_c}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          client_offer_c: e.target.value,
                        })
                      }
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <span>${offer.client_offer_c || "-"}</span>
                  )}
                </div>

                {/* Our Offer */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.our_offer_c}
                      onChange={(e) =>
                        setEditData({
                          ...editData,
                          our_offer_c: e.target.value,
                        })
                      }
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <span className="text-green-600">
                      ${offer.our_offer_c || "-"}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-2">
                  {isEditing ? (
                    <>
                      <button
                        onClick={() => handleSave(offer.id)}
                        disabled={updating && editingId === offer.id}
                        className={`px-3 py-1 rounded-lg text-sm text-white transition
        ${updating && editingId === offer.id
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {updating && editingId === offer.id ? (
                          <span className="flex items-center gap-2">
                            <LoadingChase size="16" color="white" />
                            Saving...
                          </span>
                        ) : (
                          "Save"
                        )}
                      </button>

                      <button
                        onClick={handleCancel}
                        disabled={updating && editingId === offer.id}
                        className={`px-3 py-1 rounded-lg text-sm text-white transition
        ${updating && editingId === offer.id
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-gray-400 hover:bg-gray-500"
                          }`}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit(offer)}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(offer.id)}
                        className="p-2.5 rounded-lg bg-red-100 text-red-600"
                        disabled={
                          deleting && deleteOfferId === offer.id
                        }
                      >
                        {deleting && deleteOfferId === offer.id ? (
                          <LoadingChase size="18" color="red" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 🔥 SUMMARY */}
      <SummaryCard
        data={currentOffers}
        type={"offers"}
        websiteKey={"website"}
        amountKey={"our_offer_c"}
      >
        <button
          disabled={currentOffers.length === 0}
          onClick={handlePreview}
          className={`flex-1 py-3 rounded-xl font-medium text-white transition
          ${currentOffers.length === 0
              ? "bg-gray-300"
              : "bg-indigo-600 hover:bg-indigo-700"
            }`}
        >
          Preview
        </button>
      </SummaryCard>
    </div>
  );
}