export const HOME_PAGE_PREFERENCE_KEY = "preference";
const LOGIN_REDIRECT_PENDING_KEY = "preferred-home-page-login-redirect-pending";

export const HOME_PAGE_OPTIONS = [
  { label: "Home screen", path: "/timeline" },
  { label: "Orders", path: "/entity/orders/list/table" },
  { label: "Deals", path: "/entity/deals/list/table" },
  { label: "Offers", path: "/entity/offers/list/table" },
  { label: "Inbox", path: "/entity/inbox/list/table" },
  { label: "Reminders", path: "/entity/reminders/list/table" },
  { label: "Link removal", path: "/entity/link-removal/list/table" },
  { label: "Reports", path: "/view-reports" },
];

export const getHomePagePreference = () => {
  try {
    const storedPath = localStorage.getItem(HOME_PAGE_PREFERENCE_KEY);

    return HOME_PAGE_OPTIONS.some(({ path }) => path === storedPath)
      ? storedPath
      : null;
  } catch {
    return null;
  }
};

export const markPreferredHomePageRedirectAfterLogin = () => {
  try {
    sessionStorage.setItem(LOGIN_REDIRECT_PENDING_KEY, "true");
  } catch {
    // The login can still continue when session storage is unavailable.
  }
};

export const consumePreferredHomePageAfterLogin = () => {
  try {
    if (sessionStorage.getItem(LOGIN_REDIRECT_PENDING_KEY) !== "true") {
      return null;
    }

    sessionStorage.removeItem(LOGIN_REDIRECT_PENDING_KEY);
    return getHomePagePreference();
  } catch {
    return null;
  }
};

export const setHomePagePreference = (path) => {
  if (!HOME_PAGE_OPTIONS.some((option) => option.path === path)) return false;

  try {
    localStorage.setItem(HOME_PAGE_PREFERENCE_KEY, path);
    return true;
  } catch {
    return false;
  }
};
