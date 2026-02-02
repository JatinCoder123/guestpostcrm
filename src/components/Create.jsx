import { useEffect, useState, useMemo } from "react";
import { Eye, MoveLeft, Pencil, Plus, ShoppingBasket, ShoppingCart, Trash } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { LoadingChase } from "./Loading";
import { OrderView } from "./OrderView";
import PageLoader from "./PageLoader";

export default function Create({
  data,
  email,
  validWebsite = [],
  setData,
  type,
  pageType,
  creating,
  deleting,
  deleteId,
  sending,
  fields,
  lists = [],
  submitData,
  sendHandler,
  handleDelete,
  websiteKey = "website",
  orderID = "order_id",
  handleUpdate,
  updating,
  renderPreview,
  amountKey,
  setNewDealsCreated
}) {
  const navigate = useNavigate();
  const { loading, message } = useSelector((state) => state.threadEmail);
  const [button, setButton] = useState(1);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);
  useEffect(() => {
    if (activeIndex >= data.length && data.length > 0)
      setActiveIndex(data.length - 1);
  }, [data.length, activeIndex]);

  const removeData = (id) => {
    setData((prev) => prev.filter((d) => d.id !== id));
  };

  const updateData = (idx, patch) => {
    setData((prev) => {
      const next = prev.map((d, i) => (i === idx ? { ...d, ...patch } : d));
      return next;
    });
  };
  const addData = () => {
    const newData = getEmptyData(fields);
    setData((prev) => [newData, ...prev]);
  };

  const getEmptyData = (fields) => {
    const newData = { id: `${Date.now()}${Math.random()}` };
    fields.forEach((field) => {
      newData[field.name] = "";
    });
    newData["email"] = email;

    return newData;
  };

  const handelChange = (idx = null, field, e) => {
    const value = e.target.value;

    if (field === websiteKey) {
      const alreadyUsed = data.some(
        (d, i) => i !== idx && d[websiteKey] === value
      );

      if (alreadyUsed) {
        toast.error("This website is already used in another deal");
        return;
      }
    }

    updateData(idx, { [field]: value });
  };

  const valid = useMemo(() => {
    if (data.length > 0) {
      if (type == "deals") {
        return data.every(
          (d) =>
            String(
              d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]
            ).trim() !== "" &&
            Number(d[`${type == "deals" ? "dealamount" : "total_amount_c"}`]) >
            0 &&
            String(d[websiteKey]).trim() !== ""
        );
      } else if (type == "offers") {
        return data.every(
          (d) =>
            String(d["client_offer_c"]).trim() !== "" &&
            Number(d["client_offer_c"]) > 0 &&
            String(d[websiteKey]).trim() !== ""
        );
      }
    }
    return false;
  }, [data]);

  useEffect(() => {
    if (message) {
      navigate(-1);
    }
  }, [message]);

  const handleSubmit = (send = false) => {
    if (data.length === 0) {
      toast.error(`No ${type} to submit.`);
      return;
    }
    if (!valid) {
      toast.error(`Please validate all ${type} before submitting.`);
      return;
    }
    submitData(data, send);
  };
  return (
    <>
      {(updating || sending || creating) && <PageLoader />}

      <div className="w-full min-h-[80vh] p-6 bg-gray-50 flex justify-center">
        <div className="w-full flex gap-6">
          {/* LEFT SECTION */}
          <div className="col-span-12 flex-1 lg:col-span-8">
            <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-200 relative">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                  >
                    <MoveLeft size={16} />
                  </button>
                  <h3 className="text-2xl font-semibold">{`${pageType == "view"
                    ? ""
                    : pageType.charAt(0).toUpperCase() + pageType.slice(1)
                    } ${type.charAt(0).toUpperCase() + type.slice(1)}`}</h3>
                </div>
                {pageType == "view" && (
                  <div className="flex items-center gap-3">
                    {type == "orders" ? (
                      <>
                        <button
                          onClick={() => navigate("/orders", { state: { email } })}
                          className="px-3 py-2 bg-green-100 text-green-700 hover:rounded-full transition-all duration-300 rounded-lg cursor-pointer"
                        >
                          <ShoppingCart />
                        </button>
                        <button
                          onClick={() => setShowPreview(true)}
                          className="px-3 py-2 bg-blue-100 text-blue-700 hover:rounded-full transition-all duration-300 rounded-lg cursor-pointer"
                        >
                          <Eye />
                        </button>


                      </>

                    ) : (
                      <button
                        onClick={() =>
                          navigate(`/${type}/create`, { state: { email } })
                        }
                        className="inline-flex items-center gap-2 "
                      >
                        <img
                          width="40"
                          height="40"
                          src="https://img.icons8.com/arcade/64/plus.png"
                          alt="plus"
                        />{" "}
                      </button>
                    )}

                  </div>
                )}
                {pageType == "create" && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={addData}
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg shadow hover:bg-blue-700"
                    >
                      <Plus size={16} /> Add
                    </button>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {data.length > 0 &&
                  data.map((item, itemIndex) => (
                    <div key={item.id} index={itemIndex}>
                      <div
                        className={`bg-white relative border border-gray-100 p-6 ${pageType == "edit" && "pb-15"
                          } rounded-2xl shadow-sm `}
                      >
                        {pageType == "view" && (
                          <button
                            onClick={() =>
                              navigate(`/${type}/edit/${item.id}`, {
                                state: { email },
                              })
                            }
                            className={`flex items-center right-2 absolute ${!showPreview ? "z-[100]" : ""
                              } top-2 gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition`}
                          >
                            <Pencil size={16} />
                          </button>
                        )}
                        {pageType !== "edit" && type !== "orders" && (
                          <button
                            onClick={() => {
                              pageType == "create"
                                ? removeData(item.id)
                                : handleDelete(item.id);
                            }}
                            className="flex items-center right-16 absolute  top-2 gap-2 px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                          >
                            {deleting && deleteId == item.id ? (
                              <LoadingChase size="20" color="white" />
                            ) : (
                              <Trash size={16} />
                            )}
                          </button>
                        )}
                        {pageType == "edit" && (
                          <div className="flex absolute  right-2 bottom-2  items-center  gap-2">
                            <button
                              onClick={() => {
                                setButton(1)
                                handleUpdate(item, false)
                              }}
                              disabled={updating || sending}
                              className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg transition ${((updating || sending) && button == 1)
                                ? "bg-green-300 cursor-not-allowed"
                                : "bg-green-500 hover:bg-green-600"
                                }`}
                            >
                              {button == 1 && updating ? "Updating..." : "Update"}
                            </button>
                            <button
                              onClick={() => {
                                setButton(2)
                                handleUpdate(item, true)
                              }}
                              disabled={updating || sending}
                              className={`flex items-center gap-2 px-3 py-1.5  text-white rounded-lg transition ${((updating || sending) && button == 2)
                                ? "bg-blue-300 cursor-not-allowed"
                                : "bg-blue-500 hover:bg-blue-600"
                                }`}
                            >
                              {((updating || sending) && button == 2) ? "Updating..." : "Update & Send"}
                            </button>
                          </div>
                        )}
                        {type == "orders" && pageType == "view" ? (
                          <OrderView data={item} setData={setData} sending={sending} />
                        ) : (
                          <>
                            {" "}
                            <div className="mt-4 flex flex-wrap gap-3">
                              {fields.map((field, fieldIndex) => (
                                <InputField
                                  key={fieldIndex}
                                  pageType={pageType}
                                  {...field}
                                  data={item}
                                  onChange={(e) =>
                                    handelChange(itemIndex, field.name, e)
                                  }
                                  websiteLists={validWebsite}
                                />
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Footer */}
              {pageType !== "edit" && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Total {type[0].toUpperCase() + type.slice(1)}: {data.length}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          {pageType !== "edit" && type !== "orders" && (
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-6 space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <h4 className="font-semibold">
                    {type[0].toUpperCase() + type.slice(1)} for {email}
                  </h4>

                  <div className="mt-3 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>
                        Total {type[0].toUpperCase() + type.slice(1)}:
                      </span>
                      <strong>{data.length}</strong>
                    </div>

                    {/* Website breakdown */}
                    <div className="mt-3">
                      <strong className="block mb-1">
                        {type == "orders" ? "OrderID" : "Websites"}
                      </strong>

                      {data.length === 0 ? (
                        <p className="text-gray-400">No websites selected</p>
                      ) : (
                        <ul className="list-none space-y-1">
                          {data.map((d, i) => (
                            <li key={i}>
                              {type == "orders"
                                ? d[orderID] || "(no id)"
                                : d[websiteKey] || "(no site)"}
                              {amountKey && (
                                <strong>
                                  - $
                                  {isNaN(Number(d[amountKey]))
                                    ? 0
                                    : Number(d[amountKey])}
                                </strong>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 flex gap-3">
                    {pageType == "view" ? (
                      <><button
                        disabled={data.length === 0}
                        onClick={() => sendHandler()}
                        className={`w-full px-3 py-2 rounded-lg text-white ${sending
                          ? "bg-green-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700"
                          }`}
                      >
                        {sending ? "Sending..." : "Send"}

                      </button><button
                        onClick={() => setShowPreview(true)}
                        className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg"
                      >
                          Preview
                        </button>  n
                      </>

                    ) : (
                      <>
                        <button
                          disabled={data.length === 0 || !valid}
                          onClick={() => {
                            setButton(1)
                            handleSubmit(false)
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-white ${data.length === 0 || !valid
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-green-600 hover:bg-green-700 cursor-pointer"
                            }`}
                        >
                          {creating && button == 1 ? "Saving..." : "Save"}
                        </button>
                        <button
                          disabled={data.length === 0 || !valid}
                          onClick={() => {
                            setButton(2)
                            handleSubmit(true)
                          }}
                          className={`w-full px-3 py-2 rounded-lg text-white ${data.length === 0 || !valid
                            ? "bg-gray-300 cursor-not-allowed"
                            : "bg-blue-600 hover:bg-blue-700 cursor-pointer"
                            }`}
                        >
                          {creating && button == 2 ? "Sending..." : "Save & Send"}
                        </button>
                      </>

                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {/* PREVIEW MODAL */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-100 p-2">
            {/* OUTER WRAPPER (WIDER + ROUNDED) */}
            <div className="bg-white w-full max-w-[800px] rounded-2xl shadow-2xl overflow-hidden relative">
              {/* SCROLLABLE CONTENT */}
              <div className="max-h-[60vh] overflow-y-auto p-6">
                {renderPreview({ data, email, onClose: () => { setShowPreview(false) } })}
              </div>
            </div>
          </div>
        )}
      </div >
    </>
  );
}

function InputField({
  label,
  name,
  data,
  onChange,
  placeholder,
  type = "text",
  disabled = false,
  pageType = "",
  websiteLists = [],
}) {
  const { statusLists } = useSelector((state) => state.orders);
  const value = data?.[name] ?? "";
  const isDisabled =
    pageType === "create" ? false : pageType === "view" ? true : disabled;

  const inputType = pageType === "view" && type === "select" ? "text" : type;
  return (
    <div
      className={`${inputType === "number" ? "w-30" : "w-full"} max-w-[300px]`}
    >
      <label
        className={`block mb-1 ${pageType === "view"
          ? "text-gray-500 text-sm"
          : "text-xs text-gray-600"
          } ${label == "Order Status" ? "text-yellow-600 font-bold" : ""}`}
      >
        {label}
      </label>

      {/* ================= SELECT ================= */}
      {inputType === "select" && (
        <select
          value={value}
          onChange={onChange}
          disabled={isDisabled}
          className={`w-full rounded-xl px-3 py-2 ${pageType === "view" || isDisabled
            ? "bg-gray-100"
            : "bg-white border"
            }`}
        >
          <option value="" disabled>
            Select {label}
          </option>

          {/* Order Status (object → key/value) */}
          {label === "Order Status"
            ? Object.entries(statusLists).map(([key, val]) => (
              <option key={key} value={key}>
                {val}
              </option>
            ))
            : websiteLists.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
        </select>
      )}

      {/* ================= TEXTAREA ================= */}
      {inputType === "textarea" && (
        <textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isDisabled}
          rows={4}
          className={`w-full rounded-xl px-3 py-2 resize-none ${pageType === "view" || isDisabled
            ? "bg-gray-100"
            : "bg-white border"
            }`}
        />
      )}

      {/* ================= INPUT ================= */}
      {inputType !== "select" &&
        inputType !== "textarea" &&
        inputType !== "list" && (
          <div className="flex items-center gap-1">
            {inputType === "number" && <span>$</span>}
            <input
              value={value === "N/A" ? "" : value}
              onChange={onChange}
              placeholder={placeholder}
              type={inputType}
              disabled={isDisabled}
              inputMode={inputType === "number" ? "numeric" : undefined}
              className={`w-full rounded-xl px-3 py-2 ${pageType === "view" || isDisabled
                ? "bg-gray-100"
                : "bg-white border"
                }`}
            />
          </div>
        )}
    </div>
  );
}