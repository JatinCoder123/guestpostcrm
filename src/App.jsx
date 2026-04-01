import { useEffect } from "react";
import { TimelinePage } from "./components/pages/TimelinePage";
import { UnrepliedEmailsPage } from "./components/pages/UnrepliedEmailsPage";
import { Marketplace } from "./components/pages/Marketplace";
import { RecentEntry } from "./components/pages/RecentEntry";
import { Duplicate } from "./components/pages/DuplicatePage";
import { SpamDetectionPage } from "./components/pages/SpamDetectionPage";
import { TagManagerpage } from "./components/pages/TagManagerpage";
import { SystemSuggestionsPage } from "./components/pages/SystemSuggestionsPage";
import { DraftInvoice } from "./components/pages/DraftInvoice";
import { InvoicesPage } from "./components/pages/InvoicesPage";
import { SettingsPage } from "./components/pages/settingpages/SettingsPage";
import { useDispatch, useSelector } from "react-redux";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import RootLayout from "./RootLayout";
import { AiCreditsPage } from "./components/pages/AiCreditsPage";
import { PageContextProvider } from "./context/pageContext";
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
import { ForwardedPage } from "./components/pages/ForwardedPage";
import { FavouritePage } from "./components/pages/FavouritePage";
import ErrorBoundary from "./components/ErrorBoundary";
import ButtonPage from "./components/pages/settingpages/ButtonPage";
import { DefaulterPage } from "./components/pages/Defaulterpage";
import { OtherPage } from "./components/pages/OtherPage";
import NotFoundPage from "./components/pages/NotFoundPage";
import CreateDeal from "./components/CreateDeal";
import AvatarPage from "./components/pages/AvatarPage";
import { MovedPage } from "./components/pages/MovedEmails";
import { SocketContextProvider } from "./context/SocketContext";
import { BacklinksPage } from "./components/pages/BacklinksPage";
import CreateOrder from "./components/CreateOrder";
import { ReminderPage } from "./components/pages/ReminderPage";
import { LinkExchangePage } from "./components/pages/LinkExchangePage";
import CreateOffer from "./components/CreateOffer";
import { HotPage } from "./components/pages/HotPage";
import ViewReports from "./components/ViewReports";
import GpcControllerPage from "./components/pages/GpcControllerPage";
import ConsoleHandler from "./components/ConsoleHandler";
import PromptTestingPage from "./components/pages/settingpages/PromptTestingPage";
import ThreadReply from "./components/pages/threads/ThreadReply";
import ThreadView from "./components/pages/threads/ThreadView";
import { ThreadContextProvider } from "./context/ThreadContext";
import Debug from "./components/pages/settingpages/Debug";
import Thread from "./components/pages/threads/Thread";
import SelfTest from "./components/pages/settingpages/SelfTest";
import DynamicRouteHandler from "./components/routing/DynamicRouteHandler";

const router = createBrowserRouter([
  {
    path: "*",
    element: <NotFoundPage />,
  },
  {
    path: "",
    element: (
      <ThreadContextProvider>
        <PageContextProvider>
          <SocketContextProvider>
            <ErrorBoundary>
              <RootLayout />
            </ErrorBoundary>
          </SocketContextProvider>
        </PageContextProvider>
      </ThreadContextProvider>

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
        path: "tag-manager",
        element: <TagManagerpage />,
      },
      {
        path: "system-suggestion",
        element: <SystemSuggestionsPage />,
      },

      {
        path: "draft-invoice",
        element: <DraftInvoice />,
      },
      {
        path: "contacts/:id?",
        element: <Contactpage />,
      },
      {
        path: "console",
        element: <ConsoleHandler />,
      },

      {
        path: "Marketplace",
        element: <Marketplace />,
      },

      {
        path: "RecentEntry",
        element: <RecentEntry />,
      },
      {
        path: "duplicates",
        element: <Duplicate />,
      },

      {
        path: ":type",
        element: <DynamicRouteHandler mode="list" />,
      },
      {
        path: ":type/view",
        element: <DynamicRouteHandler mode="list" />,
      },
      {
        path: ":type/create",
        element: <DynamicRouteHandler mode="create" />,
      },
      {
        path: ":type/edit",
        element: <DynamicRouteHandler mode="edit" />,
      },
      {
        path: "invoices",
        element: <InvoicesPage />,
      },
      {
        path: "link-exchange",
        element: <LinkExchangePage />,
      },

      {
        path: "reminders/:id?",
        element: <ReminderPage />,
      },

      {
        path: "view-reports/:id?",
        element: <ViewReports />,
      },

      {
        path: "timeline",
        element: <TimelinePage />,
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
        path: "market-place",
        element: <Marketplace />,
      },
      {
        path: "default-report",
        element: <DefaulterPage />,
      },
      {
        path: "moved-emails",
        element: <MovedPage />,
      },
      {
        path: "backlinks",
        element: <BacklinksPage />,
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
        path: "hot-records",
        element: <HotPage />,
      },
      {
        path: "thread",
        element: <Thread />,
        children: [
          {
            path: "view",
            element: <ThreadView />,
          },
          {
            path: "reply",
            element: <ThreadReply />,
          },
        ],
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
          {
            path: "controller",
            element: <GpcControllerPage />,
          },
          {
            path: "prompt-testing",
            element: <PromptTestingPage />,
          },
          {
            path: "debugging",
            element: <Debug />,
          },
          {
            path: "self-test",
            element: <SelfTest />,
          },
        ],
      },
    ],
  },
]);
export default function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, loading, error } = useSelector(
    (state) => state.user,
  );
  useEffect(() => {
    dispatch(getUser());
  }, []);
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(userAction.clearAllErrors());
    }
  }, [dispatch, error]);
  return (
    <>
      {isAuthenticated && (
        <RouterProvider router={router} />
      )
      }
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
