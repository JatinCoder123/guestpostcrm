import { useEffect } from "react";
import { LivePage } from "./components/pages/LivePage";
import { TimelinePage } from "./components/pages/TimelinePage";
import { UnrepliedEmailsPage } from "./components/pages/UnrepliedEmailsPage";
import { SpamDetectionPage } from "./components/pages/SpamDetectionPage";
import { UnansweredPage } from "./components/pages/UnansweredPage";
import { DealsPage } from "./components/pages/DealsPage";
import { OffersPage } from "./components/pages/OffersPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import { InvoicesPage } from "./components/pages/InvoicesPage";
import { PaymentMissedPage } from "./components/pages/PaymentMissedPage";
import { LinkRemovalPage } from "./components/pages/LinkRemovalPage";
import { DealRemindersPage } from "./components/pages/DealRemindersPage";
import { useDispatch, useSelector } from "react-redux";
import { getLadger } from "./store/Slices/ladger";
import { getUnansweredEmails } from "./store/Slices/unansweredEmails";
import { getUnrepliedEmail } from "./store/Slices/unrepliedEmails";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";
const router = createBrowserRouter([
  {
    path: "/Dashboard",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <TimelinePage />,
      },
      {
        path: "live",
        element: <LivePage />,
      },
      {
        path: "unreplied-emails",
        element: <UnrepliedEmailsPage />,
      },
      {
        path: "spam-detection",
        element: <SpamDetectionPage />,
      },
      {
        path: "unanswered",
        element: <UnansweredPage />,
      },
      {
        path: "deals",
        element: <DealsPage />,
      },
      {
        path: "offers",
        element: <OffersPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "payment-missed",
        element: <PaymentMissedPage />,
      },
      {
        path: "link-removal",
        element: <LinkRemovalPage />,
      },
      {
        path: "deal-reminders",
        element: <DealRemindersPage />,
      },
      {
        path: "timeline",
        element: <TimelinePage />,
      },
    ],
  },
]);
export default function App() {
    const dispatch = useDispatch();
  useEffect(() => {
 dispatch(getLadger());
  }, []);
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
