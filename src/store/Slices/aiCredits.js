import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const aiCreditsSlice = createSlice({
  name: "aiCredits",
  initialState: {
    loading: false,
    balance: 0,
    pageCount: 1,
    pageIndex: 1,
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
      const { aiCredits, count, pageIndex, pageCount, balance } =
        action.payload;
      state.loading = false;
      state.aiCredits = aiCredits;
      state.count = count;
      state.balance = balance;
      state.pageIndex = pageIndex;
      state.pageCount = pageCount;
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

export const getAiCredits = (index = 1) => {
  return async (dispatch, getState) => {
    dispatch(aiCreditsSlice.actions.getAiCreditsRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=get_credits${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${index}&page_size=50`
      );
      showConsole && console.log(`aiCredits`, data);
      dispatch(
        aiCreditsSlice.actions.getAiCreditsSucess({
          count: data.data_count,
          balance: data.credit_balance,
          aiCredits: data.data ?? [],
          pageIndex: data.current_page,
          pageCount: data.total_pages,
        })
      );
      dispatch(aiCreditsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        aiCreditsSlice.actions.getAiCreditsFailed("Fetching Credits Failed")
      );
    }
  };
};

export const aiCreditsAction = aiCreditsSlice.actions;
export default aiCreditsSlice.reducer;
