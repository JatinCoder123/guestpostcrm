// orders.api.js

import { fetchGpc, http } from "../services/api";
export const getMarketPlaces = async () => await fetchGpc({ params: { type: "get_marketplace" } })

