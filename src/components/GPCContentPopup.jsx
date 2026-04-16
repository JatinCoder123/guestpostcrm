import { useState } from "react";

export default function GPCContentPopup({ data, onClose }) {
  const sections = data?.data?.humanizer_response?.sections || [];

  const [selected, setSelected] = useState({});

  const handleSelect = (key, value) => {
    setSelected((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const renderTag = (tag, text) => {
    if (tag === "h1") return <h1 className="text-xl font-bold">{text}</h1>;
    if (tag === "h2") return <h2 className="text-lg font-semibold">{text}</h2>;
    if (tag === "li") return <li className="ml-4 list-disc">{text}</li>;
    return <p className="text-sm">{text}</p>;
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
      <div className="w-[95%] h-[90%] bg-white rounded-2xl shadow-xl flex flex-col p-4">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-lg font-bold">
            Content Selector (AI: {data?.data?.ai_score}%)
          </h2>
          <button onClick={onClose} className="text-red-500 text-xl">
            ✕
          </button>
        </div>

        {/* 3 COLUMN LAYOUT */}
        <div className="grid grid-cols-3 gap-4 flex-1 overflow-hidden">
          {/* 🔵 ORIGINAL */}
          <div className="overflow-y-auto border rounded-lg p-3">
            <h3 className="font-semibold text-blue-600 mb-2">Original</h3>

            {sections.map((sec, sIndex) => (
              <div key={sIndex} className="mb-4">
                {renderTag(sec.tag_name, sec.Original_heading)}

                {sec.items.map((item, iIndex) => {
                  const key = `${sIndex}-${iIndex}`;

                  return (
                    <div key={key} className="mt-2 border p-2 rounded">
                      {renderTag(item.tag_name, item.original_text)}

                      <button
                        onClick={() => handleSelect(key, item.original_text)}
                        className="mt-1 text-xs bg-blue-500 text-white px-2 py-1 rounded"
                      >
                        Use Original
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* 🟢 FINAL OUTPUT */}
          <div className="overflow-y-auto border rounded-lg p-3 bg-gray-50">
            <h3 className="font-semibold text-green-600 mb-2">Final Output</h3>

            {sections.map((sec, sIndex) => (
              <div key={sIndex} className="mb-4">
                {renderTag(
                  sec.tag_name,
                  selected[`heading-${sIndex}`] || sec.Original_heading,
                )}

                {sec.items.map((item, iIndex) => {
                  const key = `${sIndex}-${iIndex}`;
                  const value = selected[key] || item.original_text;

                  return <div key={key}>{renderTag(item.tag_name, value)}</div>;
                })}
              </div>
            ))}
          </div>

          {/* 🟣 HUMANIZED */}
          <div className="overflow-y-auto border rounded-lg p-3">
            <h3 className="font-semibold text-purple-600 mb-2">Humanized</h3>

            {sections.map((sec, sIndex) => (
              <div key={sIndex} className="mb-4">
                {renderTag(sec.tag_name, sec.humanized_heading)}

                <button
                  onClick={() =>
                    handleSelect(`heading-${sIndex}`, sec.humanized_heading)
                  }
                  className="mb-2 text-xs bg-purple-500 text-white px-2 py-1 rounded"
                >
                  Use Heading
                </button>

                {sec.items.map((item, iIndex) => {
                  const key = `${sIndex}-${iIndex}`;

                  return (
                    <div key={key} className="mt-2 border p-2 rounded">
                      {renderTag(item.tag_name, item.humanized_text)}

                      <button
                        onClick={() => handleSelect(key, item.humanized_text)}
                        className="mt-1 text-xs bg-purple-500 text-white px-2 py-1 rounded"
                      >
                        Use Humanized
                      </button>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
