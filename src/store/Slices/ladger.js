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
  },
  reducers: {
    getLadgerRequest(state) {
      state.loading = true;
      state.searchNotFound = false;
      state.error = null;
    },
    getLadgerSuccess(state, action) {
      const { duplicate, ladger, email, pageCount, pageIndex, search, mailersSummary } =
        action.payload;
      state.loading = false;
      state.ladger = ladger;
      state.mailersSummary = mailersSummary;
      state.pageCount = pageCount;
      state.pageCount = pageIndex;
      state.email = email;
      state.duplicate = duplicate;
      state.searchNotFound = ladger.length === 0 && search.trim() !== "";
      state.error = null;
    },
    getLadgerFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.searchNotFound = false;
    },
    setTimeline(state, action) {
      state.timeline = action.payload;
    },
    getIpWithEmailRequest(state, action) {
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
      state.error = action.payload;
    },
    getNoSearchResultDataRequest(state) {
      state.loading = true;
      state.noSearchResultData = null;
      state.error = null;
    },
    getNoSearchResultDataSuccess(state, action) {
      const { noSearchResultData } = action.payload;
      state.loading = false;
      state.noSearchResultData = noSearchResultData;
      state.error = null;
    },
    getNoSearchResultDataFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    updateIndex(state, action) {
      state.pageIndex = action.payload;
    },
  },
});

export const getLadger = (search) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getLadgerRequest());

    try {
      const res = await axios.get(
        `${getState().user.crmEndpoint}&type=ledger&filter=${getState().ladger.timeline
        }&page=1&page_size=50`,
        {
          withCredentials: false,
        }
      );
      console.log("Ladger", res.data);
      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          search,
          duplicate: data.duplicate_threads_count,
          ladger: data.data,
          mailersSummary: data.mailers_summary,
          email: data.mailers_summary.email,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(error.response?.data?.message)
      );
    }
  };
};
export const getLadgerEmail = (email, search) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getLadgerRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=ledger&filter=${getState().ladger.timeline
        }&email=${email}&page=1&page_size=50`,
        {
          withCredentials: false,
        }
      );
      console.log("Ladger Email", data);

      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          search,
          duplicate: data.duplicate_threads_count,
          ladger: data.data,
          mailersSummary: data.mailers_summary,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          email: email,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(error.response?.data?.message)
      );
    }
  };
};
export const getLadgerWithOutLoading = (email, search) => {
  return async (dispatch, getState) => {
    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=ledger&filter=${getState().ladger.timeline
        }&email=${email}&page=1&page_size=50`,
        {
          withCredentials: false,
        }
      );
      console.log("LADGER", data);
      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          search,
          duplicate: data.duplicate_threads_count,
          ladger: data.data,
          mailersSummary: data.mailers_summary,
          pageCount: data.total_pages,
          pageIndex: data.current_page,
          email: email,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getLadgerFailed(error.response?.data?.message)
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
      console.log("IP OF EMAIL", response);
      ip = ip.records[0].ip;
      const { data } = await axios.get(
        `${crmDomain}index.php?entryPoint=tracker&ip=${ip}`
      );
      console.log("EMAIL OF IP", data);
      dispatch(
        ladgerSlice.actions.getIpWithEmailSuccess({
          ip,
          ipWithMails: data,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getIpWithEmailFailed(error.response?.data?.message)
      );
    }
  };
};
export const getNoSearchResultData = (search) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getNoSearchResultDataRequest());
    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=live_search&query=${search}`,
        {
          withCredentials: false,
        }
      );
      console.log("NO SEARCH RESULT", data);
      dispatch(
        ladgerSlice.actions.getNoSearchResultDataSuccess({
          noSearchResultData: data.data,
        })
      );
      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getNoSearchResultDataFailed(error.response?.data?.message)
      );
    }
  };
};


export const ladgerAction = ladgerSlice.actions;
export default ladgerSlice.reducer;
