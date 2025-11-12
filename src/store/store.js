import { configureStore } from "@reduxjs/toolkit";
import ladgerReducer from "./Slices/ladger.js";
import unrepliedReducer from "./Slices/unrepliedEmails.js";
import unansweredReducer from "./Slices/unansweredEmails.js";
import dealsReducer from "./Slices/deals.js";
import offersReducer from "./Slices/offers.js";
import invoiceReducer from "./Slices/invoices.js";
import detectionReducer from "./Slices/detection.js";
import orderReducer from "./Slices/orders.js";
import viewEmailReducer from "./Slices/viewEmail.js";

import aiCreditsReducer from "./Slices/aiCredits.js";
import linkRemReducer from "./Slices/linkRem.js";
import orderRemReducer from "./Slices/orderRem.js";
import paymetnRemReducer from "./Slices/paymentRem.js";
import dealRemReducer from "./Slices/dealRem.js";
export const store = configureStore({
  reducer: {
    ladger: ladgerReducer,
    unreplied: unrepliedReducer,
    unanswered: unansweredReducer,
    deals: dealsReducer,
    orders: orderReducer,
    detection: detectionReducer,
    invoices: invoiceReducer,
    offers: offersReducer,
    viewEmail: viewEmailReducer,

    aiCredits: aiCreditsReducer,
    orderRem: orderRemReducer,
    dealRem: dealRemReducer,
    paymentRem: paymetnRemReducer,
    linkRem: linkRemReducer,
  },
});
