import { memo, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";

function Pagination({ slice }) {
  const dispatch = useDispatch();

  const { pageIndex = 0, pageCount = 1 } = useSelector(
    (state) => state[slice] || {}
  );

  // Memoized states
  const { canPrev, canNext } = useMemo(() => {
    return {
      canPrev: pageIndex > 0,
      canNext: pageIndex < pageCount - 1,
    };
  }, [pageIndex, pageCount]);

  // Actions
  const goPrev = () => canPrev && dispatch({ type: `${slice}/prevPage` });
  const goNext = () => canNext && dispatch({ type: `${slice}/nextPage` });

  return (
    <div className="flex items-center justify-between mt-6 p-5">
      {/* Left Text */}
      <span className="text-sm font-medium text-gray-700 tracking-wide">
        Page{" "}
        <span className="font-semibold text-gray-900">{pageIndex + 1}</span> of{" "}
        <span className="font-semibold text-gray-900">{pageCount}</span>
      </span>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        {/* Previous */}
        <button
          onClick={goPrev}
          disabled={!canPrev}
          className="
            px-4 py-2 rounded-full border border-gray-300 bg-white
            text-gray-700 font-medium shadow-sm
            transition-all duration-200
            hover:shadow-md hover:bg-gray-50 hover:-translate-y-0.5
            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:hover:translate-y-0
          "
        >
          Previous
        </button>

        {/* Next */}
        <button
          onClick={goNext}
          disabled={!canNext}
          className="
            px-4 py-2 rounded-full border border-gray-300 bg-white
            text-blue-600 font-semibold shadow-sm
            transition-all duration-200
            hover:shadow-md hover:bg-blue-50 hover:-translate-y-0.5
            disabled:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed 
            disabled:hover:shadow-none disabled:hover:bg-white disabled:hover:translate-y-0
          "
        >
          Next
        </button>
      </div>
    </div>
  );
}

export default memo(Pagination);
