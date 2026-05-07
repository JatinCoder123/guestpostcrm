import { createSlice } from "@reduxjs/toolkit";
import { fetchGpc } from "../../services/api";

const movedSlice = createSlice({
  name: "moved",

  initialState: {
    loading: false,
    emails: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
  },

  reducers: {
    getEmailRequest(state) {
      state.loading = true;
      state.error = null;
    },

    getEmailSuccess(state, action) {
      const { count, emails, pageCount, pageIndex } = action.payload;

      state.loading = false;

      if (pageIndex === 1) {
        state.emails = emails;
      } else {
        state.emails = [...state.emails, ...emails];
      }

      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },

    getEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
    },
  },
});

export const getmovedEmails =
  (email = "", page = 1) =>
  async (dispatch) => {
    try {
      dispatch(movedSlice.actions.getEmailRequest());

      const data = await fetchGpc({
        params: {
          type: "moved_email",
          email,
          page,
          page_size: 50,
        },
      });

      console.log("MOVED EMAIL API RESPONSE => ", data);

      dispatch(
        movedSlice.actions.getEmailSuccess({
          count: Number(data?.data_count || 0),
          emails: data?.data || [],
          pageCount: Number(data?.total_pages || 1),
          pageIndex: Number(data?.current_page || 1),
        }),
      );
    } catch (error) {
      console.log("MOVED EMAIL ERROR => ", error);

      dispatch(
        movedSlice.actions.getEmailFailed(
          error?.message || "Failed to fetch moved emails",
        ),
      );
    }
  };

export const movedAction = movedSlice.actions;

export default movedSlice.reducer;
