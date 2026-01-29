import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";

const initialState = {
  loading: false,
  tags: [],
  error: null,
};

const markTagSlice = createSlice({
  name: "markTag",
  initialState,
  reducers: {
    getTagsRequest: (state) => {
      state.loading = true;
      state.error = null;
    },
    getTagsSuccess: (state, action) => {
      state.loading = false;
      state.tags = action.payload;
    },
    getTagsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors: (state) => {
      state.error = null;
    },
  },
});

export const { getTagsRequest, getTagsSuccess, getTagsFail, clearAllErrors } =
  markTagSlice.actions;

export default markTagSlice.reducer;

// async action
export const getTags = () => async (dispatch, getState) => {
  try {
    dispatch(getTagsRequest());

    const { data } = await axios.get(
      `${getState().user.crmEndpoint.split("?")[0]}?entryPoint=add_tag&get_tag=1`
    );

    // API gives: { success, fields: [...] }
    dispatch(getTagsSuccess(data.fields));
  } catch (error) {
    dispatch(getTagsFail(error.response?.data?.message || error.message));
  }
};

export const applyTag = (selectedTag) => {
  return async (dispatch, getState) => {
    try {
      dispatch(markTagSlice.actions.getTagsRequest());

      const domain = getState().user.crmEndpoint.split("?")[0];

      const response = await axios.get(
        `${domain}?entryPoint=contactAction&email=${getState().ladger.email
        }&field=${selectedTag}`
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Tag apply failed");
      }

      // ✅ dynamic message (added)
      const message =
        data.new_value === 1
          ? "Tag applied successfully"
          : "Tag removed successfully";

      dispatch(markTagSlice.actions.getTagsSuccess(data.alltags || []));

      // ✅ toast with dynamic text
      toast.success(message);

      dispatch(markTagSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        markTagSlice.actions.getTagsFail(
          error.response?.data?.message || error.message
        )
      );
    }
  };
};
