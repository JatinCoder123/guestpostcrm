import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext, useEffect } from 'react'
import { PageContext } from "../context/pageContext"
import { useDispatch, useSelector } from 'react-redux'
import { ladgerAction } from '../store/Slices/ladger'
import { useInfiniteEmails } from '../queries/email.queries'
import { useTablePreference } from '../hooks/useTablePreference'
import he from "he";

const NextPrev = ({ nextHandler, prevHandler }) => {
    const { currentIndex, setCurrentIndex, setEnteredEmail } = useContext(PageContext)
    const preferences = useTablePreference("inbox");
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

        <div className="flex shrink-0 items-center gap-2 2xl:gap-3">
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
        className={`flex min-w-0 shrink-0 items-center gap-1 rounded-lg border bg-gradient-to-r from-search-primary to-search-secondary px-2.5 py-2 shadow-sm transition active:scale-95 2xl:gap-2
                        ${disabled
                ? "opacity-60 cursor-not-allowed"
                : "hover:bg-gray-100 cursor-pointer"
            }
                    `}

    >
        {props.first && <Icon className="w-5 h-5 shrink-0 text-white" />}
        {label ? (
            <p className='relative block max-w-[80px] truncate text-xs font-semibold text-white sm:max-w-[90px] sm:text-sm md:max-w-[130px] 2xl:max-w-[110px]'>
                {he.decode(label)}
            </p>
        ) : null}
        {!props.first && <Icon className="w-5 h-5 shrink-0 text-white" />}

    </button>
}
