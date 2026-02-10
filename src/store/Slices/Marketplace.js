import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showConsole } from "../../assets/assets";

const marketplaceSlice = createSlice({
  name: "marketplace",
  initialState: {
    loading: false,
    items: [],
    count: 0,
    error: null,
    deleteMarketPlaceId: null,
    adding: false,
    message: null,
    deleting: false
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
      state.adding = false;
      state.error = action.payload;
    },
    addMarketplaceRequest(state) {
      state.adding = true;
      state.error = null;
      state.message = null;
    },
    addMarketplaceSuccess(state, action) {
      const { count, items } = action.payload;
      state.adding = false;
      state.items = items;
      state.count = count;
      state.message = "Add To MarketPlace";
      state.error = null;
    },
    addMarketplaceFailed(state, action) {
      state.adding = false;
      state.error = action.payload;
      state.message = null;

    },
    deleteMarketplaceRequest(state, action) {
      state.deleting = true;
      state.error = null;
      state.message = null;
      state.deleteMarketPlaceId = action.payload
    },
    deleteMarketplaceSuccess(state, action) {
      const { count, items } = action.payload;
      state.deleting = false;
      state.items = items;
      state.count = count;
      state.deleteMarketPlaceId = null;
      state.message = "Remove From MarketPlace";
      state.error = null;
    },
    deleteMarketplaceFailed(state, action) {
      state.deleting = false;
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
      const newItem = {
        id: data.id,
        date_entered: '0 min ago',
        name: email,
        description: domain
      }
      dispatch(
        marketplaceSlice.actions.addMarketplaceSuccess({
          items: [newItem, ...getState().marketplace.items],
          count: getState().marketplace.count + 1,
        })
      );
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
export const deleteMarketPlace = (id) => {
  return async (dispatch, getState) => {
    dispatch(marketplaceSlice.actions.deleteMarketplaceRequest(id));
    try {
      const { data } = await axios.post(`${getState().user.crmEndpoint}&type=delete_record&module_name=outr_marketplace&record_id=${id}`
      );
      showConsole && console.log(`Delete MarketPlace`, data);
      if (!data.success) {
        throw new Error(data.message);
      }
      const updatedMarketPlace = getState().marketplace.items.filter((item) => item.id !== id);

      dispatch(
        marketplaceSlice.actions.deleteMarketplaceSuccess({
          items: updatedMarketPlace,
          count: getState().marketplace.count - 1,
        })
      );
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
