import { useNavigate, useOutletContext } from 'react-router-dom';
import TemplateSelectorModal from '../../TemplateSelectorModal';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useModule from '../../../hooks/useModule';
import { base64ToUtf8, getDomain } from '../../../assets/assets';
import { useEffect, useState } from 'react';
import { useThreadContext } from '../../../hooks/useThreadContext';
import { Brain, Edit, LayoutTemplateIcon, Sparkle, Sparkles, Trash2, Zap } from 'lucide-react';
import { ViewButton } from '../../ViewButton';
import Attachment from '../../Attachment';
import MicInput from "../../MicInput"
import { LoadingChase } from '../../Loading';
import { CREATE_DEAL_API_KEY } from '../../../store/constants';
import { aiReplyAction, getAiReply } from '../../../store/Slices/aiReply';

const ReplyButtons = ({
    editorRef,
    editorReady
}) => {
    const { setEditorContent, setFiles, files, editorContent, setContentLoading } = useOutletContext()
    const { context: { currentEmail, currentThread: threadId } } = useThreadContext()
    const [showTemplatePopup, setShowTemplatePopup] = useState(false);
    const [aiReplyContent, setAiReplyContent] = useState("");
    const [openParent, setOpenParent] = useState(null);
    const [favourites, setFavourites] = useState([]);
    const [templateId, setTemplateId] = useState(null);
    const navigate = useNavigate()

    const {
        loading: aiLoading,
        aiReply: aiResponse,
        error: aiError,
        message,
    } = useSelector((state) => state.aiReply);
    const {
        crmEndpoint
    } = useSelector((state) => state.user);
    const dispatch = useDispatch()
    // FETCH BUTTONS
    const { loading, data: buttons } = useModule({
        url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_buttons&type=regular&email=${currentEmail}`,
        name: "BUTTONS",
        dependencies: [currentEmail, favourites],
    });
    const insertTextAtCursor = () => {
        if (editorRef.current) {
            editorRef.current.focus(); // ensure cursor is active
            editorRef.current.insertContent(
                priceTemp[0]?.body_html ?? "No Content Available",
            );
        }
    };// SELECTED TEMPLATE
    function insertAiReply(input) {
        setOpenParent(null);
        setTemplateId(null);
        setEditorContent(input);
    }
    const {
        loading: templateLoading,
        data: template,
        refetch,
    } = useModule({
        url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
        method: "POST",
        body: {
            module: "EmailTemplates",
            where: { id: templateId },
        },
        headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
        },
        name: `TEMPLATE WITH ID ${templateId}`,
        dependencies: [templateId],
        enabled: templateId,
    });
    // DEFAULT TEMPLATE
    const { loading: defTemplateLoading, data: defaultTemplate } = useModule({
        url: `${getDomain(crmEndpoint)}/index.php?entryPoint=updateOffer&email=${currentEmail}`,
        name: "DEFAULT TEMPLATE",
        dependencies: [currentEmail],
    });
    const { loading: priceTempLoading, data: priceTemp } = useModule({
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        method: "POST",
        body: {
            module: "EmailTemplates",
            where: {
                name: "PRICE_LIST",
            },
        },
        headers: {
            "x-api-key": `${CREATE_DEAL_API_KEY}`,
            "Content-Type": "application/json",
        },
        name: "Price Template",
        dependencies: [currentEmail],
    });
    // LOAD TEMPLATE INTO EDITOR
    useEffect(() => {
        if (template && editorReady && editorRef.current) {
            const htmlContent =
                template?.[0]?.body_html || base64ToUtf8(defaultTemplate.html_base64);
            if (htmlContent) {
                setEditorContent(htmlContent);
            } else {
                toast.warn("Template is empty—starting with blank editor.");
            }
        }
    }, [template, editorReady]);
    useEffect(() => {
        if (message && aiResponse) {
            insertAiReply(aiResponse);
            dispatch(aiReplyAction.clearMessge());
        }
        if (aiError) {
            toast.error(aiError);
            dispatch(aiReplyAction.clearAllErrors());
        }
    }, [message, aiResponse, dispatch]);
    useEffect(() => {
        if (aiLoading) {
            setContentLoading(true)
        }
    }, [aiLoading])
    return (
        <div className="flex items-center gap-3 flex-wrap">
            <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                    setEditorContent("");
                }}
                className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mb-7"
            >
                <Trash2 className="w-4 h-4" />
            </motion.button>
            <ViewButton Icon={Sparkles}>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    onClick={() => {
                        if (aiReplyContent == "") {
                            dispatch(getAiReply(threadId));
                        }
                        insertAiReply(aiReplyContent);
                    }}
                >
                    <Brain className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                        AI Reply
                    </span>
                </motion.button>
            </ViewButton>
            <ViewButton Icon={Sparkles}>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    onClick={() => {
                        dispatch(getAiReply(threadId, 1, editorContent));

                        insertAiReply(editorContent);
                    }}
                >
                    <Zap className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                        AI Now
                    </span>
                </motion.button>
            </ViewButton>

            <TemplateSelectorModal
                isOpen={showTemplatePopup}
                onClose={() => setShowTemplatePopup(false)}
                onSelect={(tpl) => {
                    setEditorContent(tpl.body_html || "");
                    setTemplateId(tpl.id);
                    toast.success(`✅ "${tpl.name}" loaded into editor`);
                }}
                crmEndpoint={crmEndpoint}
                favourites={favourites}
                setFavourites={setFavourites}
            />
            {/* PARENT + CHILD BUTTONS */}
            {loading ? (
                <LoadingChase className="p-4" />
            ) : (
                buttons?.map((btnGroup, i) => {
                    const parent = btnGroup.parent_btn;
                    const children = btnGroup.child_btn;
                    const isOpen = openParent === parent.id;

                    return (
                        <div key={i} className="relative">
                            <ViewButton
                                Icon={Edit}
                                onClick={() =>
                                    navigate("/settings/templates", {
                                        state: { templateId: parent.email_template_id },
                                    })
                                }
                            >
                                <motion.button
                                    whileHover={{ scale: 1.05, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                    onClick={() => {
                                        setTemplateId(parent.email_template_id);
                                        setOpenParent(isOpen ? null : parent.id);
                                    }}
                                >
                                    {parent.button_label}
                                </motion.button>
                            </ViewButton>

                            <AnimatePresence>
                                {isOpen && children && (
                                    <motion.div
                                        initial={{ x: -20, opacity: 0, scale: 0.95 }}
                                        animate={{ x: 0, opacity: 1, scale: 1 }}
                                        exit={{ x: -20, opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2, type: "spring" }}
                                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex gap-2 bg-white p-3 rounded-2xl shadow-2xl border border-gray-200"
                                    >
                                        {children?.map((child, j) => (
                                            <ViewButton
                                                key={j}
                                                Icon={Edit}
                                                onClick={() =>
                                                    navigate("/settings/templates", {
                                                        state: {
                                                            templateId: child.email_template_id,
                                                        },
                                                    })
                                                }
                                            >
                                                <motion.button
                                                    whileHover={{ scale: 1.03, y: -1 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => {
                                                        setTemplateId(child.email_template_id);
                                                        setOpenParent(null);
                                                    }}
                                                    className="bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-3 rounded-xl border border-gray-200 text-sm font-medium shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
                                                >
                                                    {child.button_label}
                                                </motion.button>
                                            </ViewButton>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })
            )}
            <ViewButton
                Icon={Edit}
                onClick={() =>
                    navigate("/settings/templates", {
                        state: { templateId: priceTemp[0].id },
                    })
                }
            >
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                    onClick={insertTextAtCursor}
                >
                    Price
                </motion.button>
            </ViewButton>
            <ViewButton Icon={Edit} onClick={() =>
                navigate("/settings/templates", {
                    state: { templateId: templateId },
                })
            }>
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                    onClick={() => {
                        setTemplateId(null);
                        if (defaultTemplate && editorRef.current) {
                            const html = base64ToUtf8(defaultTemplate.html_base64);
                            setEditorContent(html);
                            setOpenParent(null);
                        }
                        setShowTemplatePopup(true);
                        refetch();
                    }}
                >
                    <LayoutTemplateIcon className="w-4 h-4" />
                    <span className="text-sm font-medium hidden sm:inline">
                        All
                    </span>
                </motion.button>
            </ViewButton>
            <Attachment data={files} onChange={setFiles} />
            <MicInput editorRef={editorRef} />
        </div>
    )
}

export default ReplyButtons