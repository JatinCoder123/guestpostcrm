import { useEffect } from "react";
import { TimelinePage } from "./components/pages/TimelinePage";
import { UnrepliedEmailsPage } from "./components/pages/UnrepliedEmailsPage";
import { UnansweredPage } from "./components/pages/UnansweredPage";
import { DealsPage } from "./components/pages/DealsPage";
import { OffersPage } from "./components/pages/OffersPage";
import { OrdersPage } from "./components/pages/OrdersPage";
import { SpamDetectionPage } from "./components/pages/SpamDetectionPage";
import { InvoicesPage } from "./components/pages/InvoicesPage";
import { PaymentMissedPage } from "./components/pages/PaymentMissedPage";
import { LinkRemovalPage } from "./components/pages/LinkRemovalPage";
import { SettingsPage } from "./components/pages/settingpages/SettingsPage";
import { DealRemindersPage } from "./components/pages/DealRemindersPage";
import { useDispatch, useSelector } from "react-redux";
import { getLadger } from "./store/Slices/ladger";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";
import { AiCreditsPage } from "./components/pages/AiCreditsPage";
import { PageContextProvider } from "./context/pageContext";
import { OrderReminderPage } from "./components/pages/OrderReminderPage";
import { getUser, userAction } from "./store/Slices/userSlice";
import Login from "./components/pages/Login";
import LoadingPage from "./components/pages/LoadingPage";
import { toast, ToastContainer } from "react-toastify";
import { MachineLearningPage } from "./components/pages/settingpages/MachineLearningPage";
import { PaypalCredentials } from "./components/pages/settingpages/PaypalCredentialsPage";
import TemplatesPage from "./components/pages/settingpages/TemplatesPage";
import WebsitesPage from "./components/pages/settingpages/WebsitesPage";
import { UsersPage } from "./components/pages/settingpages/UsersPage";
import Contactpage from "./components/pages/Contactpage";
import ReportPage from "./components/pages/Reportpage";
import { ForwardedPage } from "./components/pages/ForwardedPage";
import { FavouritePage } from "./components/pages/FavouritePage";
import ErrorBoundary from "./components/ErrorBoundary";
import ButtonPage from "./components/pages/settingpages/ButtonPage";
import { MarkBulkPage } from "./components/pages/MarkBulkPage";

import { DefaulterPage } from "./components/pages/Defaulterpage";
import { OtherPage } from "./components/pages/OtherPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import CreateDeal from "./components/CreateDeal";
import AvatarPage from "./components/pages/AvatarPage";
const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "",
    element: (
      <ErrorBoundary>
        <RootLayout />
      </ErrorBoundary>
    ),
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
        path: "deals/create",
        element: <CreateDeal />,
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
        path: "order-reminders",
        element: <OrderReminderPage />,
      },
      {
        path: "timeline",
        element: <TimelinePage />,
      },
      {
        path: "contacts",
        element: <Contactpage />,
      },
      {
        path: "all-report",
        element: <ReportPage />,
      },

      {
        path: "forwarded-emails",
        element: <ForwardedPage />,
      },
      {
        path: "favourite-emails",
        element: <FavouritePage />,
      },
      {
        path: "mark-bulk",
        element: <MarkBulkPage />,
      },
      {
        path: "default-report",
        element: <DefaulterPage />,
      },
      {
        path: "other",
        element: <OtherPage />,
      },
      {
        path: "avatars",
        element: <AvatarPage />,
      },

      {
        path: "settings",
        element: <Outlet />,
        children: [
          {
            index: true,
            element: <SettingsPage />,
          },
          {
            path: "machine-learning",
            element: <MachineLearningPage />,
          },
          {
            path: "paypal-credentials",
            element: <PaypalCredentials />,
          },
          {
            path: "templates",
            element: <TemplatesPage />,
          },
          {
            path: "websites",
            element: <WebsitesPage />,
          },
          {
            path: "users",
            element: <UsersPage />,
          },
          {
            path: "buttons",
            element: <ButtonPage />,
          },
        ],
      },
    ],
  },
]);
export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.user
  );
  useEffect(() => {
    dispatch(getUser());
  }, []);
  useEffect(() => {
    if (isAuthenticated) dispatch(getLadger());
  }, [isAuthenticated]);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [dispatch, error]);
  return (
    <>
      {isAuthenticated && (
        <PageContextProvider>
          <ErrorBoundary>
            <RouterProvider router={router} />
          </ErrorBoundary>
        </PageContextProvider>
      )}
      {!isAuthenticated && loading && <LoadingPage />}
      {!isAuthenticated && !loading && <Login />}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark" // you can change to "light"
      />
    </>
  );
}
