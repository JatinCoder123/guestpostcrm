import { Plus, CheckCircle, XCircle, PackageCheck } from "lucide-react";
import SeoBacklinkList from "./SeoBacklinks";
import { useContext, useEffect, useState } from "react";
import UpdatePopup from "./UpdatePopup";
import { useDispatch } from "react-redux";
import { createLink, orderAction, updateOrder } from "../store/Slices/orders";
import { useSelector } from "react-redux";
import { LoadingChase } from "./Loading";
import { SocketContext } from "../context/SocketContext";
export const OrderView = ({ data, setData, sending, setCurrentOrderSend }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(null);
  const [item, setItem] = useState(null);
  const { creatingLinkMessage, statusLists, updating } = useSelector((state) => state.orders);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showConsent, setShowConsent] = useState(false);
  const { invoiceOrderId } = useContext(SocketContext);
  const dispatch = useDispatch();
  const handleAddLink = (link) => {
    dispatch(createLink(item.id, link));
  };
  const onCompleteHandler = () => {
    setShowConsent(true);
  };


  useEffect(() => {
    if (status) {
      const updatedOrder = {
        ...data,
        order_status: status,
        seo_backlinks:
          status === "rejected_nontechnical"
            ? data.seo_backlinks.map(link => ({
              ...link,
              status_c: "rejected",
            }))
            : [...data.seo_backlinks],
      }
      dispatch(updateOrder(updatedOrder, status !== "accepted" ? true : false, data.order_id));
      setData((prev) => {
        const next = prev.map((d) => (d?.order_id === data?.order_id ? updatedOrder : d));
        return next;
      });
      setCurrentOrderSend(updatedOrder);

    }
  }, [status])
  useEffect(() => {
    if (creatingLinkMessage) {
      setOpen(false);
      dispatch(orderAction.clearAllMessages());
    }
  }, [creatingLinkMessage]);
  useEffect(() => {
    if (
      processingPayment &&
      invoiceOrderId &&
      invoiceOrderId === data.order_id
    ) {
      setProcessingPayment(false);
      setStatus("completed");
    }
  }, [invoiceOrderId, processingPayment, data.order_id]);


  return (
    <>
      {open && (
        <UpdatePopup
          open={open}
          onClose={() => setOpen(false)}
          title="Add Backlink"
          buttonLabel="Add"
          fields={[
            {
              label: "Link Amount",
              name: "link_amount",
              type: "number",
              value: 0,
            },
            {
              label: "Their Link",
              name: "backlink_url",
              type: "text",
              value: "",
            },
            {
              label: "Our Link",
              name: "target_url",
              type: "text",
              value: "",
            },
          ]}
          onUpdate={(link) => handleAddLink(link)}
        />
      )}

      {/* PAYPAL CONSENT */}
      <PayPalConsent
        open={showConsent}
        onCancel={() => setShowConsent(false)}
        onProceed={() => {
          setShowConsent(false);
          setProcessingPayment(true);
          window.open(data.invoice_link_c, "_blank", "noopener,noreferrer");
        }}
      />

      {/* PROCESSING PAYPAL */}
      {processingPayment && <ProcessingLoader />}
      {(updating || sending) && <PageLoader />}
      <div className="w-full relative mt-3">
        <OrderHeader data={data} setStatus={setStatus} onCompleteHandler={onCompleteHandler} />
        <div className="relative  rounded-3xl  p-10 border border-slate-700/50">
          <div className="relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm">
              <Field label="Date" value={data.date_entered_formatted} />
              <Field label="Type" value={data.order_type} />
              <Field label="Amount" value={`$${data.total_amount_c}`} />
              <Field label="Status">
                <div className="relative inline-flex">
                  <span className="relative inline-flex items-center gap-2 px-2 py-2 rounded-xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-orange-400 text-yellow-900 font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.5),0_8px_20px_rgba(234,179,8,0.4)] ">
                    {statusLists[data.order_status]}
                  </span>
                </div>
              </Field>
              <Field
                label="Invoice Link"
                value={data.invoice_link_c}
                link
                title="View Invoice"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3 ml-4 mt-6 mb-3">
              {/* Title */}
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
                <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                SEO Backlinks
              </div>

              {/* Add Button */}
              <button
                onClick={() => {
                  setItem(data);
                  setOpen(true);
                }}
                className="flex items-center justify-center w-4 h-4
      bg-blue-500 text-white rounded-lg text-sm
      hover:bg-blue-600 transition"
              >
                <Plus size={16} />
              </button>
            </div>
            {data.seo_backlinks.length > 0 ? (
              <SeoBacklinkList
                seo_backlink={data.seo_backlinks}
                orderId={data.id}
              />
            ) : (
              <div className="flex items-center justify-center h-24">
                No backlinks found
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

function Field({ label, value, link, children, title }) {
  const content = children || value;

  return (
    <div className="group perspective-1000">
      <div className="relative transform-gpu transition-all duration-500 hover:scale-105 hover:-translate-y-2">
        {/* Main card with bevel effect */}
        <div className="relative bg-gradient-to-br from-white via-slate-50 to-slate-100 rounded-2xl p-5 border-2 border-white shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_10px_30px_rgba(0,0,0,0.15)] group-hover:shadow-[inset_0_1px_2px_rgba(255,255,255,0.8),0_20px_50px_rgba(0,0,0,0.25)] transition-all duration-500">
          <div className="relative z-10">
            <div className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"></div>
              {label}
            </div>
            <div className="text-gray-800 font-semibold text-lg">
              {link ? (
                <a
                  href={value}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 underline decoration-2 underline-offset-4 transition-all"
                >
                  {title} →
                </a>
              ) : (
                content
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
function ProcessingLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
      <div className="relative z-10 flex flex-col items-center gap-4">
        <LoadingChase />
        <p className="font-semibold">Processing your PayPal payment…</p>
      </div>
    </div>
  );
}
function OrderHeader({ data, setStatus, onCompleteHandler }) {
  return (
    <div className="w-full mb-3">
      <div className="relative group">
        <div className="relative rounded-2xl overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:-translate-y-1">
          <div className="relative z-10 flex flex-col items-center justify-center gap-5">

            {/* Order Label */}
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Order ID
                </span>
              </div>

              <h2 className="text-2xl font-black bg-clip-text bg-gradient-to-r from-slate-100 via-white to-slate-100 tracking-tight">
                {data.order_id}
              </h2>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 flex-wrap justify-center">

              {/* Accept */}
              {data.order_status !== "accepted" && (
                <>
                  <button
                    onClick={() => { setStatus("accepted"); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-emerald-500/90 text-white font-semibold
                           shadow-md shadow-emerald-500/30
                           hover:bg-emerald-500 hover:shadow-lg
                           active:scale-95 transition-all cursor-pointer"
                  >
                    <CheckCircle size={18} />
                    Accept
                  </button>
                  <button
                    onClick={() => { setStatus("rejected_nontechnical"); }}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                           bg-red-500/90 text-white font-semibold
                           shadow-md shadow-red-500/30
                           hover:bg-red-500 hover:shadow-lg
                           active:scale-95 transition-all cursor-pointer"
                  >
                    <XCircle size={18} />
                    Reject
                  </button></>

              )}

              {/* Complete */}
              {data.order_status == "accepted" && (
                <button
                  onClick={onCompleteHandler}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl
              bg-blue-500/90 text-white font-semibold
              shadow-md shadow-blue-500/30
              hover:bg-blue-500 hover:shadow-lg
              active:scale-95 transition-all cursor-pointer"
                >
                  <PackageCheck size={18} />
                  Complete
                </button>


              )}

            </div>

          </div>
        </div>
      </div>
    </div >
  );
}

function PageLoader() {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Blur + dark overlay */}
      <div className="absolute inset-0 bg-black/10" />

      {/* Loader */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <LoadingChase />
      </div>
    </div>
  );
}
function PayPalConsent({ open, onCancel, onProceed }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      <div className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold mb-2">Confirm Payment</h3>
        <p className="text-gray-600 mb-6">
          You’ll be redirected to PayPal to complete the invoice payment.
          Once payment is confirmed, the order will be completed automatically.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg border text-gray-700 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={onProceed}
            className="px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            Proceed to PayPal
          </button>
        </div>
      </div>
    </div>
  );
}