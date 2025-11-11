import { configureStore } from "@reduxjs/toolkit";
import ladgerReducer from "./Slices/ladger.js";
import unrepliedReducer from "./Slices/unrepliedEmails.js";
import unansweredReducer from "./Slices/unansweredEmails.js";
import spamDetectionReducer from "./Slices/spamEmails.js";
export const store = configureStore({
  reducer: {
    ladger: ladgerReducer,
    unreplied: unrepliedReducer,
    unanswered: unansweredReducer,
    spamDetection: spamDetectionReducer,
  },
});
