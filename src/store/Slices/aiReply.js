import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const aiReplySlice = createSlice({
  name: "aiReply",
  initialState: {
    loading: false,
    aiReply: null,
    error: null,
  },
  reducers: {
    getAiReplyRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getAiReplySucess(state, action) {
      const { aiReply } = action.payload;
      state.loading = false;
      state.aiReply = aiReply;
      state.error = null;
    },
    getAiReplyFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getAiReply = (threadId) => {
  return async (dispatch) => {
    dispatch(aiReplySlice.actions.getAiReplyRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=ai_reply&thread_id=${threadId}`
      );
      console.log(`aiReply`, data);
      dispatch(
        aiReplySlice.actions.getAiReplySucess({
          aiReply: data.reply_suggestion,
        })
      );
      dispatch(aiReplySlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        aiReplySlice.actions.getAiReplyFailed("Fetching AiReply   Failed")
      );
    }
  };
};

export const aiReplyAction = aiReplySlice.actions;
export default aiReplySlice.reducer;
