import { useState } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { AnimatePresence, motion as Motion } from "framer-motion";
import { GraduationCap, X } from "lucide-react";
import { useGpcTrainingStatus } from "../queries/training.queries";
import IconButton from "./ui/Buttons/IconButton";

const getLearningUrl = (email) =>
  `https://training.guestpostcrm.com/?email=${encodeURIComponent(email)}`;

export default function GpcLearningButton() {
  const user = useSelector((state) => state.user.user);
  const { data: learningStatus, refetch } = useGpcTrainingStatus(user?.email);
  const [isOpen, setIsOpen] = useState(false);

  const hasLearningRemaining =
    Number.isFinite(learningStatus?.completedCount) &&
    Number.isFinite(learningStatus?.totalCount) &&
    learningStatus.totalCount > 0 &&
    learningStatus.completedCount < learningStatus.totalCount;

  if (!hasLearningRemaining) return null;

  const handleClose = () => {
    setIsOpen(false);
    refetch();
  };

  return (
    <>
      <IconButton
        icon={GraduationCap}
        iconColor="indigo"
        label="Learning"
        onClick={() => setIsOpen(true)}
      />

      {createPortal(
        <AnimatePresence>
          {isOpen && user?.email && (
            <Motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100000] flex bg-slate-950/65 p-3 sm:p-6"
              role="dialog"
              aria-modal="true"
              aria-labelledby="learning-title"
            >
              <Motion.section
                initial={{ opacity: 0, scale: 0.98, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98, y: 12 }}
                transition={{ duration: 0.18, ease: [0.32, 0.72, 0, 1] }}
                className="flex min-h-0 w-full flex-1 flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              >
              <header className="flex shrink-0 items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-2 text-slate-800">
                  <GraduationCap size={20} className="shrink-0 text-indigo-600" />
                  <h2 id="learning-title" className="truncate text-base font-bold">
                    Learning
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  aria-label="Close learning"
                >
                  <X size={20} />
                </button>
              </header>
              <iframe
                title="Learning"
                src={getLearningUrl(user.email)}
                className="min-h-0 w-full flex-1 border-0 bg-white"
              />
              </Motion.section>
            </Motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
}
