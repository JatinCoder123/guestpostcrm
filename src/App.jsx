import { useEffect } from "react";
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
import { useDispatch } from "react-redux";
import { getLadger } from "./store/Slices/ladger";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";
import { AiCreditsPage } from "./components/pages/AiCreditsPage";
import { PageContextProvider } from "./context/pageContext";
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
        path: "unreplied-emails",
        element: <UnrepliedEmailsPage />,
      },
      {
        path: "ai-credits",
        element: <AiCreditsPage />,
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
      <PageContextProvider>
        <RouterProvider router={router} />
      </PageContextProvider>
    </>
  );
}
