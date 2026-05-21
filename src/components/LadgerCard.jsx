import { useState } from "react";
import {
    MailCheck,
    MessageSquare,
    FileText,
    SparkleIcon,
    Workflow,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Visualization from "./Visualization";
import PromptLadger from "./PromptLadger";
const LadgerCard = ({ timelineData, handleMessageClick }) => {
    const [activeParent, setActiveParent] = useState(null);
    const [hoveredChild, setHoveredChild] = useState(null);
    const navigateTo = useNavigate()
    const [activeVisualizationId, setActiveVisualizationId] = useState(null);
    const [activePromptId, setActivePromptId] = useState(null);

    const toggleParent = (id) => {
        setActiveParent((prev) => (prev === id ? null : id));
    };
    return (
        <div className="max-w-4xl mx-auto mt-4 space-y-6 relative">

            {timelineData.map((parent, index) => {

                const ParentIcon = MailCheck;
                const isOpen = activeParent === parent.id;
                const user = parent?.children?.length > 0 && parent?.children[0]?.user_details.length > 0 ? parent?.children[0]?.user_details[0].name : "GPC"

                return (
                    <div key={parent.id} className="flex gap-5  ">

                        {/* LEFT SIDE */}
                        <div className="relative flex flex-col items-center mt-4">

                            {/* ICON */}
                            <div className="w-12 h-12 rounded-full bg-indigo-100 border border-indigo-200 shadow-sm flex items-center justify-center z-20">
                                <ParentIcon className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div className="border-l-2 border-dashed border-gray-300 flex-1  mt-1"></div>


                        </div>

                        {/* RIGHT */}
                        <div className="flex-1 relative">
                            <div className="absolute -left-[38px] top-[36px] w-10 h-1   bg-gradient-to-r from-blue-500 to-purple-600"></div>
                            {/* PARENT CARD */}
                            <div
                                onClick={() => toggleParent(parent.id)}
                                className="group bg-white border border-gray-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer"
                            >

                                <div className="flex justify-between items-start">

                                    <div>
                                        <h2 className="text-[18px] font-semibold text-gray-800">
                                            {parent.description}
                                        </h2>
                                    </div>

                                    <div className="text-right">
                                        <p className="text-xs text-gray-500 truncate max-w-[100px]">
                                            {parent.date_entered}
                                        </p>

                                        <p className="text-sm text-gray-700 mt-1 truncate max-w-[100px]">
                                            <i> - by</i> {user}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CHILDREN */}
                            {isOpen && (
                                <div className="mt-5 ml-2 space-y-4 relative">

                                    {parent?.children?.map((child) => {

                                        const Icon = child.icon;
                                        const isHovered =
                                            hoveredChild === child.id;

                                        return (
                                            <div
                                                key={child.id}
                                                className="relative group"
                                                onMouseEnter={() => setHoveredChild(child.id)}
                                                onMouseLeave={() => setHoveredChild(null)}
                                            >
                                                <Visualization activeVisualizationId={activeVisualizationId} setActiveVisualizationId={setActiveVisualizationId} />
                                                <PromptLadger activePromptId={activePromptId} setActivePromptId={setActivePromptId} />
                                                <div
                                                    className="absolute right-4 top-10 flex gap-3  
             opacity-0 translate-y-1 pointer-events-none
             group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto
             transition-all duration-200 z-20"
                                                >

                                                    {child?.message_id_c && (
                                                        <button
                                                            onClick={() =>
                                                                handleMessageClick(child.message_id_c)
                                                            }
                                                            className="text-purple-600 hover:scale-110"
                                                        >
                                                            <MessageSquare size={18} />
                                                        </button>
                                                    )}

                                                    {child?.template_id && (
                                                        <button
                                                            onClick={() =>
                                                                navigateTo("/settings/templates", {
                                                                    state: { templateId: child.template_id },
                                                                })
                                                            }
                                                            className="text-green-600 hover:scale-110"
                                                        >
                                                            <FileText size={18} />
                                                        </button>
                                                    )}

                                                    {child?.prompt_ledger_id && (
                                                        <button
                                                            onClick={() =>
                                                                setActivePromptId(child.prompt_ledger_id)
                                                            }
                                                            className="text-yellow-600 hover:scale-110"
                                                        >
                                                            <SparkleIcon size={18} />
                                                        </button>
                                                    )}
                                                    {/* Visualization */}
                                                    {child?.stage_ledger_id && (
                                                        <button
                                                            onClick={() => {
                                                                setActiveVisualizationId(child?.stage_ledger_id);
                                                            }}
                                                            className="text-blue-600 hover:scale-110"
                                                        >
                                                            <Workflow size={18} />
                                                        </button>
                                                    )}
                                                </div>
                                                {/* CONNECTOR */}
                                                <div className="absolute -left-[40px] top-6 w-8 border-t-2 border-dashed border-gray-300"></div>

                                                {/* DOT */}
                                                <div className={`absolute -left-[56px] top-[18px] w-3 h-3 rounded-full border-2 border-green-400 ${isHovered ? 'bg-green-300' : 'bg-white'} z-20`}></div>

                                                {/* CARD */}
                                                <div
                                                    className={`
                              bg-white border rounded-xl overflow-hidden
                              transition-all duration-300
                              ${isHovered
                                                            ? `border-green-200 shadow-lg scale-[1.01]`
                                                            : "border-gray-200 shadow-sm"}
                            `}
                                                >

                                                    <div className="px-5 py-4 flex items-center justify-between">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className={`w-9 h-9 rounded-lg flex items-center justify-center bg-green-50`}
                                                            >
                                                                <img src={Icon} />
                                                            </div>

                                                            <h3 className="font-medium text-gray-800">
                                                                {child?.type_c}
                                                            </h3>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LadgerCard;