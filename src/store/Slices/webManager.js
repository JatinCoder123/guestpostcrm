import { createSlice } from "@reduxjs/toolkit";
import { showConsole } from "../../assets/assets";
import { fetchGpc } from "../../services/api";

const webManagerSlice = createSlice({
  name: "webManager",
  initialState: {
    loading: false,
    websites: [],
    count: 0,
    error: null,
    message: null,
    creating: false,
    updating: false,
    deleting: false,
    deleteWebsiteId: null,
  },
  reducers: {
    getWebsitesRequest(state) {
      state.loading = true;
      state.error = null;
    },
    getWebsitesSucess(state, action) {
      const { count, websites, summary = null } = action.payload;
      state.loading = false;
      state.websites = websites;
      state.summary = summary;
      state.count = count;
      state.error = null;
    },
    getWebsitesFailed(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    createWebsiteRequest(state) {
      state.creating = true;
      state.message = null;
      state.error = null;
    },
    createWebsiteSuccess(state, action) {
      state.creating = false;
      state.message = action.payload.message;
      state.error = null;
    },
    createWebsiteFailed(state, action) {
      state.creating = false;
      state.error = action.payload;
      state.message = null;
    },
    updateWebsiteRequest(state) {
      state.updating = true;
      state.message = null;
      state.error = null;
    },
    updateWebsiteSuccess(state, action) {
      state.updating = false;
      state.message = action.payload.message;
      state.websites = state.websites.map((website) =>
        website.id === action.payload.website.id
          ? { ...website, ...action.payload.website }
          : website,
      );
      state.error = null;
    },
    updateWebsiteFailed(state, action) {
      state.updating = false;
      state.error = action.payload;
      state.message = null;
    },
    deleteWebsiteRequest(state, action) {
      state.deleting = true;
      state.error = null;
      state.deleteWebsiteId = action.payload.id;
    },
    deleteWebsiteSuccess(state, action) {
      state.deleting = false;
      state.deleteWebsiteId = null;
      state.websites = state.websites.filter(
        (website) => website.id !== action.payload.id,
      );
      state.count = action.payload.count;
      state.message = action.payload.message;
      state.error = null;
    },
    deleteWebsiteFailed(state, action) {
      state.deleting = false;
      state.error = action.payload;
      state.deleteWebsiteId = null;
    },
    clearAllMessages(state) {
      state.message = null;
    },
    clearAllErrors(state) {
      state.error = null;
    },
  },
});

const buildWebsitePayload = (website, includeId = false) => {
  const payload = {
    website_name: website.website_name || website.name || website.website || "",
    slug: website.slug || "",
    maxAmount: website.maxAmount ?? website.amount ?? "",
    minAmount: website.minAmount ?? website.minimum_price ?? "",
  };

  if (includeId) {
    return {
      id: website.id,
      ...payload,
    };
  }

  return payload;
};

const assertSuccess = (data) => {
  if (data?.success === false) {
    throw new Error(data.message);
  }
};

export const getManageWeb = (loading = true) => {
  return async (dispatch) => {
    if (loading) {
      dispatch(webManagerSlice.actions.getWebsitesRequest());
    }
    try {
      const data = await fetchGpc({ params: { type: "get_website" } });
      showConsole && console.log(`WEBSITE MANAGER SITEs`, data);
      if (!data.success) {
        throw new Error();
      }
      dispatch(
        webManagerSlice.actions.getWebsitesSucess({
          count: data.data_count ?? data.data?.length ?? 0,
          websites: data.data ?? [],
          summary: data.summary ?? null,
        }),
      );
      dispatch(webManagerSlice.actions.clearAllErrors());
    } catch {
      dispatch(
        webManagerSlice.actions.getWebsitesFailed(
          "Fetching Manger Website Failed",
        ),
      );
    }
  };
};

export const createWebsite = (website) => {
  return async (dispatch) => {
    dispatch(webManagerSlice.actions.createWebsiteRequest());

    try {
      const payload = buildWebsitePayload(website);
      const data = await fetchGpc({
        method: "POST",
        params: { type: "get_website" },
        body: payload,
      });

      showConsole && console.log("Create Manager Website", data);
      assertSuccess(data);
      dispatch(
        webManagerSlice.actions.createWebsiteSuccess({
          message: data.message ?? "Website Created Successfully",
        }),
      );
      dispatch(getManageWeb(false));
      dispatch(webManagerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        webManagerSlice.actions.createWebsiteFailed(
          error.message ?? "Website Creation Failed",
        ),
      );
    }
  };
};

export const updateWebsite = (website, options = {}) => {
  const { successMessage, failureMessage, idOnly = false } = options;
  return async (dispatch) => {
    dispatch(webManagerSlice.actions.updateWebsiteRequest());

    try {
      // Refresh path only needs the id so the backend can re-scrape without
      // touching the existing fields. Edit path sends the full payload.
      const payload = idOnly
        ? { id: website.id }
        : buildWebsitePayload(website, true);
      const data = await fetchGpc({
        method: "PUT",
        params: { type: "get_website" },
        body: payload,
      });

      showConsole && console.log("Update Manager Website", data);
      assertSuccess(data);
      dispatch(
        webManagerSlice.actions.updateWebsiteSuccess({
          website: payload,
          message:
            successMessage ?? data.message ?? "Website Updated Successfully",
        }),
      );
      dispatch(getManageWeb(false));
      dispatch(webManagerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        webManagerSlice.actions.updateWebsiteFailed(
          error.message ?? failureMessage ?? "Website Update Failed",
        ),
      );
    }
  };
};

export const deleteWebsite = (website) => {
  return async (dispatch, getState) => {
    dispatch(webManagerSlice.actions.deleteWebsiteRequest({ id: website.id }));

    try {
      const payload = {
        id: website.id,
        website_name:
          website.website_name || website.name || website.website || "",
      };
      const data = await fetchGpc({
        method: "DELETE",
        params: { type: "get_website" },
        body: payload,
      });

      showConsole && console.log("Delete Manager Website", data);
      assertSuccess(data);
      dispatch(
        webManagerSlice.actions.deleteWebsiteSuccess({
          id: website.id,
          count: Math.max((getState().webManager.count ?? 1) - 1, 0),
          message: data.message ?? "Website Deleted Successfully",
        }),
      );
      dispatch(getManageWeb(false));
      dispatch(webManagerSlice.actions.clearAllErrors());
    } catch (error) {
      dispatch(
        webManagerSlice.actions.deleteWebsiteFailed(
          error.message ?? "Website Delete Failed",
        ),
      );
    }
  };
};

export const webManagerAction = webManagerSlice.actions;
export default webManagerSlice.reducer;
