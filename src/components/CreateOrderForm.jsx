import React, { useState } from "react";

const ORDER_TYPES = ["GUEST POST", "LINK INSERTION", "BOTH"];

const CreateOrderForm = ({
  order,
  setOrder,
  creating = false,
  handleSubmit,
}) => {
  const [button, setButton] = useState(null);

  /* ---------------- DATE FORMAT ---------------- */
  const getFormattedDate = () => {
    const d = new Date();
    return d.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  /* ---------------- BASIC CHANGE ---------------- */
  const handleChange = (key, value) => {
    setOrder((prev) => ({
      ...prev,
      [key]: value,
      date_entered_formatted: getFormattedDate(),
    }));
  };

  /* ---------------- SEO LINKS ---------------- */
  const addSeoLink = () => {
    setOrder((prev) => ({
      ...prev,
      seo_backlinks: [
        ...(Array.isArray(prev.seo_backlinks) ? prev.seo_backlinks : []),
        {
          anchor_text_c: "",
          backlink_url: "",
          target_url_c: "",
          link_amount: "",
        },
      ],
    }));
  };

  const updateSeoLink = (index, key, value) => {
    const links = Array.isArray(order.seo_backlinks)
      ? [...order.seo_backlinks]
      : [];

    links[index] = {
      ...links[index],
      [key]: value,
    };

    const totalAmount = links.reduce(
      (sum, l) => sum + Number(l.link_amount || 0),
      0
    );

    setOrder((prev) => ({
      ...prev,
      seo_backlinks: links,
      total_amount_c: totalAmount.toString(),
    }));
  };

  const isFormValid = () => {
    if (!order.order_type) return false;

    if (!Array.isArray(order.seo_backlinks) || order.seo_backlinks.length === 0)
      return false;

    for (const link of order.seo_backlinks) {
      if (!link.anchor_text_c?.trim()) return false;

      if (!link.backlink_url?.trim())
        return false;

      if (!link.link_amount || Number(link.link_amount) <= 0) return false;

      if (
        (order.order_type === "LINK INSERTION" ||
          order.order_type === "BOTH") &&
        (!link.target_url_c?.trim())
      ) {
        return false;
      }
    }

    return true;
  };

  const formValid = isFormValid();

  /* ---------------- SUBMIT ---------------- */
  const onSubmit = (send) => {
    if (creating || !formValid) return;
    handleSubmit(send);
  };

  /* ---------------- RENDER ---------------- */
  return (
    <div className="space-y-6">
      {/* ORDER TYPE */}
      <select
        value={order.order_type || ""}
        onChange={(e) => handleChange("order_type", e.target.value)}
        className="border p-2 rounded w-full"
      >
        <option value="">Select Order Type</option>
        {ORDER_TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>

      {/* SEO LINKS */}
      {Array.isArray(order.seo_backlinks) &&
        order.seo_backlinks.map((link, index) => (
          <div
            key={index}
            className="border p-4 rounded-xl space-y-3 bg-gray-50"
          >
            <input
              placeholder="Anchor Text"
              value={link.anchor_text_c || ""}
              onChange={(e) =>
                updateSeoLink(index, "anchor_text_c", e.target.value)
              }
              className="border p-2 rounded w-full"
            />

            <input
              placeholder="Backlink URL"
              value={link.backlink_url || ""}
              onChange={(e) =>
                updateSeoLink(index, "backlink_url", e.target.value)
              }
              className="border p-2 rounded w-full"
            />

            {(order.order_type === "LINK INSERTION" ||
              order.order_type === "BOTH") && (
                <input
                  placeholder="Target URL"
                  value={link.target_url_c || ""}
                  onChange={(e) =>
                    updateSeoLink(index, "target_url_c", e.target.value)
                  }
                  className="border p-2 rounded w-full"
                />
              )}

            <input
              placeholder="Link Amount ($)"
              type="number"
              value={link.link_amount || ""}
              onChange={(e) =>
                updateSeoLink(index, "link_amount", e.target.value)
              }
              className="border p-2 rounded w-full"
            />
          </div>
        ))}

      {/* ADD LINK */}
      <button
        type="button"
        onClick={addSeoLink}
        className="px-4 py-2 bg-black text-white rounded-lg"
      >
        + Add Link
      </button>

      {/* TOTAL */}
      <div className="text-right font-semibold">
        Order Amount: ${order.total_amount_c || 0}
      </div>

      {/* ACTION BUTTONS */}
      <div className="grid grid-cols-2 gap-3 pt-4">
        <button
          disabled={!formValid}
          onClick={() => {
            setButton(1);
            onSubmit(false);
          }}
          className={`w-full px-3 py-2 rounded-lg text-white transition ${!formValid
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700"
            }`}
        >
          {creating && button === 1 ? "Saving..." : "Save"}
        </button>

        <button
          disabled={!formValid}
          onClick={() => {
            setButton(2);
            onSubmit(true);
          }}
          className={`w-full px-3 py-2 rounded-lg text-white transition ${!formValid
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {creating && button === 2 ? "Sending..." : "Save & Send"}
        </button>
      </div>
    </div>
  );
};

export default CreateOrderForm;
