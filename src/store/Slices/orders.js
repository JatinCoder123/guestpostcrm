import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    orders: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
    message: null,
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
    updateOrderRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    createOrderRequest(state) {
      state.creating = true;
      state.message = null;
      state.error = null;
    },
    createOrderSuccess(state, action) {
      state.creating = false;
      state.message = action.payload;
      state.error = null;
    },
    createOrderFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
      state.message = null;
    },
    updateOrderSuccess(state, action) {
      state.updating = false;
      state.message = action.payload.message;
      state.orders = action.payload.orders;
      state.error = null;
    },
    updateOrderFailed(state, action) {
      state.updating = false;
      state.error = action.payload;
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
    setUpdateOrder(state, action) {
      state.orders = action.payload;
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
export const createOrder = () => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.createOrderRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    try {
      let response;
      response = await axios.get(`${domain}?entryPoint=manual_order&email=${getState().ladger.email}`);
      const data = response.data;
      console.log(`Orders created`, data);
      if (!data.order.response) {
        dispatch(
          ordersSlice.actions.createOrderFailed(data.order)
        );
        return;
      }
      console.log(`Orders created`, data);
      dispatch(
        ordersSlice.actions.createOrderSuccess("Order Created Successfully")
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ordersSlice.actions.createOrderFailed("Creating Order Failed")
      );
    }
  };
};
export const getOrdersWithoutLoading = () => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.getOrdersRequest());
    try {
      let response;
      response = await axios.get(
        `${getState().user.crmEndpoint
        }&type=get_orders&filter=${getState().ladger.timeline}&page=1&page_size=50`
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
        ordersSlice.actions.getOrdersFailed("Fetching Orders Failed")
      );
    }
  };
};

export const updateOrder = (order) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.updateOrderRequest());

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_order_gp_li",
            ...order,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      console.log(`Update Order`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === order.id) {
          return order;
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.updateOrderSuccess({ orders: updatedOrders, message: "Order Updated Successfully" })
      );

      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      console.log(error);
      dispatch(
        ordersSlice.actions.updateOrderFailed("Updating Order Failed")
      );
    }
  };
};

export const orderAction = ordersSlice.actions;
export default ordersSlice.reducer;
