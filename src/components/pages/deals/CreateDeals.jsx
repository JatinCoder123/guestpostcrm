import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import SummaryCard from "../../SummaryCard";
import PageHeader from "../../PageHeader";
import { buildTable } from "../../Preview";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { Trash2 } from "lucide-react";
import { Save, Send } from "lucide-react";
import IconButton from "../../ui/Buttons/IconButton";
import { toast } from "react-toastify";
import { createDeal, dealsAction, getDeals } from "../../../store/Slices/deals";
import { getOffers } from "../../../store/Slices/offers";
import { offerKeys, useOffersByEmail } from "../../../queries/offers.queries";
import { useTemplateByName } from "../../../queries/template.queries";
import { dealKeys, useDealsByEmail } from "../../../queries/deals.queries";
import { useContact } from "../../../queries/contact.queries";
import { queryClient } from "../../../lib/queryClient";

// 🔥 renamed component also
export default function CreateDeals({ email }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { websites: websiteLists } = useSelector((state) => state.website);
  const { showBrandTimeline } = useSelector((state) => state.brandTimeline);
  // 🔥 now using deals everywhere
  const { creating, message, error } = useSelector(
    (state) => state.deals,
  );
  const { data: dealsData } = useDealsByEmail(email)
  const { data: contactData } = useContact(email)
  const threadId = contactData?.contact?.thread_id
  const deals = dealsData?.data ?? []
  const { data: offerData } = useOffersByEmail(email);
  const offers = offerData?.data ?? []

  const [send, setSend] = useState(false);
  const { handleMove } = useThreadContext();

  const { data: templateData } = useTemplateByName("DealORG");
  // 🔥 NEW STATE (deal structure)
  const [newDeals, setNewDeals] = useState([{ website_c: "", dealamount: "" }]);

  const [validWebsite, setValidWebsite] = useState([]);

  const getAvailableWebsites = (currentIndex) => {
    return validWebsite.filter((site) => {
      return !newDeals.some(
        (deal, i) => i !== currentIndex && deal.website_c === site,
      );
    });
  };

  // 🔥 FILTER VALID WEBSITES
  useEffect(() => {
    const valid = websiteLists.filter((w) => {
      const usedInDeals = deals.some((d) => d.website_c === w && d.status !== "expire");

      return !usedInDeals;
    });
    setValidWebsite(valid);
  }, [offers, deals, email]);

  // 🔥 HANDLERS
  const handleAddRow = () => {
    setNewDeals([...newDeals, { website_c: "", dealamount: "" }]);
  };

  const isFormValid =
    newDeals.length > 0 &&
    newDeals.every((deal) => deal.website_c && !(deal.dealamount === "" ||
      deal.dealamount === null ||
      Number(deal.dealamount) <= 0));

  const canAddRow = isFormValid;

  const handleChangeRow = (index, field, value) => {
    const updated = [...newDeals];
    updated[index][field] = value;
    setNewDeals(updated);
  };

  const handleRemoveRow = (index) => {
    setNewDeals(newDeals.filter((_, i) => i !== index));
  };

  // 🔥 SAVE DEAL
  const handleSave = async (isSend = false) => {
    setSend(isSend);

    dispatch(createDeal({ threadId, email, deals: newDeals, isSend, contactId: contactData?.contact?.id }));
  };

  const handlePreview = () => {
    let html = templateData?.[0]?.body_html || "";

    const tableHtml = buildTable(newDeals, "Deals", "website_c", "dealamount");

    html = html
      .replace("{{USER_EMAIL}}", email)
      .replace("{{TABLE}}", tableHtml);

    handleMove({ email, threadId, reply: html });
  };

  useEffect(() => {
    if (message) {
      toast.success(message);
      queryClient.invalidateQueries({ queryKey: [dealKeys.all, offerKeys.all] })
      if (message?.includes("Created")) {
        if (send) {
          setSend(false);
          dispatch(dealsAction.clearAllMessages());
          handlePreview();
        } else {
          navigate(-1);
          dispatch(dealsAction.clearAllMessages());
        }
      }
    }

    if (error) {
      toast.error(error);
      setSend(false);
      dispatch(dealsAction.clearAllErrors());
    }
  }, [message, error]);
  useEffect(() => {
    const currentOfferWithoutDeal = offers.filter((o) => {
      const isSameThread = (o.thread_id == threadId && o.offer_status !== "expired");

      // ✅ check against ALL deals (not only active)
      const alreadyHasDeal = deals.some(
        (d) => d.thread_id == threadId && d.website_c == o.website,
      );

      return isSameThread && !alreadyHasDeal;
    });

    if (currentOfferWithoutDeal?.length > 0) {
      const newDeals = currentOfferWithoutDeal.map((offer) => ({
        website_c: offer.website,
        dealamount: offer.our_offer_c,
      }));

      setNewDeals(newDeals);
    }
  }, [deals, offers, threadId]);
  return (
    <div className="w-full flex gap-6 items-start">
      {/* LEFT SIDE */}
      <div className="flex-1 border rounded-2xl p-6 bg-white shadow-sm">
        <PageHeader title={"Create Deals"} showAdd={false} />

        {/* HEADER */}
        <div className="grid grid-cols-8 px-4 py-2 text-xs font-semibold text-gray-500 uppercase border-b">
          <div className="col-span-3">Website</div>
          <div className="col-span-3 text-center">Deal Amount</div>
          <div className="col-span-1 text-center ml-auto">Action</div>
        </div>

        {/* ROWS */}
        <div className="space-y-2 mt-2">
          {newDeals.map((row, index) => (
            <motion.div
              key={index}
              className="grid grid-cols-8 items-center px-4 py-3 bg-gray-50 rounded-xl border"
            >

              {/* WEBSITE */}
              <div className="col-span-3 relative">
                <select
                  value={row.website_c}
                  onChange={(e) =>
                    handleChangeRow(index, "website_c", e.target.value)
                  }
                  className="w-full border rounded-lg px-2 py-1"
                >
                  <option value="">Select</option>
                  {getAvailableWebsites(index).map((site, i) => (
                    <option key={i} value={site}>
                      {site}
                    </option>
                  ))}
                </select>
              </div>

              {/* DEAL AMOUNT */}
              <div className="col-span-3 text-center">
                <input
                  type="number"
                  value={row.dealamount}
                  min={1}
                  onChange={(e) =>
                    handleChangeRow(index, "dealamount", e.target.value)
                  }
                  className="w-24 border rounded px-2 py-1 text-center"
                />
              </div>

              {/* DELETE */}
              <div className="text-center ml-auto">
                <button
                  onClick={() => handleRemoveRow(index)}
                  className="text-red-500 cursor-pointer"
                >
                  <Trash2 />
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ADD */}
        <button
          onClick={handleAddRow}
          disabled={!canAddRow}
          className={`mt-4 px-4 py-2 rounded-lg
      ${canAddRow ? "bg-blue-100 text-blue-600" : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
        >
          + Add Deal
        </button>
      </div>

      {/* SUMMARY */}
      <SummaryCard
        data={newDeals}
        type={"deals"}
        websiteKey={"website_c"}
        amountKey={"dealamount"}
      >
        <div className="flex gap-2 w-full justify-evenly">
          <IconButton
            icon={Save}
            label="Save"
            onClick={() => handleSave(false)}
            loading={creating && !send}
            disabled={!isFormValid}
          />

          <IconButton
            icon={Send}
            label="Save & Send"
            onClick={() => handleSave(true)}
            loading={creating && send}
            disabled={!isFormValid}
          />
        </div>
      </SummaryCard>
    </div>
  );
}
