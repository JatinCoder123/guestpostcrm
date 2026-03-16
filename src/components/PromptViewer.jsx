const colors = [
    "bg-blue-50 border-blue-200",
    "bg-green-50 border-green-200",
    "bg-yellow-50 border-yellow-200",
    "bg-purple-50 border-purple-200",
    "bg-pink-50 border-pink-200",
    "bg-indigo-50 border-indigo-200",
];

export const PromptViewer = ({ prompt }) => {

    if (!prompt) return null;

    const sections = prompt.split("----------------------------------------------------------------------");

    return (
        <div className="space-y-4">

            {sections.map((section, index) => {

                const color = colors[index % colors.length];

                return (
                    <div
                        key={index}
                        className={`border rounded-lg p-4 ${color}`}
                    >
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                            {section.trim()}
                        </pre>
                    </div>
                );
            })}

        </div>
    );
};