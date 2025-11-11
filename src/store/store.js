import { configureStore } from "@reduxjs/toolkit";
import ladgerReducer from "./Slices/ladger.js";
import unrepliedReducer from "./Slices/unrepliedEmails.js";
import unansweredReducer from "./Slices/unansweredEmails.js";
import dealsReducer from "./Slices/deals.js";
import offersReducer from "./Slices/offers.js";
import invoiceReducer from "./Slices/invoices.js";
import detectionReducer from "./Slices/detection.js";
import orderReducer from "./Slices/orders.js";
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
  },
});
