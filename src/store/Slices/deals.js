import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { CREATE_DEAL_API_KEY } from "../constants";
import { extractEmail, getDomain, showConsole } from "../../assets/assets";
import {
  updateActivity,
  buildLedgerItem,
  createLedgerEntry,
} from "../../services/utils";
import { getLadger } from "./ladger";

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
  },
});

export const getDeals = ({ email = null, page = 1, loading = true }) => {
  return async (dispatch, getState) => {
    if (loading) {
      dispatch(dealsSlice.actions.getDealsRequest());
    }

    try {
      let { data } = await axios.get(
        `${getState().user.crmEndpoint
        }&type=get_deals${getState().ladger.timeline !== null && getState().ladger.timeline !== "null" ? `&filter=${getState().ladger.timeline}` : ""}&page=${page}&page_size=50${email ? `&email=${email}` : ""}`,
      );

      showConsole && console.log(`Deals`, data);
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
    const state = getState();
    const getDomain = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };

    try {
      const res = await axios.post(`${domain}?entryPoint=get_deal_details`, {
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
      });
      const remRes = await axios.post(
        `${getState().user.crmEndpoint}&type=set_reminder`,
        {
          websites: deals.map((deal) => deal.website_c),
          email: email,
          reminder_type: "deal",
        },
      );
      showConsole && console.log(`Create Deal`, res.data);
      showConsole && console.log(`Reminder Response`, remRes);
      dispatch(
        dealsSlice.actions.createDealSucess({
          message: "Deals Created Successfully",
        }),
      );
      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        state.user.crmEndpoint,
        email,
        state.user.user.name,
        state.user.user.email,
        "Deal Created",
      );

      createLedgerEntry({
        domain,
        email,
        thread_id: threadId,
        message_id: res.data.id,
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
        okHandler: () => getLadger({ email }),
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
export const updateDeal = ({ deal, email }) => {
  return async (dispatch, getState) => {
    const state = getState();
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
      const noteRes = await axios.post(
        `${getState().user.crmEndpoint}&type=take_notes`,
        {
          record_id: deal.id,
          notes: deal.note,
          type1: "deals",
        },
      );
      const { data } = await axios.post(
        `${domain}?entryPoint=get_post_all&action_type=post_data`,
        {
          parent_bean: {
            module: "outr_deal_fetch",
            ...deal,
          },
        },
        {
          headers: {
            "X-Api-Key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );
      const remRes = await axios.post(
        `${getState().user.crmEndpoint}&type=set_reminder`,
        {
          websites: [deal.website_c],
          email: email,
          reminder_type: "deal",
        },
      );
      showConsole && console.log(`Update Deal`, data);
      showConsole && console.log(`Reminder Response`, remRes);
      const updatedDeals = getState().deals.deals.map((d) => {
        if (d.id === deal.id) {
          return {
            ...deal,
          };
        }
        return d;
      });
      dispatch(
        dealsSlice.actions.updateDealSucess({
          message: `Deal Updated successfully`,
          deals: updatedDeals,
        }),
      );
      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        getState().user.crmEndpoint,
        extractEmail(deal.real_name),
        getState().user.user.name,
        getState().user.user.email,
        "Deal Updated",
      );
      console.log(`Deal`, deal);
      const res = await createLedgerEntry({
        domain,
        email,
        group: "Deal",
        items: [
          buildLedgerItem({
            status: "Deal-Updated",
            detail: `website: {${getDomain1(deal.website_c)}} amount: {${deal.dealamount}}`,
            ladgerState: state.ladger,
            user: state.crmUser.currentUser,
            parent_name: "outr_deal",
          }),
        ],
        okHandler: () => dispatch(getLadger({ email })),
      });
      console.log(`Ledger Entry`, res);
    } catch (error) {
      dispatch(dealsSlice.actions.updateDealFailed("Deal Update Failed"));
    }
  };
};
export const deleteDeal = (deal, email, id) => {
  0
  return async (dispatch, getState) => {
    const getDomain1 = (url) => {
      try {
        return new URL(url).hostname.replace(/^www\./, "");
      } catch (e) {
        return url;
      }
    };
    const state = getState();
    dispatch(dealsSlice.actions.deleteDealRequest({ id }));
    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=delete_record&module_name=outr_deal_fetch&record_id=${id}`,
      );
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
      dispatch(dealsSlice.actions.clearAllErrors());
      updateActivity(
        getState().user.crmEndpoint,
        email,
        getState().user.user.name,
        getState().user.user.email,
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
            user: state.crmUser.currentUser,
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
