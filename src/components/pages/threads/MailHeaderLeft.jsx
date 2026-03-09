import { Plus, ChevronDown, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export default function MailHeaderLeft({
  sender,
  to = [],
  setTo,
  cc = [],
  setCc,
}) {
  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white rounded-t-lg">
      <span className="text-sm opacity-90">Sender:</span>
      <div className="bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium">
        {sender}
      </div>
      <RecipientRow label="To:" values={to} setValues={setTo} name="to" />
      <RecipientRow label="CC:" values={cc} setValues={setCc} name="cc" />
    </div>
  );
}
function RecipientRow({ label, values, setValues, name }) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const addRecipient = () => {
    const email = input.trim();
    if (!email) return;

    setValues((prev) => [...prev, email]);
    setInput("");
  };

  const removeRecipient = (index) => {
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const count = values.length;

  return (
    <div ref={ref} className="relative min-w-[280px]">
      {/* Input row */}
      <div className="flex items-center gap-2">
        <span className="text-sm opacity-90 whitespace-nowrap">{label}</span>

        <div className="flex items-center gap-1 bg-white rounded-md px-2 py-1 w-full">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addRecipient();
              }
            }}
            placeholder="Add email"
            name={`${name}-input`}
            autoComplete="new-password"
            className="flex-1 outline-none text-sm text-gray-700"
          />

          {/* Add */}
          <button
            onClick={addRecipient}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-blue-600 text-white"
          >
            <Plus size={12} strokeWidth={2.5} />
          </button>

          {/* Dropdown toggle + COUNT BADGE */}
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="relative w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-gray-700"
          >
            <ChevronDown size={16} />

            {count > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-blue-600 text-white text-[12px] flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* DROPDOWN */}
      {open && (
        <div className="absolute left-[2.4rem] top-full mt-1 w-[calc(100%-2.4rem)] bg-white rounded-md shadow-lg z-50 max-h-48 overflow-auto">
          {values.length === 0 ? (
            <div className="px-3 py-2 text-sm text-gray-400">No recipients</div>
          ) : (
            values.map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <span className="truncate">{item}</span>
                <button
                  onClick={() => removeRecipient(idx)}
                  className="p-1 rounded hover:bg-gray-200 text-gray-500 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
