import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";
import { getCache, setCache } from "../../services/cache";

const mailerSummarySlice = createSlice({
    name: "mailerSummary",
    initialState: {
        loading: false,
        mailersSummary: {},
        error: null,
    },
    reducers: {
        getMailerSummaryRequest(state) {
            state.loading = true;
            state.error = null;
            state.websites = [];
        },
        getMailerSummarySuccess(state, action) {
            const { mailersSummary } = action.payload;
            state.loading = false;
            state.mailersSummary = mailersSummary;
            state.error = null;
        },
        getMailerSummaryFailed(state, action) {
            state.loading = false;
            state.error = action.payload;
        },
        clearAllErrors(state) {
            state.error = null;
        },
    },
});

export const getMailerSummary = ({ loading = true, email, force = false }) => {
    return async (dispatch) => {
        dispatch(mailerSummarySlice.actions.getMailerSummaryRequest());
        try {
            if (!(force)) {
                const cachedData = getCache("mailer_summary", email);

                if (cachedData) {
                    dispatch(mailerSummarySlice.actions.getMailerSummarySuccess({ mailersSummary: cachedData.mailersSummary }));
                }
            }

            const data = await fetchGpc({ params: { type: "mailer_summary", email } })
            console.log(`Mailer Summary`, data);
            setCache("mailer_summary", email, { mailersSummary: data.mailers_summary });
            dispatch(mailerSummarySlice.actions.getMailerSummarySuccess({ mailersSummary: data.mailers_summary }));
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


                    if (!getCache("mailer_summary", prefetchEmail)) {
                        try {
                            const data = await fetchGpc({ params: { type: "mailer_summary", email: prefetchEmail } });
                            setCache("mailer_summary", prefetchEmail, {
                                mailersSummary: data.mailers_summary,
                            });
                        } catch (err) {
                            console.error("Ledger Prefetch Failed", err);
                        }
                    }
                });
            }

            dispatch(mailerSummarySlice.actions.clearAllErrors());
        } catch (error) {
            dispatch(mailerSummarySlice.actions.getMailerSummaryFailed("Fetching All Website Record Failed"));
        }
    };
};


export const mailerSummaryAction = mailerSummarySlice.actions;
export default mailerSummarySlice.reducer;
