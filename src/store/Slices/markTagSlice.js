import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { toast } from "react-toastify";
import { createLedgerEntry, buildLedgerItem, updateActivity } from "../../services/utils";

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
      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Tag Applied ")
      await createLedgerEntry({
        email: getState().ladger.email,
        group: "Activity",
        items: [
          buildLedgerItem({
            status: "Mark-tag",
            detail: `email: {${getState().ladger.email}} tag: {${selectedTag}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
      });

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
