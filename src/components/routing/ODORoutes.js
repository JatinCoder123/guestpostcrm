import EditDeal from "../pages/deals/EditDeal";
import EditOrder from "../pages/orders/EditOrder";
import EditOffer from "../pages/offers/EditOffer";

import CreateOffers from "../pages/offers/CreateOffers";
import CreateDeals from "../pages/deals/CreateDeals";
import CreateOrders from "../pages/orders/CreateOrders";
import ThreadOffers from "../pages/offers/ThreadOffers";
import ThreadDeals from "../pages/deals/ThreadDeals";
import ThreadOrders from "../pages/orders/ThreadOrders";
import ViewOffer from "../pages/offers/ViewOffer";
import ViewDeal from "../pages/deals/ViewDeal";
import ViewOrder from "../pages/orders/ViewOrder";
import { OffersPage } from "../pages/OffersPage";
import { OrdersPage } from "../pages/OrdersPage";
import { DealsPage } from "../pages/DealsPage";


// 🔥 CENTRAL CONFIG
export const ODO_ROUTES = {
    orders: {
        label: "orders",
        list: OrdersPage,
        create: CreateOrders,
        edit: EditOrder,
        view: ViewOrder,
        threadList: ThreadOrders
    },
    offers: {
        label: "offers",
        list: OffersPage,
        create: CreateOffers,
        edit: EditOffer,
        view: ViewOffer,
        threadList: ThreadOffers
    },
    deals: {
        label: "deals",
        list: DealsPage,
        create: CreateDeals,
        edit: EditDeal,
        view: ViewDeal,
        threadList: ThreadDeals
    },
};