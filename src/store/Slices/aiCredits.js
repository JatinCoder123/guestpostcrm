import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const aiCreditsSlice = createSlice({
  name: "aiCredits",
  initialState: {
    loading: false,
    balance: 0,
    count: 0,
    aiCredits: [],
    error: null,
  },
  reducers: {
    getAiCreditsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getAiCreditsSucess(state, action) {
      const { aiCredits, count, balance } = action.payload;
      state.loading = false;
      state.aiCredits = aiCredits;
      state.count = count;
      state.balance = balance;
      state.error = null;
    },
    getAiCreditsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getAiCredits = (filter) => {
  return async (dispatch, getState) => {
    dispatch(aiCreditsSlice.actions.getAiCreditsRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=get_credits&filter=${filter}`
      );
      console.log(`aiCredits`, data);
      dispatch(
        aiCreditsSlice.actions.getAiCreditsSucess({
          count: data.data_count,
          balance: data.credit_balance,
          aiCredits: data.data,
        })
      );
      dispatch(aiCreditsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        aiCreditsSlice.actions.getAiCreditsFailed("Fetching Deals  Failed")
      );
    }
  };
};

export const aiCreditsAction = aiCreditsSlice.actions;
export default aiCreditsSlice.reducer;
