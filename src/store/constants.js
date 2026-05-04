export const AUTH_URL = "https://app.guestpostcrm.com/public/index.php";

export const CREATE_DEAL_URL =
  "https:/crm.outrightsystems.org/index.php?entryPoint=get_post_all";

export const CREATE_DEAL_API_KEY = "FldBjAIfoBo2UTcBAezvTOQg9";
export const FETCH_GPC_X_API_KEY = "nmD5WeHdY8i4kTUK!.7_Fzp7}K@AAX1X";

export const LOCAL_KEY = "create_deals_draft_v1";

// Tiny Editor Keys
const TINY_EDITOR_KEYS = [
  "yafcvj676aralwgcexthy7sckzm80mima0kw290ow95jar14", // key 2
];

// Function to get rotating key
function getTinyKey() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return TINY_EDITOR_KEYS[day % TINY_EDITOR_KEYS.length];
}

export const TINY_EDITOR_API_KEY = getTinyKey();
