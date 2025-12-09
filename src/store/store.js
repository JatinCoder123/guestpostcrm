import { configureStore } from "@reduxjs/toolkit";
import ladgerReducer from "./Slices/ladger.js";
import unrepliedReducer from "./Slices/unrepliedEmails.js";
import unansweredReducer from "./Slices/unansweredEmails.js";
import favReducer from "./Slices/favEmailSlice.js";
import bulkReducer from "./Slices/markBulkSlice.js";
import forwarededReducer from "./Slices/forwardedEmailSlice.js";
import dealsReducer from "./Slices/deals.js";
import offersReducer from "./Slices/offers.js";
import invoiceReducer from "./Slices/invoices.js";
import detectionReducer from "./Slices/detection.js";
import orderReducer from "./Slices/orders.js";
import viewEmailReducer from "./Slices/viewEmail.js";
import threadEmailReducer from "./Slices/threadEmail.js";
import aiCreditsReducer from "./Slices/aiCredits.js";
import aiReplyReducer from "./Slices/aiReply.js";
import orderRemReducer from "./Slices/orderRem.js";
import userReducer from "./Slices/userSlice.js";
import avatarReducer from "./Slices/avatarSlice.js";
import defaulterReducer from "./Slices/defaulterEmails.js";
import movederReducer from "./Slices/movedEmails.js";
import backlinksReducer from "./Slices/backlinks.js";
import eventReducer from "./Slices/eventSlice.js";
import marketplaceReducer from "./Slices/Marketplace.js";
import linkExchangeReducer from "./Slices/linkExchange.js";

export const store = configureStore({
  reducer: {
    ladger: ladgerReducer,
    unreplied: unrepliedReducer,
    unanswered: unansweredReducer,
    fav: favReducer,
    moved: movederReducer,
    forwarded: forwarededReducer,
    deals: dealsReducer,
    orders: orderReducer,
    detection: detectionReducer,
    invoices: invoiceReducer,
    offers: offersReducer,
    viewEmail: viewEmailReducer,
    threadEmail: threadEmailReducer,
    aiCredits: aiCreditsReducer,
    aiReply: aiReplyReducer,
    orderRem: orderRemReducer,
    user: userReducer,
    bulk: bulkReducer,
    avatar: avatarReducer,
    defaulter: defaulterReducer,
    backlinks: backlinksReducer,
    events: eventReducer,
    marketplace: marketplaceReducer,
    linkExchange: linkExchangeReducer,


  },
});
