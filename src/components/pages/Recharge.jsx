import { useState } from "react";
import {
    PayPalButtons,
    PayPalScriptProvider,
} from "@paypal/react-paypal-js";
import { useSearchParams } from "react-router-dom";

const CLIENT_ID =
    "AazvCwn56Ta_IYz9wJPZcdB9fbHY3aRmkKSFyIAhJcgnlCtRSD5NLaIk37Q-CnN7TSVMEZsUpk48cBO-";

export default function Recharge() {
    const [searchParams] = useSearchParams();

    const email =
        searchParams.get("email") ||
        "anshik@business.example.com";

    const planId =
        searchParams.get("plan_id") ||
        "9666f294-da53-4dc9-d16f-6a44cece5bfa";

    const businessEmail =
        searchParams.get("bussiness_email") ||
        "outrightcrm55@gmail.com";

    const [amount, setAmount] = useState(
        searchParams.get("amount") || "10"
    );

    const createOrder = async () => {
        const response = await fetch(
            `https://crm.outrightsystems.org/index.php?entryPoint=get_invoice&type=create&email=${encodeURIComponent(
                email
            )}&amount=${encodeURIComponent(
                amount
            )}&plan_id=${encodeURIComponent(
                planId
            )}&bussiness_email=${encodeURIComponent(
                businessEmail
            )}`
        );

        const text = await response.text();

        console.log(text);

        const data = JSON.parse(text);

        return data.orderID;
    };

    const onApprove = async (data) => {
        const response = await fetch(
            `https://crm.outrightsystems.org/index.php?entryPoint=get_invoice&type=capture&orderID=${data.orderID}`
        );

        const text = await response.text();

        alert(text);
    };

    return (
        <PayPalScriptProvider
            options={{
                clientId: CLIENT_ID,
                currency: "USD",
            }}
        >
            <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 flex items-center justify-center p-6">
                <div className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
                        <h1 className="text-3xl font-bold">
                            Recharge Wallet
                        </h1>

                        <p className="mt-2 text-blue-100">
                            Secure payment powered by PayPal
                        </p>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">

                        <div>
                            <label className="text-sm font-semibold text-slate-500">
                                Email
                            </label>

                            <input
                                value={email}
                                readOnly
                                className="mt-2 w-full rounded-xl border bg-slate-100 px-4 py-3 text-slate-700 outline-none"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-500">
                                Recharge Amount (USD)
                            </label>

                            <div className="relative mt-2">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-semibold text-slate-500">
                                    $
                                </span>

                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-3 text-lg font-semibold focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-500">
                                Plan ID
                            </label>

                            <div className="mt-2 rounded-xl bg-slate-50 border p-4 break-all text-sm text-slate-600">
                                {planId}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-blue-50 border border-blue-100 p-4 flex justify-between items-center">
                            <div>
                                <p className="text-sm text-slate-500">
                                    Total Amount
                                </p>

                                <h2 className="text-3xl font-bold text-blue-700">
                                    ${Number(amount || 0).toFixed(2)}
                                </h2>
                            </div>

                            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl">
                                💳
                            </div>
                        </div>

                        <div className="pt-2">
                            <PayPalButtons
                                forceReRender={[amount]}
                                style={{
                                    layout: "vertical",
                                    shape: "pill",
                                    color: "gold",
                                    label: "paypal",
                                    height: 50,
                                }}
                                createOrder={createOrder}
                                onApprove={onApprove}
                                onError={(err) => {
                                    console.error(err);
                                    alert("Payment Failed");
                                }}
                            />
                        </div>

                    </div>
                </div>
            </div>
        </PayPalScriptProvider>
    );
}