import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

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
export const getTags = () => async (dispatch) => {
  try {
    dispatch(getTagsRequest());

    const { data } = await axios.get(
      "https://example.guestpostcrm.com/index.php?entryPoint=add_tag&get_tag=1"
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
      const threadId = getState().viewEmail?.contactInfo?.id;

      const response = await axios.get(
        `${domain}?entryPoint=contactAction&email=&field=${selectedTag}`
      );

      const data = response.data;

      if (!data.success) {
        throw new Error("Tag apply failed");
      }

      dispatch(markTagSlice.actions.getTagsSuccess(data.alltags || []));

      // OPTIONAL: success toast / message
      console.log("Tag applied successfully");

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
