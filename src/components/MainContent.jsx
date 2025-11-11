import { TimelinePage } from "./pages/TimelinePage";
import { LivePage } from "./pages/LivePage";
import { UnrepliedEmailsPage } from "./pages/UnrepliedEmailsPage";
import { SpamDetectionPage } from "./pages/SpamDetectionPage";
import { UnansweredPage } from "./pages/UnansweredPage";
import { DealsPage } from "./pages/DealsPage";
import { OffersPage } from "./pages/OffersPage";
import { OrdersPage } from "./pages/OrdersPage";
import { InvoicesPage } from "./pages/InvoicesPage";
import { PaymentMissedPage } from "./pages/PaymentMissedPage";
import { LinkRemovalPage } from "./pages/LinkRemovalPage";
import { DealRemindersPage } from "./pages/DealRemindersPage";

export function MainContent({ activePage }) {
  const renderPage = () => {
    switch (activePage) {
      case "timeline":
        return <TimelinePage />;
      case "live":
        return <LivePage />;
      case "unreplied":
        return <UnrepliedEmailsPage />;
      case "spam":
        return <SpamDetectionPage />;
      case "unanswered":
        return <UnansweredPage />;
      case "deals":
        return <DealsPage />;
      case "offers":
        return <OffersPage />;
      case "orders":
        return <OrdersPage />;
      case "invoices":
        return <InvoicesPage />;
      case "payment-missed":
        return <PaymentMissedPage />;
      case "link-removal":
        return <LinkRemovalPage />;
      case "deal-reminders":
        return <DealRemindersPage />;
      default:
        return <TimelinePage />;
    }
  };

  return <div className="flex-1 overflow-y-auto p-8">{renderPage()}</div>;
}
