import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import SummaryCard from "../../SummaryCard";
import PageHeader from "../../PageHeader";
import useModule from "../../../hooks/useModule";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import { buildTable } from "../../Preview";
import { useThreadContext } from "../../../hooks/useThreadContext";
import {
  deleteOffer,
  offersAction,
  updateOffer,
} from "../../../store/Slices/offers";
import { LoadingChase } from "../../Loading";
import { toast } from "react-toastify";
import { Save, Send, X, Loader2 } from "lucide-react";
import IconButton from "../../ui/Buttons/IconButton";
import { extractEmail } from "../../../assets/assets";

export default function ThreadOffers({ threadId, email, id }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [send, setSend] = useState(false);
  const [currentOffers, setCurrentOffers] = useState([]);
  const [selectedOffers, setSelectedOffers] = useState([]);
  const toggleSelect = (id) => {
    setSelectedOffers((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
    if (editingIds.length > 0) {
      if (!selectedOffers.includes(id)) {
        const selectedData = currentOffers.find(o => o.id == id);

        setEditingIds(prev => [...prev, id]);
        setEditDataMap(prev => ({ ...prev, [id]: { ...selectedData } }));
      }
      else {
        setEditingIds(prev => prev.filter(p => p != id));
        setEditDataMap(prev => {
          const { [id]: _, ...rest } = prev
          return rest
        });
      }

    }
  };
  const handleSelectAll = () => {
    if (selectedOffers.length === currentOffers.length) {
      setSelectedOffers([]);
      setEditingIds([]);
      setEditDataMap({});
    } else {
      setSelectedOffers(currentOffers.map((o) => o.id));
    }
  };
  const [editingIds, setEditingIds] = useState([]);
  const [editDataMap, setEditDataMap] = useState({});
  const { websites: websiteLists } = useSelector((state) => state.website);
  const { offers, deleteOfferId, deleting, updating, message, error } =
    useSelector((state) => state.offers);
  const { deals } = useSelector((state) => state.deals);
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
      (d) => extractEmail(d.real_name ?? d.email) == email,
    );

    const threadDeals = deals.filter(
      (d) => extractEmail(d.real_name ?? d.email) == email,
    );

    const valid = websiteLists.filter((w) => {
      const usedInOffers = threadOffers.some(
        (o) => o.website === w && !editingIds.includes(o.id),
      );

      const usedInDeals = threadDeals.some((d) => d.website_c === w);

      return !usedInOffers && !usedInDeals;
    });
    let activeOffers = [];
    if (id) {
      activeOffers = threadOffers.filter((o) => o.id == id);
    } else {
      activeOffers = threadOffers.filter((o) => o.offer_status == "active");
    }
    setValidWebsite(valid);
    setCurrentOffers(activeOffers);
  }, [offers, deals, editDataMap, email, id]);

  // 🔥 INLINE EDIT HANDLERS
  const handleEdit = (offers) => {
    const ids = offers.map(o => o.id);

    const dataMap = {};
    offers.forEach(o => {
      dataMap[o.id] = { ...o };
    });

    setEditingIds(ids);
    setEditDataMap(dataMap);
  };

  const handleSave = (offers, isSend = false) => {
    setSend(isSend); // 🔥 track intent
    dispatch(updateOffer({ email, offers }));
  };

  const handleDelete = (id, offer) => {
    dispatch(deleteOffer(email, id, offer));
  };

  const handleCreate = () => {
    navigate(`/offers/create`, {
      state: {
        email,
        threadId,
      },
    });
  };

  const handlePreview = (offersData = currentOffers) => {
    let html = templateData?.[0]?.body_html || "";

    const tableHtml = buildTable(
      offersData,
      "Offers",
      "website",
      "our_offer_c",
    );

    html = html
      .replace("{{USER_EMAIL}}", email)
      .replace("{{TABLE}}", tableHtml);

    handleMove({ email, threadId, reply: html });
  };
  useEffect(() => {
    if (!updating) {
      setEditingIds([]);
      setSelectedOffers([])
      setEditDataMap({})
    }

    if (message) {
      toast.success(message);
      if (message?.includes("Updated")) {
        if (send) {
          handlePreview(editingIds.map(id => editDataMap[id]));
          setSend(false);
        }
        dispatch(offersAction.clearAllMessages());
      }
    }

    if (error) {
      toast.error(error);
      setSend(false); // reset on error too
      dispatch(offersAction.clearAllErrors());
    }
  }, [updating, message, error]);
  const isMultiEditValid = editingIds.every(id => {
    const data = editDataMap[id];
    return (
      data?.website &&
      Number(data?.client_offer_c) >= 0 &&
      Number(data?.our_offer_c) > 0
    );
  });
  return (
    <div className="w-full flex gap-6 items-start">
      {/* 🔥 TABLE */}

      <div className="flex-1 relative border rounded-2xl p-6 bg-white shadow-sm">
        <PageHeader title={"OFFERS"} onAdd={handleCreate} />
        {selectedOffers.length > 0 && (
          <div className="mb-4 flex items-center justify-end rounded-xl">
            <div className="flex gap-3">

              {editingIds.length > 0 ? (
                <>
                  <IconButton
                    icon={Save}
                    label="Save"
                    onClick={() => handleSave(editingIds.map(id => editDataMap[id]), false)}
                    loading={updating && !send}
                    disabled={!isMultiEditValid}
                    className="bg-blue-100 hover:bg-blue-200"
                  />

                  <IconButton
                    icon={Send}
                    label="Save & Send"
                    onClick={() => handleSave(editingIds.map(id => editDataMap[id]), true)}
                    disabled={!isMultiEditValid}

                    loading={updating && send}

                    className="bg-green-100 hover:bg-green-200"
                  />
                  <IconButton
                    icon={X}
                    label="Cancel"
                    onClick={() => setEditingIds([])}
                    className="bg-red-100 hover:bg-red-200"
                  />
                </>
              ) : (
                <>
                  <IconButton
                    icon={Pencil}
                    label="Edit"
                    onClick={() => {
                      const selectedData = currentOffers.filter(o =>
                        selectedOffers.includes(o.id)
                      );
                      handleEdit(selectedData);
                    }}
                    className="bg-blue-100 hover:bg-blue-200"
                  />

                  <IconButton
                    icon={Send}
                    label="Send"
                    onClick={() => {
                      const selectedData = currentOffers.filter(o =>
                        selectedOffers.includes(o.id)
                      );
                      handlePreview(selectedData);
                    }}
                    className="bg-green-100 hover:bg-green-200"
                  />

                  <IconButton
                    icon={Trash2}
                    label="Delete"
                    onClick={() => {
                      selectedOffers.forEach(id => {
                        const offer = currentOffers.find(o => o.id === id);
                        handleDelete(id, offer);
                      });
                      setSelectedOffers([]);
                    }}
                    className="bg-red-100 hover:bg-red-200"
                  />
                </>
              )}
            </div>
          </div>
        )}
        {/* HEADER */}
        <div className="grid grid-cols-10 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">


          <div onClick={handleSelectAll} className="col-span-1 cursor-pointer ">
            <input
              type="checkbox"
              checked={selectedOffers.length === currentOffers.length}

            />
          </div>
          <div className="col-span-3">Website</div>
          <div className="col-span-2 text-center">Client Offer</div>
          <div className="col-span-2 text-center">Our Offer</div>
          <div className="col-span-2 text-center ml-auto">Actions</div>
        </div>

        {/* ROWS */}
        <div className="space-y-2 mt-2">
          {currentOffers.length === 0 && (
            <div className="text-center text-gray-400 py-6">
              No offers found
            </div>
          )}

          {currentOffers.map((offer, index) => {
            const isEditing = editingIds.includes(offer.id);
            const editData = editDataMap[offer.id] || {};

            return (
              <motion.div
                key={offer.id}
                className="grid grid-cols-10 items-center px-4 py-3 bg-gray-50 rounded-xl border"
              >
                {/* No */}

                <div onClick={() => toggleSelect(offer.id)}
                  className="col-span-1 font-semibold text-gray-500 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedOffers.includes(offer.id)}
                  />
                </div>

                {/* Website */}
                <div className="col-span-3">
                  {isEditing ? (
                    <select
                      value={editData.website}
                      onChange={(e) =>
                        setEditDataMap(prev => ({
                          ...prev,
                          [offer.id]: {
                            ...prev[offer.id],
                            website: e.target.value,
                          }
                        }))
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
                  <span>${offer.client_offer_c || "-"}</span>

                </div>

                {/* Our Offer */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.our_offer_c}
                      min={1}
                      onChange={(e) =>
                        setEditDataMap(prev => ({
                          ...prev,
                          [offer.id]: {
                            ...prev[offer.id],
                            our_offer_c: e.target.value,
                          }
                        }))
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
                <div className="col-span-2 flex justify-center gap-2 ml-auto">
                  {selectedOffers.length == 0 ? (isEditing ? (
                    <div className="flex gap-2">
                      <IconButton
                        icon={Save}
                        label="Save"
                        loading={editingIds.includes(offer.id) && updating && !send}
                        onClick={() => handleSave([editData], false)}
                        disabled={!isMultiEditValid || selectedOffers.length > 0}
                      />

                      <IconButton
                        icon={Send}
                        label="Save & Send"
                        loading={editingIds.includes(offer.id) && updating && send}
                        onClick={() => handleSave([editData], true)}
                        disabled={!isMultiEditValid || selectedOffers.length > 0}
                      />

                      <IconButton
                        icon={X}
                        label="Cancel"
                        onClick={() => setEditingIds([])}
                        className="bg-red-100 hover:bg-red-200"
                        disabled={selectedOffers.length > 0}
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit([offer])}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(offer.id, offer)}
                        className="p-2.5 rounded-lg bg-red-100 text-red-600"
                        disabled={deleting && deleteOfferId === offer.id}
                      >
                        {deleting && deleteOfferId === offer.id ? (
                          <LoadingChase size="18" color="red" />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </>
                  )) : "-"}

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
          disabled={currentOffers.length === 0 || editingIds.length > 0}
          onClick={() => handlePreview()}
          className={`flex-1 py-3 rounded-xl font-medium text-white transition
          ${currentOffers.length === 0 || editingIds.length > 0
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
