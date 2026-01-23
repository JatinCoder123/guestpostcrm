import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const ladgerSlice = createSlice({
  name: "ladger",
  initialState: {
    loading: false,
    email: localStorage.getItem("email") || null,
    ladger: [],
    noSearchResultData: null,
    ip: null,
    ipMails: null,
    mailersSummary: null,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    timeline: localStorage.getItem("timeline") || "last_7_days",
    message: null,
    duplicate: 0,
    searchNotFound: false,
    noSearchFoundLoading: false,
    manualScanResponse: null,
    manualScanLoading: false,
  },
  reducers: {
    getLadgerRequest(state) {
      state.loading = true;
      state.searchNotFound = false;
      state.error = null;
    },

    getLadgerSuccess(state, action) {
      const {
        duplicate,
        ladger,
        email,
        pageCount,
        pageIndex,
        search,
        mailersSummary,
      } = action.payload;

      state.loading = false;
      state.ladger = ladger || [];
      state.mailersSummary = mailersSummary || null;
      state.pageCount = pageCount || 1;
      state.pageIndex = pageIndex || 1;
      state.email = email || null;
      state.duplicate = duplicate || 0;
      state.searchNotFound =
        (ladger?.length ?? 0) === 0 && (search?.trim() ?? "") !== "";
      state.error = null;
    },

    getLadgerFailed(state, action) {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
      state.searchNotFound = false;
    },

    setTimeline(state, action) {
      state.timeline = action.payload;
    },

    getIpWithEmailRequest(state) {
      state.loading = true;
      state.ip = null;
      state.ipMails = null;
      state.error = null;
    },

    getIpWithEmailSuccess(state, action) {
      const { ip, ipWithMails } = action.payload;
      state.loading = false;
      state.ip = ip;
      state.ipMails = ipWithMails;
      state.error = null;
    },

    getIpWithEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
    },

    getNoSearchResultDataRequest(state) {
      state.noSearchFoundLoading = true;
      state.noSearchResultData = null;
      state.error = null;
    },

    getNoSearchResultDataSuccess(state, action) {
      state.noSearchFoundLoading = false;
      state.noSearchResultData = action.payload.noSearchResultData || null;
      state.error = null;
    },

    getNoSearchResultDataFailed(state, action) {
      state.noSearchFoundLoading = false;
      state.noSearchResultData = null;
      state.error = action.payload || "Something went wrong";
    },
    manualScanRequest(state) {
      state.manualScanLoading = true;
      state.manualScanResponse = null;
      state.error = null;
    },
    manualScanSuccess(state, action) {
      state.manualScanLoading = false;
      state.manualScanResponse = action.payload;
    },
    manualScanFailed(state, action) {
      state.manualScanLoading = false;
      state.error = action.payload || "Something went wrong";
    },

    clearAllErrors(state) {
      state.error = null;
    },

    updateIndex(state, action) {
      state.pageIndex = action.payload;
    },
  },
});

export const getLadger = ({ email = null, isEmail = true, search = "", loading = true, page = 1 }) => {
  return async (dispatch, getState) => {
    if (loading) dispatch(ladgerSlice.actions.getLadgerRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=ledger${getState().ladger.timeline ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${isEmail ? `&email=${email ?? getState().ladger.email}` : ""}`
      );
      console.log("Ladger", data);
      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          search,
          duplicate: data.duplicate_threads_count,
          ladger: data.data ?? [],
          mailersSummary: data.mailers_summary,
          email: data.mailers_summary?.email,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(
          error.response?.data?.message
        )
      );
    }
  };
};



export const getIpWithEmail = () => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getIpWithEmailRequest());

    const crmDomain = getState().user.crmEndpoint.split("?")[0];

    try {
      const response = await axios.get(
        `${crmDomain}?entryPoint=tracker&email=${getState().ladger.email}`
      );

      const ip = response.data?.records?.[0]?.ip;
      if (!ip) throw new Error("IP not found");

      const { data } = await axios.get(
        `${crmDomain}index.php?entryPoint=tracker&ip=${ip}`
      );

      dispatch(
        ladgerSlice.actions.getIpWithEmailSuccess({
          ip,
          ipWithMails: data,
        })
      );

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getIpWithEmailFailed(
          error.response?.data?.message || error.message
        )
      );
    }
  };
};

export const getNoSearchResultData = (search) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getNoSearchResultDataRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=live_search&query=${search}`
      );

      console.log("NoSearchResultData", data);

      dispatch(
        ladgerSlice.actions.getNoSearchResultDataSuccess({
          noSearchResultData: data.data,
        })
      );

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getNoSearchResultDataFailed(
          error.response?.data?.message
        )
      );
    }
  };
};
export const manualEmailScan = (messageId) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.manualScanRequest());
    try {
      const crmDomain = getState().user.crmEndpoint.split("?")[0];

      const response = await axios.get(
        `${crmDomain}?entryPoint=manual_email_scanning&message_id=${messageId}`
      );
      console.log("ManualScan", response.data);
      dispatch(
        ladgerSlice.actions.manualScanSuccess(response.data)
      );

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.manualScanSuccess({
          status: 404,
          message: error.response?.data?.message || "Not Found",
        })
      );
    }
  };
};



export const ladgerAction = ladgerSlice.actions;
export default ladgerSlice.reducer;