import { ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ladgerAction } from "../store/Slices/ladger";

function Pagination({ slice, fn }) {
  const dispatch = useDispatch();

  let { pageCount, pageIndex = 1 } = useSelector((state) => state[slice]);
  let { timeline } = useSelector((state) => state.ladger);

  const handlePrev = useCallback(() => {
    if (pageIndex > 0) {
      dispatch(fn(timeline, pageIndex - 1));
    }
  }, [pageIndex, dispatch, slice]);

  const handleNext = useCallback(() => {
    if (pageIndex < pageCount - 1) {
      dispatch(fn(timeline, pageIndex + 1));
    }
  }, [pageIndex, dispatch, slice]);

  const goToPage = useCallback(
    (p) => {
      dispatch(fn(timeline, p));
    },
    [dispatch, slice]
  );

  // --- Build pagination numbers ---
  const pagesToShow = [];

  // Always show first 3 pages
  for (let i = 1; i <= Math.min(3, pageCount); i++) {
    pagesToShow.push(i);
  }

  // Add ellipsis if needed
  if (pageCount > 4) {
    pagesToShow.push("ellipsis");
    pagesToShow.push(pageCount - 1); // last page
  } else if (pageCount === 4) {
    pagesToShow.push(3); // show last page directly
  }

  return (
    <div className="flex items-center justify-center gap-6 py-8">
      {/* Left Arrow */}
      <button
        onClick={handlePrev}
        disabled={pageIndex === 0}
        className={`text-cyan-500 hover:text-cyan-700 transition text-3xl 
          ${pageIndex === 0 ? "opacity-0 " : "cursor-pointer"}
        `}
      >
        <ChevronLeft />
      </button>

      {/* Page Numbers */}
      <div className="flex items-center gap-4">
        {pagesToShow.map((p, idx) =>
          p === "ellipsis" ? (
            <span key={idx} className="text-2xl text-gray-500 px-2">
              …
            </span>
          ) : (
            <button
              key={p * Math.random()}
              onClick={() => goToPage(p)}
              className={`w-12 h-12  flex items-center justify-center cursor-pointer rounded-full text-lg font-semibold transition
                ${
                  p == pageIndex
                    ? "bg-cyan-600 text-white scale-110 shadow-md"
                    : "bg-cyan-100 text-cyan-700 hover:bg-cyan-200"
                }
              `}
            >
              {p}
            </button>
          )
        )}
      </div>

      {/* Right Arrow */}
      <button
        onClick={handleNext}
        disabled={pageIndex === pageCount - 1}
        className={`text-cyan-500 hover:text-cyan-700 transition text-3xl 
          ${pageIndex === pageCount - 1 ? "opacity-0 " : "cursor-pointer"}
        `}
      >
        <ChevronRight />
      </button>
    </div>
  );
}

export default memo(Pagination);
