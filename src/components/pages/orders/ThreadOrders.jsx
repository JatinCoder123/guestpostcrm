import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Plus, Pencil, Trash2, Eye } from "lucide-react";
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
import { ManualSideCall } from "../../../services/utils";
import { getLadger } from "../../../store/Slices/ladger";
import { extractEmail } from "../../../assets/assets";
import { OrderView } from "../../OrderView";

export default function ThreadOrders({ threadId, email, id }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [currentOrders, setCurrentOrders] = useState([]);
    const { orders } = useSelector(
        (state) => state.orders
    );
    const { handleMove } = useThreadContext();
    useEffect(() => {
        const threadOrders = orders.filter(
            (d) => extractEmail(d.real_name ?? d.email) == email
        );
        let activeOrders = []
        if (id) {
            activeOrders = threadOrders.filter(o => o.id == id)
        }
        else {
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
                threadId
            },
        });
    };


    const handlePreview = (order) => {
        let html = templateData?.[0]?.body_html || "";

        const tableHtml = buildTable(
            offersData,
            "Offers",
            "website",
            "our_offer_c"
        );

        html = html
            .replace("{{USER_EMAIL}}", email)
            .replace("{{TABLE}}", tableHtml);

        handleMove({ email, threadId, reply: html });
    };
    return (
        <div className="w-full flex gap-6 items-start">

            {/* 🔥 TABLE */}
            <div className="flex-1 relative border rounded-2xl p-6 bg-white shadow-sm">

                <PageHeader title={"ORDERS"} onAdd={handleCreate} />

                {currentOrders.map((item, idx) => (
                    <div
                        key={item.id}
                        className={`
                          relative rounded-xl border overflow-hidden transition-all
                        border-l-4 border-l-indigo-500 bg-indigo-50/30
                        `}
                    >
                        {/* Action buttons – high z-index */}
                        <div className="absolute top-2 right-4 flex gap-2 z-30">
                            <button
                                onClick={() =>
                                    navigate(`/orders/edit`, {
                                        state: { email, threadId, id: item.id },
                                    })
                                }
                                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                                title="Edit this item"
                            >
                                <Pencil size={18} />
                            </button>

                            <button
                                onClick={() => {
                                    handlePreview(item)
                                }}
                                className="p-2.5 rounded-lg bg-white shadow hover:bg-blue-50 text-blue-600 transition-all hover:shadow-md active:scale-95"
                                title="View preview"
                            >
                                <Send size={18} />
                            </button>

                        </div>
                        <OrderView
                            data={item}
                        />
                    </div>
                ))}

            </div>

        </div>
    );
}


