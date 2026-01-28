import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const tagSlice = createSlice({
  name: "tag",
  initialState: {
    loading: false,
    pageCount: 1,
    pageIndex: 1,
    tags: [],
    count: 0,
    error: null,
    creating: false, // Added for create operation
    createSuccess: false, // Added for create success status
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

    // Create tag reducers
    createTagRequest(state) {
      state.creating = true;
      state.createSuccess = false;
      state.error = null;
    },
    createTagSuccess(state, action) {
      state.creating = false;
      state.createSuccess = true;
      state.error = null;
    },
    createTagFailed(state, action) {
      state.creating = false;
      state.createSuccess = false;
      state.error = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
    },
    resetCreateStatus(state) {
      state.createSuccess = false;
      state.creating = false;
    },
  },
});

// Get tags function
export const getTags = (tag = "", page = 1, pageSize = 50) => {
  return async (dispatch, getState) => {
    dispatch(tagSlice.actions.getTagsRequest());

    try {
      const response = await axios.get(
        `${getState().user.crmEndpoint}&entryPoint=add_tag&tag=${tag}&page=${page}&page_size=${pageSize}`
      );

      const data = response.data;
      showConsole && console.log(`Tag data:`, data);

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

// Create tag function
// Create tag function - make sure it returns a Promise properly
export const createTag = (tagName) => {
  return async (dispatch, getState) => {
    dispatch(tagSlice.actions.createTagRequest());

    try {
      const encodedTagName = encodeURIComponent(tagName);

      const response = await axios.post(
        `${getState().user.crmEndpoint}&entryPoint=add_tag&field_name=${encodedTagName}`
      );

      const data = response.data;
      showConsole && console.log(`Create tag response:`, data);

      if (data.success || data.output?.includes('created successfully')) {
        dispatch(tagSlice.actions.createTagSuccess());
        showConsole && console.log(`Tag "${tagName}" created successfully!`);
        return Promise.resolve({ success: true, tagName });
      } else {
        const errorMsg = data.message || data.output || "Failed to create tag";
        dispatch(tagSlice.actions.createTagFailed(errorMsg));
        return Promise.reject(new Error(errorMsg));
      }

    } catch (error) {
      console.error("Error creating tag:", error);
      const errorMessage = error.response?.data?.message ||
        error.response?.data?.output ||
        error.message ||
        "Failed to create tag";
      dispatch(tagSlice.actions.createTagFailed(errorMessage));
      return Promise.reject(new Error(errorMessage));
    }
  };
};

export const tagActions = tagSlice.actions;
export default tagSlice.reducer;