import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import { createLedgerEntry, buildLedgerItem, updateActivity } from "../../services/utils";
import { apiRequest } from "../../services/api";

const initialState = {
  loading: false,
  error: null,
  message: null
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
      state.message = action.payload
    },
    getTagsFail: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors: (state) => {
      state.error = null;
    },
    clearAllMessage: (state) => {
      state.message = null;
    },
  },
});

export const markTagAction =
  markTagSlice.actions;

export default markTagSlice.reducer;



export const applyTag = ({ email, tag }) => {
  return async (dispatch, getState) => {
    console.log(email)
    console.log(tag)
    try {
      dispatch(markTagSlice.actions.getTagsRequest());

      const domain = getState().user.crmEndpoint.split("?")[0];

      const data = await apiRequest({
        endpoint: `${domain}?entryPoint=contactAction`, params: { email, field: tag }
      }
      )
      console.log(data)

      if (!data.success) {
        throw new Error("Tag apply failed");
      }

      // ✅ dynamic message (added)
      const message =
        data.new_value === 1
          ? "Tag applied successfully"
          : "Tag removed successfully";

      dispatch(markTagSlice.actions.getTagsSuccess(message));
      updateActivity(getState().ladger.email, "Tag Applied ")
      await createLedgerEntry({
        domain: domain,
        email: email,
        group: "Activity",
        items: [
          buildLedgerItem({
            status: "Mark-tag",
            detail: `email: {${email}} tag: {${tag}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
      });
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
