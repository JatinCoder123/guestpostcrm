import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { showConsole } from "../../assets/assets";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    orders: [],
    statusLists: {},
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    creating: false,
    updating: false,
    deleting: false,
    message: null,
    summary: null,
    updateLinkLoading: false,
    updateLinkMessage: null,
    creatingLink: false,
    creatingLinkMessage: null,
  },
  reducers: {
    getOrdersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrdersSucess(state, action) {
      const { count, orders, pageCount, pageIndex, statusLists, summary } = action.payload;
      state.loading = false;
      state.orders = orders;
      state.statusLists = statusLists;
      state.count = count;
      state.updateId = null
      state.summary = summary;
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
    createLinkRequest(state) {
      state.creatingLink = true;
      state.creatingLinkMessage = null;
      state.error = null;
    },
    createLinkSuccess(state, action) {
      state.creatingLink = false;
      state.orders = action.payload.orders;
      state.creatingLinkMessage = action.payload.message;
      state.error = null;
    },
    createLinkFailed(state, action) {
      state.creatingLink = false;
      state.error = action.payload;
      state.creatingLinkMessage = null;
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
    updateLinkRequest(state) {
      state.updateLinkLoading = true;
      state.updateLinkMessage = null;
      state.error = null;
    },
    updateLinkSuccess(state, action) {
      state.updateLinkLoading = false;
      state.orders = action.payload.orders;
      state.updateLinkMessage = action.payload.message;
      state.updateId = action.payload.id;
      state.error = null;
    },
    updateLinkFailed(state, action) {
      state.updateLinkLoading = false;
      state.error = action.payload;
      state.updateLinkMessage = null;
    },
    deleteLinkRequest(state) {
      state.deleting = true;
      state.error = null;
    },
    deleteLinkSuccess(state, action) {
      state.deleting = false;
      state.orders = action.payload.orders;
      state.updateLinkMessage = "Order Deleted Successfully"
      state.error = null;
    },
    deleteLinkFailed(state, action) {
      state.deleting = false;
      state.error = action.payload;
    },
    createLinkRequest(state) {
      state.creating = true;
      state.error = null;
    },
    createLinkSuccess(state, action) {
      state.creating = false;
      state.orders = action.payload.orders;
      state.error = null;
    },
    createLinkFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
      state.updateLinkMessage = null;
      state.creatingLinkMessage = null;
    },
    resetUpdateId(state) {
      state.updateId = null;
    },
    setUpdateOrder(state, action) {
      state.orders = action.payload;
    },
  },
});

export const getOrders = ({ email = null, page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    loading && dispatch(ordersSlice.actions.getOrdersRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_orders${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=${page}&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_orders${(getState().ladger.timeline !== null) && (getState().ladger.timeline !== "null") ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50`
        );
      }
      const data = response.data;
      showConsole && console.log(`Orders orders`, data);
      dispatch(
        ordersSlice.actions.getOrdersSucess({
          count: data.data_count ?? 0,
          statusLists: data.order_status_list,
          orders: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          summary: data.summary ?? null
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
      showConsole && console.log(`Orders created`, data);
      if (!data.order.response) {
        dispatch(
          ordersSlice.actions.createOrderFailed(data.order)
        );
        return;
      }
      showConsole && console.log(`Orders created`, data);
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


export const updateOrder = (order, send = true, id = null) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.updateOrderRequest());
    showConsole && console.log("Update Order", order);

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
      showConsole && console.log(`Update Order`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === order.id) {
          return order;
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.updateOrderSuccess({ orders: updatedOrders, message: `Order Updated ${send ? "and Send Successfully" : "Successfully"}`, id: id })
      );

      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        ordersSlice.actions.updateOrderFailed("Updating Order Failed")
      );
    }
  };
};
export const updateSeoLink = (orderId, link) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.updateLinkRequest());
    showConsole && console.log("Update Seo Link", link);
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_order_gp_li",
            id: orderId,
          },
          child_bean: {
            module: "outr_seo_backlinks",
            ...link,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      showConsole && console.log(`Update Order Link`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            seo_backlinks: o.seo_backlinks.map((l) =>
              l.id === link.id ? { ...l, ...link } : l
            ),
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.updateLinkSuccess({ orders: updatedOrders, message: "Order Link Updated Successfully" })
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        ordersSlice.actions.updateLinkFailed("Updating Order Link Failed")
      );
    }
  };
};
export const deleteLink = (orderId, linkId) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.deleteLinkRequest());
    try {
      const { data } = await axios.post(`${getState().user.crmEndpoint}&type=delete_record&module_name=outr_seo_backlinks&record_id=${linkId}`
      );
      showConsole && console.log(`Delete Order Link`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            seo_backlinks: o.seo_backlinks.filter((l) =>
              l.id !== linkId
            ),
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.deleteLinkSuccess({
          orders: updatedOrders,
        })
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(ordersSlice.actions.deleteLinkFailed(error.message));
    }
  };
};
export const createLink = (orderId, link) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.createLinkRequest());
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,

        {
          parent_bean: {
            module: "outr_order_gp_li",
            id: orderId,
          },
          child_bean: {
            module: "outr_seo_backlinks",
            ...link,
          },
        },
      );
      showConsole && console.log(`Create Link`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            seo_backlinks: [...o.seo_backlinks, { ...link, id: Date.now().toString() }],
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.createLinkSuccess({
          message: "Link Created Successfully",
          orders: updatedOrders,
        })
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(ordersSlice.actions.createLinkFailed("Link Creation Failed"));
    }
  };
};

export const orderAction = ordersSlice.actions;
export default ordersSlice.reducer;
