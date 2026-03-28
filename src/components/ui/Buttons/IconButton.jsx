import { Loader2 } from "lucide-react";

const IconButton = ({
    icon: Icon,
    label,
    onClick,
    loading = false,
    disabled = false,
    renderLoading,
    className = "",
}) => {
    return (
        <div className="relative group inline-block">
            <button
                onClick={onClick}
                disabled={disabled || loading}
                className={`p-3 rounded-xl transition flex items-center justify-center
          ${disabled || loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
          ${className}`}
            >
                {loading
                    ? renderLoading?.() || (
                        <Loader2 className="animate-spin" size={18} />
                    )
                    : <Icon size={18} />}
            </button>

            {!loading && (
                <span className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 
          whitespace-nowrap rounded bg-black text-white text-xs px-2 py-1 
          opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
                    {label}
                </span>
            )}
        </div>
    );
};
export default IconButton