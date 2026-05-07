import { createSlice } from "@reduxjs/toolkit";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, getDomain, showConsole } from "../../assets/assets";
import { applyHashtag } from "../../services/utils";
import {
  updateActivity,
  buildLedgerItem,
  createLedgerEntry,
} from "../../services/utils";
import { getLadger } from "./ladger";
import { apiRequest, fetchGpc } from "../../services/api";

const dealsSlice = createSlice({
  name: "deals",
  initialState: {
    loading: false,
    creating: false,
    deals: [],
    count: 0,
    pageCount: 1,
    pageIndex: 1,
    error: null,
    summary: null,
    message: null,
    updating: false,
    deleting: false,
    deleteDealId: null,
  },
  reducers: {
    getDealsRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getDealsSucess(state, action) {
      const { count, deals, pageCount, summary, pageIndex } = action.payload;
      state.loading = false;
      if (pageIndex === 1) {
        state.deals = deals;
      } else {
        state.deals = [...state.deals, ...deals];
      }
      state.count = count;
      state.summary = summary;
      state.pageCount = pageCount;
      state.pageIndex = pageIndex;
      state.error = null;
    },
    getDealsFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createDealRequest(state) {
      state.creating = true;
      state.message = null;
      state.error = null;
    },
    createDealSucess(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.error = null;
    },
    createDealFailed(state, action) {
      state.creating = false;
      state.message = null;
      state.error = action.payload;
    },
    updateDealRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    updateDealSucess(state, action) {
      state.updating = false;
      state.deals = action.payload.deals;
      state.message = action.payload.message;
      state.error = null;
    },
    updateDealFailed(state, action) {
      state.updating = false;
      state.message = null;
      state.error = action.payload;
    },
    deleteDealRequest(state, action) {
      state.deleting = true;
      state.error = null;
      state.deleteDealId = action.payload.id;
    },
    deleteDealSuccess(state, action) {
      state.deleting = false;
      state.deals = action.payload.deals;
      state.count = action.payload.count;
      state.deleteDealId = null;
      state.error = null;
    },
    deleteDealFailed(state, action) {
      state.deleting = false;
      state.deleteDealId = null;
      state.error = action.payload;
    },
    clearAllErrors(state) {
      state.error = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
    UpdateDeals(state, action) {
      state.deals = action.payload;
    },
    setDeals(state, action) {
      const deal = action.payload;
      state.count = deal?.data_count ?? 0
      state.deals = deal?.data ?? []
      state.summary = deal?.summary ?? []
    }
  },
});

export const getDeals = ({ email = null, page = 1, loading = true, brand = false }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(dealsSlice.actions.getDealsRequest());
    }

    try {
      let res;
      const timeline = getState().ladger.timeline
      const params = { ...(timeline && timeline !== "null" ? { filter: timeline } : {}), email, page, page_size: "50" }
      brand ? res = await fetchGpc({ params: { type: "brandTimeline", case: "deal", ...params } })
        : res = await fetchGpc({ params: { type: "get_deals", ...params } });
      const data = brand ? res.data.deal : res
      showConsole && console.log(`${brand ? "Brand" : ""} Deals`, data);
      dispatch(
        dealsSlice.actions.getDealsSucess({
          count: data.data_count ?? 0,
          deals: data.data,
          pageCount: data.total_pages ?? 1,
          pageIndex: data.current_page ?? 1,
          summary: data.summary ?? null,
        }),
      );
      dispatch(dealsSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(dealsSlice.actions.getDealsFailed("Fetching Deal  Failed"));
    }
  };
};
export const createDeal = ({ threadId, email, deals = [], isSend = false }) => {
  return async (dispatch, getState) => {
    dispatch(dealsSlice.actions.createDealRequest());
    const domain = getState().user.crmEndpoint.split("?")[0];
    const crmEndpoint = getState().user.crmEndpoint;

    const triggerHashtag = (memo_no, method = "GET") => {
      applyHashtag({
        domain: crmEndpoint,
        email,
        memo_no,
        method,
      });
    };
    const state = getState();
    const getDomain = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };

    try {
      const data = await apiRequest({
        endpoint: `${domain}?entryPoint=get_deal_details`, body: {
          records: deals.map((deal) => ({
            amount: deal.dealamount,
            email: email,
            website: deal.website_c,
            thread_id: threadId,
          })),
          child_bean: {
            module: "Contacts",
            id: state.viewEmail.contactInfo.id,
            email: email,
          },
        }, method: "POST"
      });
      const remRes = await fetchGpc({
        params: { type: 'set_reminder' }, body: {
          websites: deals.map((deal) => deal.website_c),
          email: email,
          reminder_type: "deal",
        }, method: "POST"
      })
      showConsole && console.log(`Create Deal`, data);
      showConsole && console.log(`Reminder Response`, remRes);
      dispatch(
        dealsSlice.actions.createDealSucess({
          message: "Deals Created Successfully",
        }),
      );
      // ✅ Trigger hashtag for Deal Creation (memo_no = 10)
      triggerHashtag(14, "GET");

      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        email,
        "Deal Created",
      );

      createLedgerEntry({
        domain,
        email,
        thread_id: threadId,
        message_id: data.id,
        group: "Deal",
        items: deals.map((deal) =>
          buildLedgerItem({
            status: "Deal-Created",
            detail: `website: {${getDomain(deal.website_c)}} amount: {${deal.dealamount}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
            parent_name: "outr_deal",
          }),
        ),
        okHandler: () => dispatch(getLadger({ email, loading: false })),
      });
    } catch (error) {
      dispatch(
        dealsSlice.actions.createDealFailed(
          "Deal Creation Failed! Please Try Again",
        ),
      );
    }
  };
};
export const updateDeal = ({ deals = [] }) => {
  return async (dispatch, getState) => {
    const state = getState();
    const email = extractEmail(deals[0]?.real_name ?? deals[0]?.email)

    const getDomain1 = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };
    dispatch(dealsSlice.actions.updateDealRequest());
    try {
      const domain = getState().user.crmEndpoint.split("?")[0];
      const crmEndpoint = getState().user.crmEndpoint;

      const triggerHashtag = (memo_no, method = "GET") => {
        applyHashtag({
          domain: crmEndpoint,
          email,
          memo_no,
          method,
        });
      };
      deals.forEach(async (deal) => {
        await fetchGpc({
          params: { type: 'take_notes' }, body: {
            record_id: deal.id,
            notes: deal.note,
            type1: "deals",
          }, method: "POST"
        })
      });

      deals.forEach(async (deal) => {
        const data = await apiRequest({
          endpoint: `${domain}?entryPoint=get_post_all`, method: "POST", params: { action_type: "post_data" }, body: {
            parent_bean: {
              module: "outr_deal_fetch",
              ...deal,
            },
          }, headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        }

        );
        showConsole && console.log(`UPdate Deal`, data);
      });
      const remRes = await fetchGpc({
        params: { type: 'set_reminder' }, body: {
          websites: deals.map((deal) => deal.website_c),
          email: email,
          reminder_type: "deal",
        }, method: "POST"
      }

      );
      showConsole && console.log(`Reminder Response`, remRes);
      const updatedDeals = getState().deals.deals.map((d) => {
        const updated = deals.find((ud) => ud.id === d.id);
        return updated ? updated : d;
      });
      dispatch(
        dealsSlice.actions.updateDealSucess({
          message: `Deal Updated successfully`,
          deals: updatedDeals,
        }),
      );
      // ✅ Trigger hashtag for Deal Update (memo_no = 13)
      triggerHashtag(15, "GET");
      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        email,

        "Deal Updated",
      );
      const res = await createLedgerEntry({
        domain,
        email,
        group: "Deal",
        items: deals.map((deal) =>
          buildLedgerItem({
            status: "Deal-Updated",
            detail: `website: {${getDomain1(deal.website_c)}} amount: {${deal.dealamount}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
            parent_name: "outr_deal",
          }),
        ),
        okHandler: () => dispatch(getLadger({ email, loading: false })),
      });
      console.log(`Ledger Entry`, res);
    } catch (error) {
      dispatch(dealsSlice.actions.updateDealFailed("Deal Update Failed"));
    }
  };
};
export const deleteDeal = (deal, id) => {
  0;
  return async (dispatch, getState) => {
    const email = extractEmail(deal?.real_name ?? deal?.email)
    const getDomain1 = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };
    const state = getState();
    const crmEndpoint = getState().user.crmEndpoint;

    const triggerHashtag = (memo_no, method = "GET") => {
      applyHashtag({
        domain: crmEndpoint,
        email,
        memo_no,
        method,
      });
    };
    dispatch(dealsSlice.actions.deleteDealRequest({ id }));
    try {
      const data = await fetchGpc({ params: { type: 'delete_record', module_name: 'outr_deal_fetch', record_id: id }, method: "POST" })
      showConsole && console.log(`Delete Deal`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedDeals = getState().deals.deals.filter(
        (deal) => deal.id !== id,
      );
      dispatch(
        dealsSlice.actions.deleteDealSuccess({
          deals: updatedDeals,
          count: getState().deals.count - 1,
        }),
      );
      // ✅ Trigger hashtag for Deal Deletion (memo_no = 16)
      triggerHashtag(16, "GET");
      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        email,

        "Deal Deleted",
      );

      console.log(`Deal`, deal);

      const res = await createLedgerEntry({
        domain: state.user.crmEndpoint.split("?")[0],
        email: email,
        group: "Deal",
        okHandler: () => dispatch(getLadger({ email })),
        items: [
          buildLedgerItem({
            status: "Deal-Deleted",
            detail: `website: {${getDomain1(deal?.website_c)}}`,
            ladgerState: state.ladger,
            user: state.user.user,
            parent_name: "outr_deal",
          }),
        ],
      });
      console.log(`Ledger Entry`, res);
    } catch (error) {
      dispatch(dealsSlice.actions.deleteDealFailed(error.message));
    }
  };
};

export const dealsAction = dealsSlice.actions;
export default dealsSlice.reducer;
