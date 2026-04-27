import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";
import { getCache, setCache } from "../../services/cache";

const ladgerSlice = createSlice({
  name: "ladger",
  initialState: {
    loading: false,
    email: localStorage.getItem("email") || null,
    ladger: [],
    noSearchResultData: null,
    mailersSummary: null,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    timeline: localStorage.getItem("timeline") || "today",
    message: null,
    duplicate: 0,
    noSearchFoundLoading: false,
    manualScanResponse: null,
    manualScanLoading: false,
  },
  reducers: {
    getLadgerRequest(state) {
      state.loading = true;
      state.ladger = [];
      state.mailersSummary = null
      state.error = null;
      state.email = null;
    },

    getLadgerSuccess(state, action) {
      const {
        duplicate,
        ladger,
        email,
        pageCount,
        pageIndex,
        mailersSummary,
      } = action.payload;

      state.loading = false;
      state.ladger = ladger;
      state.mailersSummary = mailersSummary || null;
      state.pageCount = pageCount || 1;
      state.pageIndex = pageIndex || 1;
      state.email = email || null;
      state.duplicate = duplicate || 0;
      state.error = null;
    },

    getLadgerFailed(state, action) {
      state.loading = false;
      state.error = action.payload || "Something went wrong";
      state.ladger = []
    },

    setTimeline(state, action) {
      state.timeline = action.payload;
      localStorage.setItem("timeline", action.payload);
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

export const getLadger = ({
  email = null,
  loading = true,
  page = 1,
  force = false,
}) => {
  return async (dispatch, getState) => {
    const trimmedEmail = email?.trim() || "";
    const timeline = getState().ladger.timeline;

    const buildCacheKey = (targetEmail, targetPage = 1) =>
      `${targetEmail?.trim() || ""}_${targetPage}_${timeline || "all"}`;

    const cacheKey = buildCacheKey(trimmedEmail, page);

    if (loading) {
      dispatch(ladgerSlice.actions.getLadgerRequest());
    }

    try {
      // Serve cache instantly
      if (!force) {
        const cachedData = getCache("ledgers", cacheKey);

        if (cachedData) {
          dispatch(
            ladgerSlice.actions.getLadgerSuccess({
              duplicate: cachedData.duplicate,
              ladger: cachedData.ladger,
              mailersSummary: cachedData.mailersSummary,
              email: trimmedEmail,
              pageCount: cachedData.pageCount,
              pageIndex: cachedData.pageIndex,
            })
          );
        }
      }

      // Fetch fresh current ledger
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}
        &type=ledger
        ${timeline !== null && timeline !== "null"
            ? `&filter=${timeline}`
            : ""
          }
        &page=${page}
        &page_size=50
        ${trimmedEmail ? `&email=${trimmedEmail}` : ""}`
          .replace(/\s+/g, "")
      );
      console.log("LADGER", data)
      const freshData = {
        duplicate: data.duplicate_threads_count,
        ladger: data.data ?? [],
        mailersSummary: data.mailers_summary,
        pageCount: data.total_pages,
        pageIndex: data.current_page,
      };

      setCache("ledgers", cacheKey, freshData);

      dispatch(
        ladgerSlice.actions.getLadgerSuccess({
          duplicate: freshData.duplicate,
          ladger: freshData.ladger,
          mailersSummary: freshData.mailersSummary,
          email: trimmedEmail,
          pageCount: freshData.pageCount,
          pageIndex: freshData.pageIndex,
        })
      );

      // PREFETCH NEXT / PREV EMAIL LEDGER
      const index = localStorage.getItem("currentIndex") && Number(localStorage.getItem("currentIndex"))

      if (index !== null) {
        const unreplied = getState().unreplied;

        const nextEmail =
          index + 1 < unreplied.count
            ? unreplied.emails[index + 1]?.email1
            : null;

        const prevEmail =
          index > 0
            ? unreplied.emails[index - 1]?.email1
            : null;

        [nextEmail, prevEmail].forEach(async (prefetchEmail) => {
          if (!prefetchEmail) return;

          const prefetchCacheKey = buildCacheKey(prefetchEmail, 1);

          if (!getCache("ledgers", prefetchCacheKey)) {
            try {
              const { data } = await axios.get(
                `${getState().user.crmEndpoint}
                &type=ledger
                ${timeline !== null && timeline !== "null"
                    ? `&filter=${timeline}`
                    : ""
                  }
                &page=1
                &page_size=50
                &email=${prefetchEmail.trim()}`
                  .replace(/\s+/g, "")
              );

              setCache("ledgers", prefetchCacheKey, {
                duplicate: data.duplicate_threads_count,
                ladger: data.data ?? [],
                mailersSummary: data.mailers_summary,
                pageCount: data.total_pages,
                pageIndex: data.current_page,
              });
            } catch (err) {
              console.error("Ledger Prefetch Failed", err);
            }
          }
        });
      }

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



export const getNoSearchResultData = (search) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.getNoSearchResultDataRequest());

    try {
      const { data } = await axios.get(
        `${getState().user.crmEndpoint}&type=live_search&query=${search}`,
      );

      showConsole && console.log("NoSearchResultData", data);

      dispatch(
        ladgerSlice.actions.getNoSearchResultDataSuccess({
          noSearchResultData: data.data,
        }),
      );

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.getNoSearchResultDataFailed(
          error.response?.data?.message,
        ),
      );
    }
  };
};
export const manualEmailScan = (messageId, email, threadId) => {
  return async (dispatch, getState) => {
    dispatch(ladgerSlice.actions.manualScanRequest());
    try {

      const response = await axios.get(
        `${getState().user.crmEndpoint}&type=manual_scanning&message_id=${messageId}&email=${email}&thread_id=${threadId}`,
      );
      showConsole && console.log("ManualScan", response.data);
      dispatch(ladgerSlice.actions.manualScanSuccess(response.data));

      dispatch(ladgerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        ladgerSlice.actions.manualScanSuccess({
          status: 404,
          message: error.response?.data?.message || "Not Found",
        }),
      );
    }
  };
};

export const ladgerAction = ladgerSlice.actions;
export default ladgerSlice.reducer;
