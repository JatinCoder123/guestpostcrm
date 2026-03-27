export const AUTH_URL = "https://app.guestpostcrm.com/public/index.php";

export const CREATE_DEAL_URL =
  "https:/crm.outrightsystems.org/index.php?entryPoint=get_post_all";

export const CREATE_DEAL_API_KEY = "FldBjAIfoBo2UTcBAezvTOQg9";

export const LOCAL_KEY = "create_deals_draft_v1";


// Tiny Editor Keys
const TINY_EDITOR_KEYS = [
  "2f8096h5xt9z0oi2cmdjt3klvuz43rax7t42mwi0qqbdjedf", // key 1
];


// Function to get rotating key
function getTinyKey() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return TINY_EDITOR_KEYS[day % TINY_EDITOR_KEYS.length];
}

export const TINY_EDITOR_API_KEY = getTinyKey();