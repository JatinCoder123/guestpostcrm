import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const linkRemSlice = createSlice({
  name: "linkRem",
  initialState: {
    loading: false,
    linkRem: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },
  reducers: {
    getLinkRemRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getLinkRemSucess(state, action) {
      const { count, linkRemSlice, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.linkRemSlice = linkRemSlice;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.count = count;
      state.error = null;
    },
    getLinkRemFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getLinkRem = (filter, email) => {
  return async (dispatch, getState) => {
    dispatch(linkRemSlice.actions.getLinkRemRequest());

    try {
      const { data } = await axios.get(
        `${
          getState().user.crmEndpoint
        }&type=link_removal&filter=${filter}&email=${email}&page=1&page_size=50`
      );
      console.log(`link Rem`, data);
      dispatch(
        linkRemSlice.actions.getLinkRemSucess({
          count: data.data_count ?? 0,
          dealRem: data.data,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(linkRemSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        linkRemSlice.actions.getLinkRemFailed("Fetching Link Rem  Failed")
      );
    }
  };
};

export const linkRemAction = linkRemSlice.actions;
export default linkRemSlice.reducer;
