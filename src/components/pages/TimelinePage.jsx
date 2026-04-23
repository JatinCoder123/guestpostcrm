import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Avatar from "../Avatar";
import LoadingSkeleton from "../LoadingSkeleton";
import Ip from "../Ip";
import TimelineEvent from "../TimelineEvent";
import MailerSummaryHeader from "../MailerSummaryHeader";
import ContactHeader from "../ContactHeader";
import ActionButton from "../ActionButton";
import { NoSearchFoundPage } from "../NoSearchFoundPage";

import MessageModal from "../MessageModal";
import LatestMessage from "../LatestMessage";
export function TimelinePage() {
  const [showAvatar, setShowAvatar] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [isMark, setIsMark] = useState(false);
  const { items: marketPlaces } = useSelector((s) => s.marketplace);

  useEffect(() => {
    if (marketPlaces.length > 0) {
      setIsMark(marketPlaces.find((e) => e.name === contactInfo?.email1));
    } else {
      setIsMark(false);
    }
  }, [marketPlaces]);
  const { loading: ladgerLoading, ladger } = useSelector((state) => state.ladger);

  const handleMessageClick = (id) => {
    console.log("Message clicked:", id);
    setSelectedMessage(id);
    setShowMessageModal(true);
  };
  const { viewEmail, threadId, count, contactInfo, contactLoading, loading } = useSelector(
    (state) => state.viewEmail,
  );
  const { loading: unrepliedLoading } = useSelector((state) => state.unreplied);
  if (ladger?.length == 0 && !ladgerLoading) {
    return <NoSearchFoundPage />;
  }


  return (
    <>
      <MessageModal
        showMessageModal={showMessageModal}
        closeMessageModal={() => setShowMessageModal(false)}
        messageId={selectedMessage}
        email={contactInfo?.email1}
        threadId={threadId}
        viewEmail={viewEmail}
        count={count}
      />

      <div className="bg-white rounded-2xl shadow-sm min-h-[400px]">
        {(unrepliedLoading || contactLoading || loading || ladgerLoading) ? <LoadingSkeleton /> : <>
          <div className="flex flex-col  border-b border-gray-200">
            <ContactHeader />

            <div className="mt-2 p-2 grid grid-cols-1 md:grid-cols-2 gap-4 ">
              <MailerSummaryHeader />
              <LatestMessage handleMessageClick={handleMessageClick} />
            </div>
            <ActionButton isMark={isMark} />
          </div>
          <TimelineEvent handleMessageClick={handleMessageClick} />

        </>}

      </div>

      {showAvatar && <Avatar setShowAvatar={setShowAvatar} onPlay={true} />}
    </>
  );
}

export default TimelinePage;
