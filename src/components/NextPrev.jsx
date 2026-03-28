import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useContext } from 'react'
import { PageContext } from "../context/pageContext"
import { useDispatch, useSelector } from 'react-redux'
import { excludeName, extractEmail } from '../assets/assets'
import { ladgerAction } from '../store/Slices/ladger'
const NextPrev = () => {
    const { currentIndex, setCurrentIndex, setEnteredEmail, setWelcomeHeaderContent } = useContext(PageContext)
    const { emails } = useSelector((state) => state.unreplied);
    const dispatch = useDispatch()
    const handleNext = () => {
        if (currentIndex < emails?.length - 1) {
            const input = extractEmail(emails[currentIndex + 1].from);
            localStorage.setItem("email", input);
            setEnteredEmail(input);
            dispatch(ladgerAction.setTimeline(null));
            setWelcomeHeaderContent("Unreplied");
            setCurrentIndex((p) => p + 1);
        }
    };
    const handlePrev = () => {
        if (currentIndex > 0) {
            const input = extractEmail(emails[currentIndex - 1].from);
            localStorage.setItem("email", input);
            setEnteredEmail(input);
            dispatch(ladgerAction.setTimeline(null));
            setWelcomeHeaderContent("Unreplied");
            setCurrentIndex((p) => p - 1);
        }
    };
    return (

        <div className="flex items-center gap-3">
            <NextPrevButton first={true} onClick={handlePrev} disabled={currentIndex == 0} label={excludeName(emails[currentIndex - 1]?.from)?.trim() !== "" ? excludeName(emails[currentIndex - 1]?.from) : emails[currentIndex - 1]?.email1} Icon={ChevronLeft} emails={emails} currentIndex={currentIndex} />
            <NextPrevButton onClick={handleNext} disabled={currentIndex === emails?.length - 1} label={excludeName(emails[currentIndex + 1]?.from)?.trim() !== "" ? excludeName(emails[currentIndex + 1]?.from) : emails[currentIndex + 1]?.email1} Icon={ChevronRight} emails={emails} currentIndex={currentIndex} />
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