import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    loading: false,
    creating: false,
    deals: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    summary:null,
    message: null,
    updating: false,
    deleting: false,
    deleteDealId: null,
  },
  reducers: {
    getDealsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealsSucess(state, action) {
      const { count, deals, pageCount,summary, pageIndex } = action.payload;
      state.loading = false;
      state.deals = deals;
      state.count = count;
      state.summary= summary;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getDealsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createDealRequest(state) {
      state.creating = true;
      state.message = null;
      state.error = null;
    },
    createDealSucess(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.deals = action.payload.deals;
      state.count = action.payload.count;
      state.error = null;
    },
    createDealFailed(state, action) {
      state.creating = false;
      state.message = null;
      state.error = action.payload;
    },
    updateDealRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    updateDealSucess(state, action) {
      state.updating = false;
      state.deals = action.payload.deals;
      state.message = action.payload.message;
      state.error = null;
    },
    updateDealFailed(state, action) {
      state.updating = false;
      state.message = null;
      state.error = action.payload;
    },
    deleteDealRequest(state, action) {
      state.deleting = true;
      state.error = null;
      state.deleteDealId = action.payload;
    },
    deleteDealSuccess(state, action) {
      state.deleting = false;
      state.deals = action.payload.deals;
      state.count = action.payload.count;
      state.deleteDealId = null;
      state.error = null;
    },
    deleteDealFailed(state, action) {
      state.deleting = false;
      state.deleteDealId = null;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
    UpdateDeals(state, action) {
      state.deals = action.payload;
    },
  },
});

export const getDeals = (email) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.getDealsRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_deals&filter=${getState().ladger.timeline}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_deals&filter=${getState().ladger.timeline}&page=1&page_size=50`
        );
      }
      const data = response.data;
      console.log(`Deals`, data);
      dispatch(
        dealsSlice.actions.getDealsSucess({
          count: data.data_count ?? 0,
          deals: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          summary:data.summary ?? null
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.getDealsFailed("Fetching Deal  Failed"));
    }
  };
};
export const createDeal = (deals = []) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.createDealRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];

    try {
      const res = await axios.post(
        `${domain}?entryPoint=get_deal_details`,
        {
          records: deals.map((deal) => ({
            amount: deal.dealamount,
            email: deal.email,
            website: deal.website_c,
          })),
          child_bean: {
            module: "Contacts",
            id: getState().viewEmail.contactInfo.id,
            email: deals[0].email
          },
        }
      );
      console.log(`Create Deal`, res);
      const updatedDeals = [...deals, ...getState().deals.deals];
      dispatch(
        dealsSlice.actions.createDealSucess({
          message: "Deals Created Successfully",
          deals: updatedDeals,
          count: updatedDeals.length,
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.createDealFailed("Deal Creation Failed"));
    }
  };
};
export const updateDeal = (deal, send) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.updateDealRequest());
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_deal_fetch",
            ...deal,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      console.log(`Update Deal`, data);
      const updatedDeals = getState().deals.deals.map((d) => {
        if (d.id === deal.id) {
          return {
            ...deal,
          };
        }
        return d;
      });
      dispatch(dealsSlice.actions.updateDealSucess({ message: `Deal Updated ${send ? "and Send Successfully" : "Successfully"}`, deals: updatedDeals }));
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.updateDealFailed("Deal Update Failed"));
    }
  };
};
export const deleteDeal = (id) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.deleteDealRequest(id));
    try {
      const { data } = await axios.post(`${getState().user.crmEndpoint}&type=delete_record&module_name=outr_deal_fetch&record_id=${id}`
      );
      console.log(`Delete Deal`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedDeals = getState().deals.deals.filter((deal) => deal.id !== id);
      dispatch(
        dealsSlice.actions.deleteDealSuccess({
          deals: updatedDeals,
          count: getState().deals.count - 1,
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.deleteDealFailed(error.message));
    }
  };
};

export const dealsAction = dealsSlice.actions;
export default dealsSlice.reducer;
