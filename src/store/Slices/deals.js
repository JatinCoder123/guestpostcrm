import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY, CREATE_DEAL_URL } from "../constants";

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    loading: false,
    creating: false,
    deals: [],
    count: 0,
    error: null,
    message: null,
  },
  reducers: {
    getDealsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealsSucess(state, action) {
      const { count, deals } = action.payload;
      state.loading = false;
      state.deals = deals;
      state.count = count;
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
  },
});

export const getDeals = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.getDealsRequest());

    try {
      let response;
      if (email) {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=get_deals&filter=${filter}&email=${email}&page=1&page_size=50`
        );
      } else {
        response = await axios.get(
          `${
            getState().user.crmEndpoint
          }&type=get_deals&filter=${filter}&page=1&page_size=50`
        );
      }
      const data = response.data;
      console.log(`Deals`, data);
      dispatch(
        dealsSlice.actions.getDealsSucess({
          count: data.data_count ?? 0,
          deals: data.data,
        })
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.getDealsFailed("Fetching Deal  Failed"));
    }
  };
};
export const createDeal = (formData) => {
  return async (dispatch) => {
    dispatch(dealsSlice.actions.createDealRequest());
    console.log(formData);
    try {
      const { data } = await axios.post(
        `${CREATE_DEAL_URL}&action_type=post_data`,
        formData,
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "aplication/json",
          },
        }
      );
      console.log(`Create Deal`, data);
      dispatch(
        dealsSlice.actions.createDealSucess("Deal Created Successfully")
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.createDealFailed("Deal Creation Failed"));
    }
  };
};

export const dealsAction = dealsSlice.actions;
export default dealsSlice.reducer;
