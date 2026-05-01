import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { getCache, setCache } from "../../services/cache";
import { fetchGpc } from "../../services/api";

const initialState = {
  loading: false,
  threadEmail: [],
  message: null,
  error: null,
  count: 0,
  activeThreadId: null,
};

const threadEmailSlice = createSlice({
  name: "threadEmail",
  initialState,
  reducers: {
    getThreadEmailRequest(state, action) {
      state.loading = true;
      state.threadEmail = [];
      state.error = null;
      state.count = 0;
      state.activeThreadId = action.payload;
    },

    getThreadEmailSucess(state, action) {
      const { threadEmail, count } = action.payload;

      state.loading = false;
      state.threadEmail = threadEmail;
      state.error = null;
      state.message = null;
      state.count = count;
    },

    getThreadEmailFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.message = null;
      state.count = 0;
      state.threadEmail = [];
    },

    clearAllErrors(state) {
      state.error = null;
    },

    clearAllMessage(state) {
      state.message = null;
    },
  },
});

export const getThreadEmail = (email, threadId) => {
  return async (dispatch, getState) => {
    const trimThreadId = threadId?.trim();

    dispatch(
      threadEmailSlice.actions.getThreadEmailRequest(trimThreadId)
    );

    try {
      // ===============================
      // SHOW CACHE IMMEDIATELY (if exists)
      // ===============================
      const cachedData = getCache("threadMails", trimThreadId);

      if (
        cachedData &&
        getState().threadEmail.activeThreadId === trimThreadId
      ) {
        dispatch(
          threadEmailSlice.actions.getThreadEmailSucess({
            threadEmail: cachedData.threadEmail || [],
            count: cachedData.count ?? 0,
          })
        );
      }


      const data = await fetchGpc({ params: { type: "view_thread", thread_id: threadId, email } });
      const freshData = {
        threadEmail: data.emails || [],
        count: data.total_emails ?? 0,
      };

      // save cache
      setCache("threadMails", trimThreadId, freshData);

      showConsole && console.log("threadEmail", data);

      // Prevent old request overriding new thread
      if (
        getState().threadEmail.activeThreadId === trimThreadId
      ) {
        dispatch(
          threadEmailSlice.actions.getThreadEmailSucess(
            freshData
          )
        );
      }

      // ===============================
      // PREFETCH NEXT / PREV THREADS
      // ===============================
      const index = Number(
        localStorage.getItem("currentIndex")
      );

      if (!isNaN(index)) {
        const unreplied = getState().unreplied;

        const nextItem =
          index + 1 < unreplied.count
            ? unreplied.emails[index + 1]
            : null;

        const prevItem =
          index > 0
            ? unreplied.emails[index - 1]
            : null;

        const prefetchList = [
          {
            email: nextItem?.email1,
            thread: nextItem?.thread_id,
          },
          {
            email: prevItem?.email1,
            thread: prevItem?.thread_id,
          },
        ];

        prefetchList.forEach(async (item) => {
          if (!item.thread) return;

          const trimId = item.thread.trim();

          if (!getCache("threadMails", trimId)) {
            try {
              const data = await fetchGpc({ params: { type: "view_thread", thread_id: item.thread, email: item.email } });
              setCache("threadMails", trimId, {
                threadEmail: data.emails || [],
                count: data.total_emails ?? 0,
              });
            } catch (err) {
              console.error(
                "Prefetch Thread Failed",
                err
              );
            }
          }
        });
      }

      dispatch(threadEmailSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        threadEmailSlice.actions.getThreadEmailFailed(
          "Fetching Thread Email Failed"
        )
      );
    }
  };
};

export const threadEmailAction =
  threadEmailSlice.actions;

export default threadEmailSlice.reducer;