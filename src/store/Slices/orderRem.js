import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BACKEND_URL } from "../constants";

const orderRemSlice = createSlice({
  name: "orderRem",
  initialState: {
    loading: false,
    orderRem: [],
    count: 0,
    error: null,
  },
  reducers: {
    getOrderRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getOrderRemSucess(state, action) {
      const { count, orderRem } = action.payload;
      state.loading = false;
      state.orderRem = orderRem;
      state.count = count;
      state.error = null;
    },
    getOrderRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getOrderRem = (filter, email) => {
  return async (dispatch) => {
    dispatch(orderRemSlice.actions.getOrderRemRequest());

    try {
      const { data } = await axios.get(
        `${BACKEND_URL}&type=order_reminder&filter=${filter}&email=${email}`
      );
      console.log(`Orders orders`, data);
      dispatch(
        orderRemSlice.actions.getOrderRemSucess({
          count: data.data_count ?? 0,
          orderRem: data.data,
        })
      );
      dispatch(orderRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        orderRemSlice.actions.getOrderRemFailed("Fetching Orders Rem  Failed")
      );
    }
  };
};

export const orderRemAction = orderRemSlice.actions;
export default orderRemSlice.reducer;
