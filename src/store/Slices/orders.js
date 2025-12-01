import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    orders: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getOrdersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrdersSucess(state, action) {
      const { count, orders, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.orders = orders;
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getOrdersFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOrders = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.getOrdersRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_orders&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_orders&filter=${filter}&page=1&page_size=50`
        );
      }
      const data = response.data;
      console.log(`Orders orders`, data);
      dispatch(
        ordersSlice.actions.getOrdersSucess({
          count: data.data_count ?? 0,
          orders: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
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
export const createOrder = (order) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.getOrdersRequest());

    try {
      let response;
      response = await axios.get(
        `${getState().user.crmEndpoint
        }&type=create_order&order=${order}`
      );
      const data = response.data;
      console.log(`Orders orders`, data);
      dispatch(
        ordersSlice.actions.getOrdersSucess({
          count: data.data_count ?? 0,
          orders: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
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
