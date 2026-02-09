import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const aiReplySlice = createSlice({
  name: "aiReply",
  initialState: {
    loading: false,
    aiReply: null,
    error: null,
    message: null,
  },
  reducers: {
    getAiReplyRequest(state) {
      state.loading = true;
      state.error = null;
      state.aiReply = null;
    },
    getAiReplySucess(state, action) {
      const { aiReply, message } = action.payload;
      state.loading = false;
      state.aiReply = aiReply;
      state.error = null;
      state.message = message;
    },
    getAiReplyFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.aiReply = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearMessge(state) {
      state.message = null;
    },
  },
});

export const getAiReply = (threadId = null, isNew = null, message = null) => {
  return async (dispatch, getState) => {
    dispatch(aiReplySlice.actions.getAiReplyRequest());
    showConsole && console.log("THREAD ID AND MESSAGE FOR AI REPLY ", threadId, message)

    try {
      if (!threadId) {
        throw new Error("Please provide the thread Id");
      }
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=ai_reply`, {
        thread_id: threadId,
        new: isNew,
        prompt_body: message

      },
      );
      showConsole && console.log(`aiReply`, data);
      dispatch(
        aiReplySlice.actions.getAiReplySucess({
          aiReply: data.reply_suggestion,
          message: message ? "User" : isNew ? "New" : "Thread",
        }),
      );
      dispatch(aiReplySlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        aiReplySlice.actions.getAiReplyFailed("Fetching AiReply   Failed"),
      );
    }
  };
};

export const aiReplyAction = aiReplySlice.actions;
export default aiReplySlice.reducer;
