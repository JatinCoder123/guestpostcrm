import { LoadingAll, LoadingChase } from "./Loading";
import { useSelector } from "react-redux";
import { Mail, ChevronLeft, ChevronRight, Handshake } from "lucide-react";
import { Link } from "react-router-dom";
import SocialButtons from "./SocialButtons";
import { useEffect, useState, useRef } from "react";
import confetti from "canvas-confetti";
// start
import { useNavigate } from "react-router-dom";

const ContactHeader = ({ onPrev, onNext, currentIndex, setShowEmails }) => {
  const navigate = useNavigate();
  const goToDeal = () => {
    navigate("/deals");
  };
  const { email } = useSelector((state) => state.ladger);
  const { contactInfo, contactLoading, stage, status, customer_type, count } =
    useSelector((state) => state.viewEmail);

  const { deals } = useSelector((state) => state.deals);

  const CountUpWithBlast = ({ value, email }) => {
    const storageKey = `maxDealAnimated_${email}`;
    const hasAnimatedBefore = sessionStorage.getItem(storageKey);

    const [count, setCount] = useState(hasAnimatedBefore ? value : 0);

    const hasBlasted = useRef(false);
    const amountRef = useRef(null);

    useEffect(() => {
      if (hasAnimatedBefore) return;

      const duration = 900;
      const startTime = performance.now();

      const animate = (now) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const current = Math.floor(progress * value);
        setCount(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else if (!hasBlasted.current && amountRef.current) {
          hasBlasted.current = true;

          // ✅ mark animation as done
          sessionStorage.setItem(storageKey, "true");

          // 🎯 confetti only on amount
          const rect = amountRef.current.getBoundingClientRect();
          const x = (rect.left + rect.width / 2) / window.innerWidth;
          const y = (rect.top + rect.height / 2) / window.innerHeight;

          confetti({
            particleCount: 28,
            spread: 40,
            startVelocity: 16,
            gravity: 0.9,
            origin: { x, y },
            colors: ["#0f172a", "#2563eb"],
          });
        }
      };

      requestAnimationFrame(animate);
    }, [value, email, hasAnimatedBefore]);

    return <span ref={amountRef}>{count.toLocaleString()}</span>;
  };

  const emailDeals = deals?.filter((d) => {
    const dealEmail = (
      d.email ||
      d.contact_email ||
      d.email1 ||
      ""
    ).toLowerCase();

    return email && dealEmail === email;
  });

  const maxDeal =
    emailDeals?.length > 0
      ? Math.max(
          ...emailDeals.map((d) =>
            Number(
              String(d.dealamount || d.amount || "0").replace(/[^0-9.]/g, ""),
            ),
          ),
        )
      : 0;
  // end

  const { emails } = useSelector((state) => state.unreplied);

  return (
    <div className="flex items-start justify-between w-full">
      {/* LEFT SIDE CONTENT */}
      <div
        className={`flex  gap-4 ${
          contactLoading ? "items-center" : "item-start"
        }`}
      >
        {contactLoading && <LoadingChase size="30" color="blue" />}
        {!contactLoading && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 ">
              <button onClick={() => setShowEmails(true)} className="w-10 h-10 bg-white bg-white rounded-xl shadow-md border border-gray-200 relative
            hover:shadow-lg active:scale-95 hover:-translate-y-1 transition-all  flex items-center justify-center cursor-pointer">
                <img
                  width="40"
                  height="40"
                  src="https://img.icons8.com/keek/100/new-post.png"
                  alt="new-post"
                />
                {count > 0 && <span className="absolute -top-2 -right-1 bg-red-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
                  {count}
                </span>}

              </button>

              <Link
                to="/contacts"
                className="text-gray-800 text-lg font-semibold"
              >
                {contactInfo?.full_name === "" || contactInfo?.full_name == null
                  ? email
                  : contactInfo?.full_name}
              </Link>
              {contactInfo?.customer_type === "verified" && (
                <img
                  width="50"
                  height="50"
                  src="https://img.icons8.com/bubbles/100/verified-account.png"
                  alt="verified"
                />
              )}
            </div>
            <div className="ml-4 flex items-center gap-4">
              {/* TYPE */}
              <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-md">
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Type</div>
                  <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                  <div className="text-gray-800 font-medium">
                    {contactInfo?.type ?? "N/A"}
                  </div>
                </div>
              </div>
              {/* STAGE */}
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Stage</div>
                  <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                  <div className="text-gray-800 font-medium">
                    {stage ?? "N/A"}
                  </div>
                </div>
              </div>
              {/* STATUS */}
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Status</div>
                  <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                  <div className="text-gray-800 font-medium">
                    {status ?? "N/A"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                <div className="text-sm">
                  <div className="text-gray-500 text-xs">Customer Type</div>
                  <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                  <div className="text-gray-800 font-medium">
                    {customer_type ?? "N/A"}
                  </div>
                </div>
              </div>
              {contactInfo?.moved_label && (
                <div className="flex items-center gap-2 bg-purple-50 border border-purple-100 px-3 py-2 rounded-md">
                  <div className="text-sm">
                    <div className="text-gray-500 text-xs">Email Label</div>
                    <div className="h-[2px] my-2 -mx-2 rounded-full bg-gradient-to-r from-blue-400 via-sky-400 to-blue-600"></div>
                    <div className="text-gray-800 font-medium">
                      {contactInfo?.moved_label ?? "N/A"}
                    </div>
                  </div>
                </div>
              )}

              <div className="w-px h-10 bg-gray-200"></div>
            </div>
          </div>
        )}
        <SocialButtons />
      </div>

      {/* 🔘 PREV + NEXT BUTTONS */}
      <div className="flex items-center gap-3">
        {/* start by kjl */}
        {emailDeals?.length > 0 && (
          <div className="flex items-center">
            <div
              onClick={goToDeal}
              className="
        flex items-center gap-4
        p-2
        rounded-xl
        bg-white
        border border-slate-200
        shadow-sm
        cursor-pointer
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
      "
            >
              <div className="flex items-center justify-center w-11 h-11 rounded-lg bg-slate-900">
                <Handshake size={22} className="text-white" />
              </div>

              <span className="text-2xl font-semibold text-slate-900">
                $<CountUpWithBlast value={maxDeal} />
              </span>
            </div>
          </div>
        )}
        {/* end by kjl */}

        {/* PREV BUTTON (Disable if index is 0) */}
        <button
          onClick={onPrev}
          disabled={currentIndex === 0}
          className={`p-2 rounded-lg border bg-white shadow-sm active:scale-95 transition
                        ${
                          currentIndex === 0
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }
                    `}
        >
          <ChevronLeft className="w-5 h-5 text-gray-700" />
        </button>

        {/* NEXT BUTTON (Disable if last email) */}
        <button
          onClick={onNext}
          disabled={currentIndex === emails?.length - 1}
          className={`p-2 rounded-lg border bg-white shadow-sm active:scale-95 transition
                        ${
                          currentIndex === emails?.length - 1
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-gray-100"
                        }
                    `}
        >
          <ChevronRight className="w-5 h-5 text-gray-700" />
        </button>
      </div>
    </div>
  );
};

export default ContactHeader;
