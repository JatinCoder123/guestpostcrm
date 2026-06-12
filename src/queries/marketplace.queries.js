import {

    useQuery,
} from "@tanstack/react-query";
import { getMarketPlaces } from "../api/marketplace.api";



export const marketPlaceKeys = {
    all: ["marketplace"],

    lists: [
        "marketplace",
        "list",
    ],

};


export const useMarketPlace = () =>
    useQuery({
        queryKey:
            marketPlaceKeys.lists,

        queryFn: () => getMarketPlaces(),

    });



