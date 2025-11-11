import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    orders: [],
    count: 0,
    error: null,
  },
  reducers: {
    getOrdersRequest(state) {
      state.loading = true;
      state.count = 0;
      state.orders = [];
      state.error = null;
    },
    getOrdersSucess(state, action) {
      const { count, orders } = action.payload;
      state.loading = true;
      state.orders = orders;
      state.count = count;
      state.error = null;
    },
    getOrdersFailed(state, action) {
      state.loading = false;
      state.orders = [];
      state.count = 0;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOrders = (filter, email) => {
  return async (dispatch) => {
    dispatch(ordersSlice.actions.getOrdersRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=get_orders&filter=${filter}&email=${email}`
      );
      console.log(`Orders orders`, data);
      dispatch(
        ordersSlice.actions.getOrdersSucess({
          count: data.data_count ?? 0,
          orders: data.data,
        })
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ordersSlice.actions.getOrdersFailed("Fetching Orders orders Failed")
      );
    }
  };
};

export const orderAction = ordersSlice.actions;
export default ordersSlice.reducer;
