import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, showConsole } from "../../assets/assets";
import { updateActivity } from "../../services/utils";

const ordersSlice = createSlice({
  name: "orders",
  initialState: {
    loading: false,
    orders: [],
    statusLists: {},
    count: 0,
    stats: [],
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
    newlyOrder: null,
    creatingPost: false,
    postMessage: null,

  },
  reducers: {
    getOrdersRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrdersSucess(state, action) {
      const { count, orders, pageCount, pageIndex, statusLists, summary, stats } =
        action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.orders = orders;
      } else {
        state.orders = [...state.orders, ...orders];
      }
      state.statusLists = statusLists;
      state.count = count;
      state.stats = stats
      state.updateId = null;
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
      state.newlyOrder = null;
    },
    createOrderSuccess(state, action) {
      state.creating = false;
      state.message = action.payload;
      state.error = null;
    },
    createOrder2Success(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.error = null;
    },
    createOrder3Success(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.error = null;
    },
    createOrderFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
      state.message = null;
      state.newlyOrder = null;

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
      state.updateLinkMessage = "Order Deleted Successfully";
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
          }&type=get_orders${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&email=${email}&page=${page}&page_size=50`,
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_orders${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${localStorage.getItem("email") ? `&email=${localStorage.getItem("email")}` : ""}`,
        );
      }
      const data = response.data;
      showConsole && console.log(`Orders orders`, data);
      dispatch(
        ordersSlice.actions.getOrdersSucess({
          count: data.data_count ?? 0,
          statusLists: data.order_status_list,
          orders: data.data,
          stats: data.stats ? data.stats : [],
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          summary: data.summary ?? null,
        }),
      );
      dispatch(ordersSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ordersSlice.actions.getOrdersFailed("Fetching Orders Failed"),
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
      response = await axios.get(
        `${domain}?entryPoint=manual_order&email=${getState().ladger.email}`,
      );
      const data = response.data;
      showConsole && console.log(`Orders created`, data);
      if (!data.order.response) {
        dispatch(ordersSlice.actions.createOrderFailed(data.order));
        return;
      }
      showConsole && console.log(`Orders created`, data);
      dispatch(
        ordersSlice.actions.createOrderSuccess("Order Created Successfully"),
      );
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Order Fetched ")

    } catch (error) {
      dispatch(ordersSlice.actions.createOrderFailed("Creating Order Failed"));
    }
  };
};
export const createOrder2 = ({ email, order, threadId }) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.createOrderRequest());
    console.log("EMAIL", email)
    console.log("ORDER", order)
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      let orders = order.order_type == "GUEST POST" ? order.seo_backlinks.map((link) => {
        return {
          type: "Guest Post",
          site: link.website,
          content_doc: link.gp_doc_url_c,

        }
      }) : order.seo_backlinks.map((link) => {
        return {
          type: "Link Insertion",
          site: link.website,
          post_url: link.website,
          their_link: [{
            url: link.backlink_url,
            anchor_text: link.anchor_text_c
          }]
        }
      })
      console.log("ORDERS", orders)
      const res = await axios.post(
        `${domain}?entryPoint=fetch_gpc&type=manual_order`,

        {
          email: email,
          thread_id: threadId,
          orders
        },

      );
      showConsole && console.log(`Create Order Manully`, res.data);
      if (!res.data.success) {
        throw new Error("Failed To Create Order")
      }
      dispatch(
        ordersSlice.actions.createOrder2Success({
          message: "Order Created Successfully"
        }))
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Manual Order Created ")

    } catch (error) {
      console.log("ERROR", error)
      dispatch(ordersSlice.actions.createOrderFailed("Order Creation Failed"));
    }
  };
};
export const createOrder3 = (email, orders = [], send) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.createOrderRequest());
    console.log("EMAIL", email)
    console.log("ORDER", orders)
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      let res;
      {
        orders.map(async (order) => {

          res = await axios.get(
            `${domain}?entryPoint=manual_order&email=${email}&message_id=${order.message_id}&website=${order.website}&amount=${order.amount}`);
          showConsole && console.log(`Create Order Manully`, res.data);
        })
      }

      dispatch(
        ordersSlice.actions.createOrder3Success({
          message: "Order Created Successfully"
        }))
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Order Fetched ")

    } catch (error) {
      console.log("ERROR", error)
      dispatch(ordersSlice.actions.createOrderFailed("Order Creation Failed"));
    }
  };
};

export const updateOrder = ({ order, email }) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.updateOrderRequest());
    showConsole && console.log("Update Order", order);

    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const noteRes = await axios.post(
        `${getState().user.crmEndpoint}&type=take_notes`,
        {

          "record_id": order.id,
          "notes": order.note
        }
      );
      console.log("NOTE RES", noteRes)
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
        },
      );
      showConsole && console.log(`Update Order`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === order.id) {
          return order;
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.updateOrderSuccess({
          orders: updatedOrders,
          message: `Order Updated Successfully`,
        }),
      );

      dispatch(ordersSlice.actions.clearAllErrors());

      updateActivity(getState().user.crmEndpoint, email, getState().user.user.name, getState().user.user.email, "Order Updated ")

    } catch (error) {
      showConsole && console.log(error);
      dispatch(ordersSlice.actions.updateOrderFailed("Updating Order Failed"));
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
        },
      );
      showConsole && console.log(`Update Order Link`, data);
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            seo_backlinks: o.seo_backlinks.map((l) =>
              l.id === link.id ? { ...l, ...link } : l,
            ),
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.updateLinkSuccess({
          orders: updatedOrders,
          message: "Order Link Updated Successfully",
        }),
      );
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, " Order Link Updated ")

    } catch (error) {
      showConsole && console.log(error);
      dispatch(
        ordersSlice.actions.updateLinkFailed("Updating Order Link Failed"),
      );
    }
  };
};
export const deleteLink = (orderId, linkId) => {
  return async (dispatch, getState) => {
    dispatch(ordersSlice.actions.deleteLinkRequest());
    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=delete_record&module_name=outr_seo_backlinks&record_id=${linkId}`,
      );
      showConsole && console.log(`Delete Order Link`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedOrders = getState().orders.orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            seo_backlinks: o.seo_backlinks.filter((l) => l.id !== linkId),
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.deleteLinkSuccess({
          orders: updatedOrders,
        }),
      );
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Order Link Deleted ")

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
            seo_backlinks: [
              ...o.seo_backlinks,
              { ...link, id: Date.now().toString() },
            ],
          };
        }
        return o;
      });
      dispatch(
        ordersSlice.actions.createLinkSuccess({
          message: "Link Created Successfully",
          orders: updatedOrders,
        }),
      );
      dispatch(ordersSlice.actions.clearAllErrors());
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Order Link Created ")

    } catch (error) {
      dispatch(ordersSlice.actions.createLinkFailed("Link Creation Failed"));
    }
  };
};

export const orderAction = ordersSlice.actions;
export default ordersSlice.reducer;