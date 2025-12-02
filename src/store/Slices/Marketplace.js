import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState: {
    loading: false,
    items: [],
    count: 0,
    error: null,
  },
  reducers: {
    getMarketplaceRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getMarketplaceSuccess(state, action) {
      const { count, items } = action.payload;
      state.loading = false;
      state.items = items;
      state.count = count;
      state.error = null;
    },
    getMarketplaceFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearErrors(state) {
      state.error = null;
    },
  },
});

// Named export: thunk
export const getMarketplace = () => {
  return async (dispatch, getState) => {
    dispatch(marketplaceSlice.actions.getMarketplaceRequest());

    try {
      const response = await axios.get(
        `${getState().user.crmEndpoint}&type=get_marketplace`
      );

      const data = response.data;
      console.log("MARKETPLACE:", data);

      dispatch(
        marketplaceSlice.actions.getMarketplaceSuccess({
          count: data.data_count ?? 0,
          items: data.data ?? [],
        })
      );

      dispatch(marketplaceSlice.actions.clearErrors());
    } catch (error) {
      dispatch(
        marketplaceSlice.actions.getMarketplaceFailed(
          "Fetching Marketplace Failed"
        )
      );
    }
  };
};

// Named export: slice actions
export const marketplaceActions = marketplaceSlice.actions;

// Default export: reducer
export default marketplaceSlice.reducer;
