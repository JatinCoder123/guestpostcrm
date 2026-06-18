import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import PageHeader from "../../PageHeader";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { Save, Send, X, Loader2 } from "lucide-react";
import { extractEmail } from "../../../assets/assets";
import { OrderView } from "../../OrderView";
import { createPreviewOrder } from "../../PreviewOrder";
import { getOrders, orderAction } from "../../../store/Slices/orders";
import { toast } from "react-toastify";
import { useTemplateByName } from "../../../queries/template.queries";
import { orderKeys, useOrdersByEmail } from "../../../queries/orders.queries";
import { useContact } from "../../../queries/contact.queries";
import { queryClient } from "../../../lib/queryClient";

export default function ThreadOrders({ email, id }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showBrandTimeline, contacts } = useSelector(
    (state) => state.brandTimeline,
  );
  const [currentOrders, setCurrentOrders] = useState([]);
  const [send, setSend] = useState();
  const { data } = useContact(email)
  const threadId = data?.contact?.thread_id
  const { message, error } = useSelector((state) => state.orders);
  const { data: ordersData, isLoading: ordersLoading } = useOrdersByEmail(email, showBrandTimeline);
  const orders = ordersData?.data ?? []

  const { handleMove } = useThreadContext();
  useEffect(() => {
    let activeOrders = [];
    if (id) {
      activeOrders = orders.filter((o) => o.id == id);
    } else {

      activeOrders = orders.filter(
        (d) =>
          d.order_status !== "wrong" &&
          d.order_status !== "rejected_nontechnical" &&
          d.order_status !== "completed",
      );
    }
    setCurrentOrders(activeOrders);
  }, [orders, email, id]);

  const handleCreate = () => {
    navigate(`/orders/create?email=${email}`);
  };

  const { data: liTemplate } = useTemplateByName("LI_ORDER_TEMPLATE");
  const { data: gpTemplate } = useTemplateByName("OrderORG");

  const handlePreview = (order, itemEmail, itemThreadId) => {
    const html = createPreviewOrder({
      templateData: order.order_type == "GUEST POST" ? gpTemplate : liTemplate,
      order,
      userEmail: itemEmail,
    });
    console.log("ORDER PDF", order.invoice_pdf);
    handleMove({
      email: itemEmail,
      threadId: itemThreadId,
      reply: html,
      htmlFile: order.invoice_pdf,
    });
  };
  useEffect(() => {
    if (message) {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
      toast.success(message);
      if (message?.includes("Updated")) {
        if (send) {
          setSend(undefined);
          dispatch(orderAction.clearAllMessages());
          handlePreview(send.item, send.itemEmail, send.itemThreadId);
        } else {
          dispatch(orderAction.clearAllMessages());
        }
      }
    }
    if (error) {
      toast.error(error);
      dispatch(orderAction.clearAllMessages());
    }
  }, [message, error]);
  return (
    <div className="w-full min-w-0 flex gap-6 items-start">
      {/* 🔥 TABLE */}
      <div className="flex-1 min-w-0 relative border rounded-2xl p-6 bg-white shadow-sm overflow-hidden">
        <PageHeader
          title={"ORDERS"}
          onAdd={() => handleCreate(email)}
        />
        {ordersLoading && (
          <div className="space-y-3 mt-4">
            {Array.from({
              length: 2,
            }).map((_, i) => (
              <div
                key={i}
                className="h-30 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}
        {currentOrders.map((item) => {
          const itemEmail = showBrandTimeline
            ? extractEmail(item.real_name ?? item.email)
            : email;
          const itemThreadId = showBrandTimeline
            ? contacts.find((contact) => contact.email1 == email)?.thread_id
            : threadId;
          return (
            <div
              key={item.id}
              className="relative rounded-xl border overflow-hidden transition-all 
                        border-l-4 border-l-indigo-500 bg-indigo-50/30 mb-10"
            >
              <div className="absolute top-2 right-4 flex gap-2 z-30">
                {showBrandTimeline && (
                  <button
                    onClick={() =>
                      navigate(`/orders/create?email=${itemEmail}`)
                    }
                    className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                    title="Edit this item"
                  >
                    <Plus size={18} />
                  </button>
                )}
                <button
                  onClick={() =>
                    navigate(`/orders/edit?email=${itemEmail}&id=${item.id}`)
                  }
                  className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                  title="Edit this item"
                >
                  <Pencil size={18} />
                </button>

                <button
                  onClick={() => {
                    handlePreview(item, itemEmail, itemThreadId);
                  }}
                  className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                  title="View preview"
                >
                  <Send size={18} />
                </button>
              </div>
              <OrderView
                setSend={(item) => setSend({ item, itemEmail, itemThreadId })}
                data={item}
                email={email}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
