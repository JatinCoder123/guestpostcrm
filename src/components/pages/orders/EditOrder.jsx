import { useEffect, useState } from "react";
import {
    ArrowLeft,
    DollarSign,
    FileText,
    Package,
    Send,
    Save,
    Link2,
    FileEdit,
    Dot,
    Link2Icon,
} from "lucide-react";
import { useSelector } from "react-redux";
import PageHeader from "../../PageHeader";
import IconButton from "../../ui/Buttons/IconButton";
import { updateOrder } from "../../../store/Slices/orders";

export default function EditOrder({ threadId, id, email }) {
    const [order, setOrder] = useState({})
    const { orders, updating, statusLists, message, error } = useSelector(s => s.orders)
    const [send, setSend] = useState(false)


    const handleChange = (key, value) => {
        setOrder((prev) => ({ ...prev, [key]: value }));
    };

    const handleUpdate = (isSend = false) => {
        setSend(isSend)
        dispatch(updateOrder({ email, order }));
    };
    useEffect(() => {
        const order = orders.find(o => o.thread_id == threadId && o.id == id)
        setOrder(order)
    }, [orders, threadId, id]);


    return (
        <div className="w-full flex gap-6 items-start">

            {/* 🔥 TABLE */}
            <div className="flex-1 relative border rounded-2xl p-6 bg-white shadow-sm">

                <PageHeader title={"Edit Order"} showAdd={false} />


                {/* Card */}
                <div className="bg-white ">

                    {/* Order Info */}
                    <div className="mb-8">
                        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                            <Package className="h-4 w-4 text-blue-500" />
                            Order Information
                        </h2>

                        <div className="grid md:grid-cols-3 gap-6">

                            {/* Order ID */}
                            <div>
                                <label className="block text-sm mb-1"># Order ID</label>
                                <input
                                    value={order.order_id}
                                    onChange={(e) => handleChange("order_id", e.target.value)}
                                    className="w-full border rounded-lg px-3 h-11 bg-slate-50"
                                />
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm mb-1 flex items-center gap-1"><DollarSign className="w-4 h-4" />Order Amount</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2.5">$</span>
                                    <input
                                        type="number"
                                        value={order.total_amount_c}
                                        onChange={(e) =>
                                            handleChange("total_amount_c", e.target.value)
                                        }
                                        className="w-full border rounded-lg pl-7 h-11 bg-slate-50"
                                    />
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block text-sm mb-1 flex items-center gap-1"><Dot className="w-5 h-5 text-green-500" />Order Status</label>
                                <select
                                    value={order.order_status}
                                    onChange={(e) =>
                                        handleChange("order_status", e.target.value)
                                    }
                                    className="w-full border rounded-lg h-11 px-3 bg-slate-50"
                                >
                                    {Object.entries(statusLists).map(([key, val]) => (
                                        <option key={key} value={key}>
                                            {val}
                                        </option>))}
                                </select>
                            </div>
                        </div>
                    </div>


                    {/* Additional */}
                    <div className="mb-8">

                        <div className="flex gap-9 items-center">

                            {/* Order Type */}
                            <div className="flex-shrink-0">
                                <label className="block text-sm mb-1 flex items-center gap-1"><Package className="w-4 h-4 text-black-500" />Order Status</label>

                                <div className="flex gap-3">
                                    {["LINK INSERTION", "GUEST POST"].map((type) => (
                                        <label
                                            key={type}
                                            className={`whitespace-nowrap px-4 py-2 border rounded-lg cursor-pointer transition 
          ${order.order_type === type
                                                    ? "border-blue-600 bg-blue-50"
                                                    : "border-gray-300"
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="order_type"
                                                value={type}
                                                checked={order.order_type === type}
                                                onChange={(e) =>
                                                    handleChange("order_type", e.target.value)
                                                }
                                                className="hidden"
                                            />
                                            {type}
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Invoice */}
                            <div className="flex-1 min-w-0">
                                <label className="block text-sm mb-1 flex items-center gap-2"><Link2Icon className="w-4 h-4 text-black-500" />Invoice Link</label>
                                <input
                                    type="url"
                                    value={order.invoice_link_c}
                                    onChange={(e) =>
                                        handleChange("invoice_link_c", e.target.value)
                                    }
                                    placeholder="https://example.com"
                                    className="w-[90%]  border rounded-lg h-11 px-3 bg-slate-50"
                                />
                            </div>

                        </div>
                    </div>

                    {/* Note */}
                    <div className="mb-8">
                        <label className="block text-sm mb-2 flex gap-2 items-center"><FileEdit className="w-4 h-4 text-blue-500" />Note</label>
                        <textarea
                            rows={4}
                            value={order.note}
                            onChange={(e) => handleChange("note", e.target.value)}
                            className="w-full border rounded-lg p-3 bg-slate-50"
                        />
                    </div>


                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">


                        <IconButton
                            icon={Save}
                            label="Update"
                            onClick={() => handleUpdate(false)}
                            loading={updating && !send}
                            disabled={updating}
                            className={`bg-green-100 hover:bg-green-200 
      `}
                        />

                        <IconButton
                            icon={Send}
                            label="Update & Send"
                            onClick={() => handleUpdate(true)}
                            loading={updating && send}
                            disabled={updating}
                            className={`bg-indigo-100 hover:bg-indigo-200 `}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}