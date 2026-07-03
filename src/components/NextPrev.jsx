import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { PageContext } from "../context/pageContext"
import { useDispatch, useSelector } from 'react-redux'
import { ladgerAction } from '../store/Slices/ladger'
import { ThreadContext } from '../context/ThreadContext'
import { useInfiniteEmails } from '../queries/email.queries'
import { useTablePreference } from '../hooks/useTablePreference'
const NextPrev = ({ nextHandler, prevHandler }) => {
    const { currentIndex, setCurrentIndex, setEnteredEmail } = useContext(PageContext)
    const preferences = useTablePreference("emails");
    const { handleSetCurrent } = useContext(ThreadContext)
    const { data } = useInfiniteEmails(preferences);
    const emails =
        data?.pages?.flatMap(
            (page) => page.records || page.data || []
        ) ?? [];
    const dispatch = useDispatch()
    const handleNext = () => {
        if (currentIndex < emails?.length - 1) {
            const email = emails[currentIndex + 1].email1;
            const threadId = emails[currentIndex + 1].thread_id;
            localStorage.setItem("searchTerm", email);
            setEnteredEmail(email);
            dispatch(ladgerAction.setTimeline(null));
            setCurrentIndex((p) => p + 1);
            nextHandler?.(email, threadId)
        }
    };
    const handlePrev = () => {
        if (currentIndex > 0) {
            const email = emails[currentIndex - 1].email1;
            const threadId = emails[currentIndex - 1].thread_id;
            localStorage.setItem("searchTerm", email);
            setEnteredEmail(email);
            dispatch(ladgerAction.setTimeline(null));
            setCurrentIndex((p) => p - 1);
            prevHandler?.(email, threadId)
        }
    };
    return (

        <div className="flex items-center gap-3">
            <NextPrevButton first={true} onClick={handlePrev} disabled={currentIndex == 0} label={emails[currentIndex - 1]?.full_name ? emails[currentIndex - 1]?.full_name : emails[currentIndex - 1]?.email1} Icon={ChevronLeft} emails={emails} currentIndex={currentIndex} />
            <NextPrevButton onClick={handleNext} disabled={currentIndex === emails?.length - 1} label={emails[currentIndex + 1]?.full_name ? emails[currentIndex + 1]?.full_name : emails[currentIndex + 1]?.email1} Icon={ChevronRight} emails={emails} currentIndex={currentIndex} />
        </div>
    )
}

export default NextPrev


function NextPrevButton({ onClick, disabled, label, Icon, ...props }) {

    return <button
        onClick={onClick}
        disabled={disabled}
        className={`p-2 rounded-lg border bg-cyan-200 flex items-center gap-2 shadow-sm active:scale-95 transition
                        ${disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer"
            }
                    `}

    >
        {props.first && <Icon className="w-5 h-5 text-gray-700" />}
        <p className=' relative text-sm font-bold
         text-cyan-900 truncate max-w-[150px]
      '>              {label}
        </p>
        {!props.first && <Icon className="w-5 h-5 text-gray-700" />}

    </button>
}