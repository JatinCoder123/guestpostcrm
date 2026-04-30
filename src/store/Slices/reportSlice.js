import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";

const reportSlice = createSlice({
  name: "report",
  initialState: {
    loading: false,
    data: [],
    pageIndex: 1,
    pageCount: 1,
    message: null,
    error: null,
  },
  reducers: {
    getGroupReportRequest(state, action) {
      state.loading = action.payload;
      state.error = null;
    },
    getGroupReportSucess(state, action) {
      const { data, count, pageCount, pageIndex } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.data = data;
      } else {
        state.data = [...state.data, ...data];
      }
      state.count = count;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getGroupReportFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },

    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessage(state) {
      state.message = null;
    },
  },
});

export const getGroupReport = ({
  grp,
  page = 1,
  loading = true,
  from = null,
  from_time = null,
  to = null,
  to_time = null,
}) => {
  return async (dispatch, getState) => {
    dispatch(reportSlice.actions.getGroupReportRequest(loading));

    try {
      const data = await fetchGpc({ params: { type: "report", group: grp, page, page_size: '50', ...((from && from_time && to && to_time) ? { from, from_time, to, to_time } : {}) } });
      showConsole && console.log(`GROUP REPORT`, data);
      dispatch(
        reportSlice.actions.getGroupReportSucess({
          data: data.data ? data.data : [],
          count: data.data_count,
          pageIndex: data.current_page ?? 1,
          pageCount: data.total_pages ?? 1,
        }),
      );
      dispatch(reportSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        reportSlice.actions.getGroupReportFailed("Fetching Report Failed"),
      );
    }
  };
};

export const groupReportAction = reportSlice.actions;
export default reportSlice.reducer;
