import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const tagSlice = createSlice({
  name: "tag",
  initialState: {
    loading: false,
    pageCount: 1,
    pageIndex: 1,
    tags: [],
    count: 0,
    error: null,
  },
  reducers: {
    getTagsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getTagsSuccess(state, action) {
      const { count, tags, pageCount, pageIndex } = action.payload;
      state.loading = false;
      state.tags = tags;
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getTagsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getTags = (tag = "", page = 1, pageSize = 50) => {
  return async (dispatch, getState) => {
    dispatch(tagSlice.actions.getTagsRequest());

    try {
      const response = await axios.get(
        `${getState().user.crmEndpoint}&entryPoint=add_tag&tag=${tag}&page=${page}&page_size=${pageSize}`
      );
      
      const data = response.data;
      console.log(`Tag data:`, data);
      
      dispatch(
        tagSlice.actions.getTagsSuccess({
          count: data.data_count ?? 0,
          tags: data.data || [],
          pageCount: data.total_pages || 1,
          pageIndex: data.current_page || 1,
        })
      );
      dispatch(tagSlice.actions.clearAllErrors());
    } catch (error) {
      console.error("Error fetching tags:", error);
      dispatch(
        tagSlice.actions.getTagsFailed("Fetching tags failed")
      );
    }
  };
};

export const tagActions = tagSlice.actions;
export default tagSlice.reducer;