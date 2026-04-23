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
import { LoadingChase } from "../../Loading";
import { toast } from "react-toastify";
import { Save, Send, X, Loader2 } from "lucide-react";
import IconButton from "../../ui/Buttons/IconButton";
import {
  dealsAction,
  deleteDeal,
  updateDeal,
} from "../../../store/Slices/deals";
import { extractEmail } from "../../../assets/assets";

export default function ThreadDeals({ threadId, email, id }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [send, setSend] = useState(false);
  const [currentDeals, setCurrentDeals] = useState([]);
  const [selectedDeals, setSelectedDeals] = useState([]);
  const [editingIds, setEditingIds] = useState([]);
  const [editDataMap, setEditDataMap] = useState({});
  const { websites: websiteLists } = useSelector((state) => state.website);

  const { deals, deleting, updating, message, error, deleteDealId } =
    useSelector((state) => state.deals);
  const { offers } = useSelector((state) => state.offers);
  const { crmEndpoint } = useSelector((state) => state.user);
  const { handleMove } = useThreadContext();

  const [validWebsite, setValidWebsite] = useState([]);

  // 🔥 TEMPLATE FETCH
  const { data: templateData } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: { name: "DealORG" },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "TemplateData",
  });

  useEffect(() => {
    const threadOffers = offers.filter(
      (d) =>
        extractEmail(d.real_name ?? d.email) == email &&
        d.offer_status == "active",
    );

    const threadDeals = deals.filter(
      (d) => extractEmail(d.real_name ?? d.email) == email,
    );

    const valid = websiteLists.filter((w) => {
      const usedInOffers = threadOffers.some((o) => o.website === w);

      const usedInDeals = threadDeals.some(
        (d) => d.website_c === w && !editingIds.includes(d.id),
      );

      return !usedInOffers && !usedInDeals;
    });
    let activeDeals = [];
    if (id) {
      activeDeals = threadDeals.filter((o) => o.id == id);
    } else {
      activeDeals = threadDeals.filter((o) => o.status == "active");
    }
    setValidWebsite(valid);
    setCurrentDeals(activeDeals);
  }, [offers, deals, editDataMap, email, id]);
  const toggleSelect = (id) => {
    setSelectedDeals((prev) =>
      prev.includes(id)
        ? prev.filter((i) => i !== id)
        : [...prev, id]
    );
    if (editingIds.length > 0) {
      if (!selectedDeals.includes(id)) {
        const selectedData = currentDeals.find(o => o.id == id);

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
    if (selectedDeals.length === currentDeals.length) {
      setSelectedDeals([]);
      setEditingIds([]);
      setEditDataMap({});
    } else {
      setSelectedDeals(currentDeals.map((d) => d.id));
    }
  };
  // 🔥 INLINE EDIT HANDLERS
  const handleEdit = (deals) => {
    const ids = deals.map((d) => d.id);

    const map = {};
    deals.forEach((d) => {
      map[d.id] = { ...d };
    });

    setEditingIds(ids);
    setEditDataMap(map);
  };
  const handleSave = (deals, isSend = false) => {
    setSend(isSend); // 🔥 track intent
    dispatch(updateDeal({ deals, email }));
  };

  const handleDelete = (deal, id) => {
    dispatch(deleteDeal(deal, email, id));
  };

  const handleCreate = () => {
    navigate(`/deals/create`, {
      state: {
        email,
        threadId,
      },
    });
  };

  const handlePreview = (dealsData = currentDeals) => {
    let html = templateData?.[0]?.body_html || "";

    const tableHtml = buildTable(dealsData, "Deals", "website_c", "dealamount");

    html = html
      .replace("{{USER_EMAIL}}", email)
      .replace("{{TABLE}}", tableHtml);

    handleMove({ email, threadId, reply: html });
  };
  useEffect(() => {
    if (!updating) {
      setEditingIds([]);
      setSelectedDeals([]);
      setEditDataMap({});
    }

    if (message) {
      toast.success(message);
      if (message?.includes("Updated")) {
        if (send) {
          handlePreview(editingIds.map(id => editDataMap[id]));
          setSend(false);
        }
      }

      dispatch(dealsAction.clearAllMessages());
    }

    if (error) {
      toast.error(error);
      setSend(false); // reset on error too
      dispatch(dealsAction.clearAllErrors());
    }
  }, [updating, message, error]);

  const isMultiEditValid = editingIds.every(id => {
    const data = editDataMap[id];
    return (
      data.dealamount === "" ||
      data.dealamount === null ||
      Number(data.dealamount) <= 0
    );
  });
  return (
    <div className="w-full flex gap-6 items-start">
      {/* 🔥 TABLE */}
      <div className="flex-1 relative border rounded-2xl p-6 bg-white shadow-sm">
        <PageHeader title={"DEALS"} onAdd={handleCreate} />
        {selectedDeals.length > 0 && (
          <div className="mb-4 flex justify-end gap-3">

            {editingIds.length > 0 ? (
              <>
                <IconButton
                  icon={Save}
                  label="Save"
                  className="bg-blue-100 hover:bg-blue-200"
                  loading={updating && !send}

                  onClick={() =>
                    handleSave(editingIds.map(id => editDataMap[id]), false)
                  }
                />

                <IconButton
                  icon={Send}
                  label="Save & Send"
                  className="bg-green-100 hover:bg-green-200"
                  loading={updating && send}
                  onClick={() =>
                    handleSave(editingIds.map(id => editDataMap[id]), true)
                  }
                />

                <IconButton
                  icon={X}
                  label="Cancel"
                  className="bg-red-100 hover:bg-red-200"

                  onClick={() => {
                    setEditingIds([]);
                    setEditDataMap({});
                  }}
                />
              </>
            ) : (
              <>
                <IconButton
                  icon={Pencil}
                  label="Edit"
                  onClick={() =>
                    handleEdit(
                      currentDeals.filter(d =>
                        selectedDeals.includes(d.id)
                      )
                    )
                  }
                  className="bg-blue-100 hover:bg-blue-200"

                />
                <IconButton
                  icon={Send}
                  label="Send"
                  onClick={() =>
                    handlePreview(
                      currentDeals.filter(d =>
                        selectedDeals.includes(d.id)
                      )
                    )
                  }
                  className="bg-green-100 hover:bg-green-200"

                />
                <IconButton
                  icon={Trash2}
                  label="Delete"
                  onClick={() => {
                    selectedDeals.forEach(id => {
                      const deal = currentDeals.find(d => d.id === id);
                      handleDelete(deal, id);
                    });
                  }}
                  className="bg-red-100 hover:bg-red-200"

                />


              </>
            )}

          </div>
        )}
        {/* HEADER */}
        <div className="grid grid-cols-10 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
          <div className="col-span-1">
            <input
              type="checkbox"
              checked={selectedDeals.length === currentDeals.length}
              onChange={handleSelectAll}
            />
          </div>
          <div className="col-span-3">Website</div>
          <div className="col-span-2 text-center">Deal Amount</div>
          <div className="col-span-2 text-center">Note</div>
          <div className="col-span-2 text-center ml-auto">Actions</div>
        </div>

        {/* ROWS */}
        <div className="space-y-2 mt-2">
          {currentDeals.length === 0 && (
            <div className="text-center text-gray-400 py-6">No Deal found</div>
          )}

          {currentDeals.map((deal, index) => {
            const isEditing = editingIds.includes(deal.id);
            const editData = editDataMap[deal.id] || {};
            return (
              <motion.div
                key={deal.id}
                className="grid grid-cols-10 items-center px-4 py-3 bg-gray-50 rounded-xl border"
              >
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    checked={selectedDeals.includes(deal.id)}
                    onChange={() => toggleSelect(deal.id)}
                  />
                </div>

                {/* Website */}
                <div className="col-span-3">
                  {isEditing ? (
                    <select
                      value={editData.website_c}
                      onChange={(e) =>
                        setEditDataMap(prev => ({
                          ...prev,
                          [deal.id]: {
                            ...prev[deal.id],
                            website_c: e.target.value,
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
                      {deal.website_c}
                    </span>
                  )}
                </div>

                {/* Client Offer */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.dealamount}
                      min={1}
                      onChange={(e) =>
                        setEditDataMap(prev => ({
                          ...prev,
                          [deal.id]: {
                            ...prev[deal.id],
                            dealamount: e.target.value,
                          }
                        }))
                      }
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <span>${deal.dealamount || "-"}</span>
                  )}
                </div>

                {/* Our Offer */}
                <div className="col-span-2 text-center">
                  {isEditing ? (
                    <input
                      type="textarea"
                      value={editData.note}
                      onChange={(e) =>
                        setEditDataMap(prev => ({
                          ...prev,
                          [deal.id]: {
                            ...prev[deal.id],
                            note: e.target.value,
                          }
                        }))
                      }
                      className="w-20 border rounded px-2 py-1 text-center"
                    />
                  ) : (
                    <span className="text-green-600">{deal.note || "-"}</span>
                  )}
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-center gap-2 ml-auto">
                  {selectedDeals.length == 0 ? (isEditing ? (
                    <div className="flex gap-2">
                      <IconButton
                        icon={Save}
                        label="Save"
                        disabled={isMultiEditValid}
                        loading={editingIds.includes(deal.id) && updating && !send}
                        onClick={() => handleSave([editData], false)}
                      />

                      <IconButton
                        icon={Send}
                        label="Save & Send"
                        disabled={isMultiEditValid}
                        loading={editingIds.includes(deal.id) && updating && send}
                        onClick={() => handleSave([editData], true)}
                      />

                      <IconButton
                        icon={X}
                        label="Cancel"
                        onClick={() => setEditingIds([])}
                        className="bg-red-100 hover:bg-red-200"
                      />
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleEdit([deal])}
                        className="p-2 rounded-lg bg-blue-100 text-blue-600"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(deal, deal.id)}
                        className="p-2.5 rounded-lg bg-red-100 text-red-600"
                        disabled={deleting && deleteDealId === deal.id}
                      >
                        {deleting && deleteDealId === deal.id ? (
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
        data={currentDeals}
        type={"deals"}
        websiteKey={"website_c"}
        amountKey={"dealamount"}
      >
        <button
          disabled={currentDeals.length === 0 || editingIds.length > 0}
          onClick={() => handlePreview()}
          className={`flex-1 py-3 rounded-xl font-medium text-white transition
          ${currentDeals.length === 0 || editingIds.length > 0
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
