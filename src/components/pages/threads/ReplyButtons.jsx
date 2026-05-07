import { useNavigate, useOutletContext } from 'react-router-dom';
import TemplateSelectorModal from '../../TemplateSelectorModal';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import useModule from '../../../hooks/useModule';
import { base64ToUtf8, getDomain } from '../../../assets/assets';
import { useEffect, useRef, useState } from 'react';
import { useThreadContext } from '../../../hooks/useThreadContext';
import { Brain, CircleDollarSign, Edit, LayoutTemplateIcon, Sparkle, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { ViewButton } from '../../ViewButton';
import Attachment from '../../Attachment';
import MicInput from "../../MicInput"
import { LoadingChase } from '../../Loading';
import { CREATE_DEAL_API_KEY } from '../../../store/constants';
import { aiReplyAction, getAiReply } from '../../../store/Slices/aiReply';
import FirstReplyBtn from '../../FirstReplyBtn';
import { SmallTinyEditor } from '../../TinyEditor';

const ReplyButtons = ({
    editorRef,
    editorReady
}) => {
    const { setEditorContent, setFiles, files, editorContent, setContentLoading, htmlfile, setHtmlfile } = useOutletContext()
    const { context: { currentEmail, currentThread: threadId } } = useThreadContext()
    const [showTemplatePopup, setShowTemplatePopup] = useState(false);
    const [aiReplyContent, setAiReplyContent] = useState("");
    const [openParent, setOpenParent] = useState(null);
    const [favourites, setFavourites] = useState([]);
    const [templateId, setTemplateId] = useState(null);
    const navigate = useNavigate()
    const [showHtmlEditor, setShowHtmlEditor] = useState(false);
    const [tempHtml, setTempHtml] = useState(`<div style="font-family: Arial, Helvetica, sans-serif; background: #ffffff; border: 1px solid #e8e8e8; padding: 28px;">
<p style="margin: 0 0 14px 0; font-size: 15px; color: #333;">Hello,</p>
<p style="margin: 0 0 16px 0; font-size: 15px; color: #444; line-height: 1.6;">I hope you're doing well.</p>
<p style="margin: 0 0 18px 0; font-size: 15px; color: #444; line-height: 1.6;">When convenient, could you please share the <strong>allocated budget</strong> for this project? Having visibility into the budget will help us tailor our approach and recommend the most suitable solution for your goals.</p>
<div style="background: #f6f8fb; border-left: 4px solid #4f7cff; padding: 14px 16px; margin: 18px 0;"><span style="font-size: 14px; color: #555;"> This allows us to align scope, strategy, and deliverables effectively. </span></div>
<p style="margin: 18px 0 0 0; font-size: 15px; color: #444;">Thank you in advance. I look forward to your response.</p>
<p style="margin-top: 22px; font-size: 15px; color: #333;">&nbsp;</p>
</div>` || "");
    const [editorReadyLocal, setEditorReadyLocal] = useState(false);
    const editorRefLocal = useRef(null);
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
        setContentLoading(aiLoading)

    }, [aiLoading])
    return (
        <>
            <AnimatePresence>
                {showHtmlEditor && (
                    <motion.div
                        className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        <motion.div
                            className="bg-white w-[900px] max-w-[95%] h-[80vh] rounded-2xl shadow-xl flex flex-col"
                            initial={{ scale: 0.8, y: 40 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, y: 40 }}
                        >
                            {/* HEADER */}
                            <div className="flex justify-between items-center p-3 border-b">
                                <h2 className="font-semibold text-lg">Edit File</h2>

                                <button onClick={() => setShowHtmlEditor(false)}>
                                    <X />
                                </button>
                            </div>

                            {/* YOUR SMALL EDITOR */}
                            <div className="flex-1 overflow-hidden">
                                <SmallTinyEditor
                                    editorContent={tempHtml}
                                    setEditorContent={setTempHtml}
                                    editorRef={editorRefLocal}
                                    setEditorReady={setEditorReadyLocal}
                                />
                            </div>

                            {/* FOOTER */}
                            <div className="flex justify-end gap-2 p-3 border-t">
                                <button
                                    onClick={() => setShowHtmlEditor(false)}
                                    className="px-4 py-2 bg-gray-200 rounded-lg"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={() => {
                                        setHtmlfile(tempHtml); // ✅ MAIN UPDATE
                                        setShowHtmlEditor(false);
                                    }}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg"
                                >
                                    Save
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <div className="flex items-center gap-3 flex-wrap">
                <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                        setEditorContent("");
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 mb-7"
                >
                    <Trash2 className="w-5 h-5" />
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
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 flex gap-2  p-3 rounded-2xl shadow-2xl border border-gray-200"
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
                                                        className="bg-black px-4 py-3 rounded-xl border border-gray-200 text-sm text-white font-medium shadow-sm hover:shadow-md transition-all duration-200 whitespace-nowrap"
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
                        className="bg-gradient-to-r from-purple-500 to-pink-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                        onClick={insertTextAtCursor}
                    >
                        <CircleDollarSign className="w-5 h-5" />
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
                        className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
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
                        <LayoutTemplateIcon className="w-5 h-5" />
                    </motion.button>
                </ViewButton>
                <FirstReplyBtn email={currentEmail} />

                <Attachment data={files} onChange={setFiles} />
                {htmlfile && (
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            setTempHtml(htmlfile);
                            setShowHtmlEditor(true);
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded-xl flex items-center gap-2"
                    >
                        <Edit className="w-4 h-4" />
                        Edit Invoice
                    </motion.button>
                )}
                <MicInput editorRef={editorRef} />
            </div></>

    )
}

export default ReplyButtons