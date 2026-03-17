export const AUTH_URL = "https://app.guestpostcrm.com/public/index.php";

export const CREATE_DEAL_URL =
  "https:/crm.outrightsystems.org/index.php?entryPoint=get_post_all";

export const CREATE_DEAL_API_KEY = "FldBjAIfoBo2UTcBAezvTOQg9";

export const LOCAL_KEY = "create_deals_draft_v1";


// Tiny Editor Keys
const TINY_EDITOR_KEYS = [
  "wxe4mys7j12zx0xko06e83is704loyh2pqxqutnir94xkjdi", // key 1
  "ywzwhwaf72xl7ncue9k3pwm9cgk0q84zs3ywgz7os7hcf48t", // key 2
  "44h09wg6an3xavho0jhamesgpqutfzvao5o4lir1tjfngtln", // key 3
];


// Function to get rotating key
function getTinyKey() {
  const day = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return TINY_EDITOR_KEYS[day % TINY_EDITOR_KEYS.length];
}

export const TINY_EDITOR_API_KEY = getTinyKey();