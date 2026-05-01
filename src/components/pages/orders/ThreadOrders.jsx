import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
import PageHeader from "../../PageHeader";
import { useThreadContext } from "../../../hooks/useThreadContext";
import { Save, Send, X, Loader2 } from "lucide-react";
import { extractEmail } from "../../../assets/assets";
import { OrderView } from "../../OrderView";
import { CREATE_DEAL_API_KEY } from "../../../store/constants";
import useModule from "../../../hooks/useModule";
import { createPreviewOrder } from "../../PreviewOrder";
import { getOrders, orderAction } from "../../../store/Slices/orders";
import { toast } from "react-toastify";

export default function ThreadOrders({ threadId, email, id }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentOrders, setCurrentOrders] = useState([]);
  const [send, setSend] = useState();
  const { orders, message, error } = useSelector((state) => state.orders);
  const { showBrandTimeline, contacts } = useSelector((state) => state.brandTimeline);
  const { crmEndpoint } = useSelector((state) => state.user);
  const { handleMove } = useThreadContext();
  useEffect(() => {
    let activeOrders = [];
    if (id) {
      activeOrders = orders.filter((o) => o.id == id);
    } else {
      const threadOrders = showBrandTimeline ? orders : orders.filter(
        (d) => extractEmail(d.real_name ?? d.email) == email,
      );
      activeOrders = threadOrders.filter(
        (d) =>
          d.order_status !== "wrong" &&
          d.order_status !== "rejected_nontechnical" &&
          d.order_status !== "completed",
      );
    }
    setCurrentOrders(activeOrders);
  }, [orders, email, id]);

  const handleCreate = () => {
    navigate(`/orders/create`, {
      state: {
        email,
        threadId,
      },
    });
  };
  const { data: gpTemplate } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: {
        name: "OrderORG",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "GP TEMPLATE",
  });
  const { data: liTemplate } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: {
      module: "EmailTemplates",
      where: {
        name: "LI_ORDER_TEMPLATE",
      },
    },
    headers: {
      "x-api-key": `${CREATE_DEAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    name: "LI TEMPLATE",
  });

  const handlePreview = (order, itemEmail, itemThreadId) => {
    const html = createPreviewOrder({
      templateData: order.order_type == "GUEST POST" ? gpTemplate : liTemplate,
      order,
      userEmail: itemEmail,
    });
    handleMove({ email: itemEmail, threadId: itemThreadId, reply: html });
  };
  useEffect(() => {
    if (message) {
      dispatch(getOrders({ email, brand: showBrandTimeline }));
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
    <div className="w-full flex gap-6 items-start">
      {/* 🔥 TABLE */}
      <div className="flex-1 relative border rounded-2xl p-6 bg-white shadow-sm">
        <PageHeader title={"ORDERS"} onAdd={() => handleCreate(email, threadId)} />

        {currentOrders.map((item) => {
          const itemEmail = showBrandTimeline ? extractEmail(item.real_name ?? item.email) : email
          const itemThreadId = showBrandTimeline ? contacts.find(contact => contact.email1 == email)?.thread_id : threadId
          return <div
            key={item.id}
            className="relative rounded-xl border overflow-hidden transition-all 
                        border-l-4 border-l-indigo-500 bg-indigo-50/30 mb-10"
          >
            <div className="absolute top-2 right-4 flex gap-2 z-30">
              {showBrandTimeline && <button
                onClick={() =>
                  navigate(`/orders/create`, {
                    state: { email: itemEmail, threadId: itemThreadId },
                  })
                }
                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                title="Edit this item"
              >
                <Plus size={18} />
              </button>}
              <button
                onClick={() =>
                  navigate(`/orders/edit`, {
                    state: { email: itemEmail, threadId: itemThreadId, id: item.id },
                  })
                }
                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                title="Edit this item"
              >
                <Pencil size={18} />
              </button>

              <button onClick={() => { handlePreview(item, itemEmail, itemThreadId) }}
                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                title="View preview"
              >
                <Send size={18} />
              </button>
            </div>
            <OrderView setSend={(item) => setSend({ item, itemEmail, itemThreadId })} data={item} />
          </div>
        })}
      </div>
    </div>
  );
}
