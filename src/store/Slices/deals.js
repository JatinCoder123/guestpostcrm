import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, MODULE_URL } from "../constants";

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
    message: null,
  },
  reducers: {
    getDealsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealsSucess(state, action) {
      const { count, deals, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.deals = deals;
      state.count = count;
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
      state.message = action.payload;
      state.error = null;
    },
    createDealFailed(state, action) {
      state.creating = false;
      state.message = null;
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

export const getDeals = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.getDealsRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_deals&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${getState().user.crmEndpoint
          }&type=get_deals&filter=${filter}&page=1&page_size=50`
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
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.getDealsFailed("Fetching Deal  Failed"));
    }
  };
};
export const createDeal = (deals = []) => {
  return async (dispatch) => {
    dispatch(dealsSlice.actions.createDealRequest());
    try {
      deals.map(async (deal) => {
        console.log(deal);
        const { data } = await axios.post(
          `${MODULE_URL}&action_type=post_data`,

          {
            parent_bean: {
              module: "outr_deal_fetch",
              dealamount: deal.dealamount,
              email: deal.email,
              website_c: deal.website_c,
            },
          },
          {
            headers: {
              "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
              "Content-Type": "aplication/json",
            },
          }
        );
        console.log(`Create Deal`, data);
      });

      dispatch(
        dealsSlice.actions.createDealSucess("Deals Created Successfully")
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.createDealFailed("Deal Creation Failed"));
    }
  };
};

export const dealsAction = dealsSlice.actions;
export default dealsSlice.reducer;
