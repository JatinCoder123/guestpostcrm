import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";
import { createLedgerEntry, buildLedgerItem, updateActivity } from "../../services/utils";
import { getLadger } from "./ladger";
import { getContact, viewEmailAction } from "./viewEmail";

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState: {
    loading: false,
    items: [],
    count: 0,
    error: null,
    deleteMarketPlaceId: null,
    message: null,
  },
  reducers: {
    getMarketplaceRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getMarketplaceSuccess(state, action) {
      const { count, items } = action.payload;
      state.loading = false;
      state.items = items;
      state.count = count;
      state.error = null;
    },
    getMarketplaceFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    addMarketplaceRequest(state) {
      state.loading = true;
      state.error = null;
      state.message = null;
    },
    addMarketplaceSuccess(state, action) {
      state.loading = false;
      state.message = "Add To MarketPlace";
      state.error = null;
    },
    addMarketplaceFailed(state, action) {
      state.adding = false;
      state.error = action.payload;
      state.message = null;

    },
    deleteMarketplaceRequest(state, action) {
      state.loading = true;
      state.error = null;
      state.message = null;
      state.deleteMarketPlaceId = action.payload
    },
    deleteMarketplaceSuccess(state, action) {
      state.loading = false;
      state.deleteMarketPlaceId = null;
      state.message = "Remove From MarketPlace";
      state.error = null;
    },
    deleteMarketplaceFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
      state.deleteMarketPlaceId = null
      state.message = null
    },
    clearErrors(state) {
      state.error = null;
    },
    clearMessage(state) {
      state.message = null;
    },
  },
});

// Named export: thunk
export const getMarketplace = () => {
  return async (dispatch, getState) => {
    dispatch(marketplaceSlice.actions.getMarketplaceRequest());

    try {
      const response = await axios.get(
        `${getState().user.crmEndpoint}&type=get_marketplace`
      );

      const data = response.data;
      showConsole && console.log("MARKETPLACE:", data);

      dispatch(
        marketplaceSlice.actions.getMarketplaceSuccess({
          count: data.data_count ?? 0,
          items: data.data ?? [],
        })
      );

      dispatch(marketplaceSlice.actions.clearErrors());
    } catch (error) {
      dispatch(
        marketplaceSlice.actions.getMarketplaceFailed(
          "Fetching Marketplace Failed"
        )
      );
    }
  };
};
export const addMarketPlace = (email, brand = false) => {
  return async (dispatch, getState) => {
    dispatch(marketplaceSlice.actions.addMarketplaceRequest());
    let domain = '';
    if (brand) {
      domain = email.split('@')[1];
    }
    try {
      const { data } = await axios.post(
        `${getState().user.crmEndpoint}&type=setMarketPlace`, {
        email: email,
        domain: domain,
      },
      );
      showConsole && console.log("MARKETPLACE:", data);
      dispatch(marketplaceSlice.actions.addMarketplaceSuccess());
      dispatch(getMarketplace())
      dispatch(viewEmailAction.updateContactInfo({ key: "bulk" }))
      updateActivity(getState().user.crmEndpoint, email, getState().user.user.name, getState().user.user.email, "Add To MarketPlace")
      await createLedgerEntry({
        domain: getState().user.crmEndpoint.split("?")[0],
        email: email,
        group: "Activity",
        okHandler: () => dispatch(getLadger({ email, brand: getState().brandTimeline.showBrandTimeline })),

        items: [
          buildLedgerItem({
            status: "Marketplace-Added",
            detail: `email: {${email}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
      });
      dispatch(marketplaceSlice.actions.clearErrors());
    } catch (error) {
      dispatch(
        marketplaceSlice.actions.addMarketplaceFailed(
          "Add Marketplace Failed"
        )
      );
    }
  };
};
export const deleteMarketPlace = (id, action = false) => {
  return async (dispatch, getState) => {
    dispatch(marketplaceSlice.actions.deleteMarketplaceRequest(id));
    try {
      const { data } = await axios.post(`${getState().user.crmEndpoint}&type=delete_record&module_name=outr_marketplace&record_id=${id}`
      );
      showConsole && console.log(`Delete MarketPlace`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      dispatch(marketplaceSlice.actions.deleteMarketplaceSuccess());
      dispatch(getMarketplace())
      if (action) {
        dispatch(viewEmailAction.updateContactInfo({ key: "bulk" }))

      }
      else {
        dispatch(getContact(getState().viewEmail?.contactInfo?.email1, true, false))

      }

      updateActivity(getState().user.crmEndpoint, getState().ladger.email, getState().user.user.name, getState().user.user.email, "Remove From MarketPlace")
      await createLedgerEntry({
        domain: getState().user.crmEndpoint.split("?")[0],
        email: getState().ladger.email,
        okHandler: () => dispatch(getLadger({ email: getState().viewEmail?.contactInfo?.email1, brand: getState().brandTimeline.showBrandTimeline })),
        group: "Activity",
        items: [
          buildLedgerItem({
            status: "Marketplace-Removed",
            detail: `email: {${getState().ladger.email}}`,
            ladgerState: getState().ladger,
            user: getState().crmUser.currentUser,
          }),
        ],
      });
      dispatch(marketplaceSlice.actions.clearErrors());
    } catch (error) {
      dispatch(marketplaceSlice.actions.deleteMarketplaceFailed(error.message));
    }
  };
};

// Named export: slice actions
export const marketplaceActions = marketplaceSlice.actions;

// Default export: reducer
export default marketplaceSlice.reducer;
