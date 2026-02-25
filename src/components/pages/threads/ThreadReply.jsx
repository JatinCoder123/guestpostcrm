import {
    Mail,
    Globe,
    Send,
    Brain,
    X,
    Sparkles,
    ChevronLeft,
    Zap,
    Edit,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendEmail, viewEmailAction } from "../../../store/Slices/viewEmail";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply";
import { Editor } from "@tinymce/tinymce-react";
import { CREATE_DEAL_API_KEY, TINY_EDITOR_API_KEY } from "../../../store/constants";
import { LoadingChase } from "../../Loading";
import { toast } from "react-toastify";
import { base64ToUtf8, getDomain } from "../../../assets/assets";
import useModule from "../../../hooks/useModule";
import PageLoader from "../../PageLoader";
import Attachment from "../../Attachment";
import { useNavigate } from "react-router-dom";
import { ViewButton } from "../../ViewButton";
import useIdle from "../../../hooks/useIdle";
import MicInput from "../../MicInput";
const ThreadReply = () => {
    const editorRef = useRef(null);
    const [editorContent, setEditorContent] = useState();
    useIdle({ idle: false });
    const dispatch = useDispatch();
    const {
        viewEmail,
        threadId: viewThreadId,
        message: sendMessage,
        sending,
        error: sendError,
    } = useSelector((s) => s.viewEmail);
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const { businessEmail, crmEndpoint } = useSelector((s) => s.user);
    const [aiReplyContent, setAiReplyContent] = useState("");
    const [aiNewContent, setAiNewContent] = useState("");

    const {
        loading: aiLoading,
        aiReply: aiResponse,
        error: aiError,
        message,
    } = useSelector((state) => state.aiReply);

    const {
        loading: templateListLoading,
        data: templateList,
        error,
        refetch,
    } = useModule({
        url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
        method: "POST",
        body: { module: "EmailTemplates" },
        headers: {
            "x-api-key": CREATE_DEAL_API_KEY,
            "Content-Type": "application/json",
        },
        name: "TEMPLATE LIST",
        dependencies: [crmEndpoint],
        enabled: false,
    });

    const [showEditorScreen, setShowEditorScreen] = useState(false);
    const [input, setInput] = useState("");
    const [openParent, setOpenParent] = useState(null);
    const [CC, setCC] = useState([]);
    const [BCC, setBCC] = useState([]);
    const [showCC, setShowCC] = useState(false);
    const [showBCC, setShowBCC] = useState(false);

    const [templateId, setTemplateId] = useState(null);
    const [editorReady, setEditorReady] = useState(false);
    const [showTemplatePopup, setShowTemplatePopup] = useState(false);
    const attachmentBoxRef = useRef(null);

    // FETCH BUTTONS
    const { loading, data: buttons } = useModule({
        url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_buttons&type=regular&email=${tempEmail}`,
        name: "BUTTONS",
        dependencies: [tempEmail],
    });

    // DEFAULT TEMPLATE
    const { loading: defTemplateLoading, data: defaultTemplate } = useModule({
        url: `${getDomain(crmEndpoint)}/index.php?entryPoint=updateOffer&email=${tempEmail}`,
        name: "DEFAULT TEMPLATE",
        dependencies: [tempEmail],
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
        dependencies: [tempEmail],
    });

    // SELECTED TEMPLATE
    const { loading: templateLoading, data: template } = useModule({
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

    // LOAD TEMPLATE INTO EDITOR
    useEffect(() => {
        if (template && editorReady && editorRef.current) {
            const htmlContent =
                template?.[0]?.body_html || base64ToUtf8(defaultTemplate.html_base64);
            if (htmlContent) {
                setEditorContent(htmlContent);
                setInput(htmlContent);
            } else {
                toast.warn("Template is empty—starting with blank editor.");
            }
        }
    }, [template, editorReady]);

    function insertAiReply(input) {
        setOpenParent(null);
        setTemplateId(null);
        setInput(input);
        setEditorContent(input);
    }


    useEffect(() => {
        console.log("FILES", files);
    }, [files]);


    const handleSendClick = () => {
        if (!showEditorScreen) {
            setShowEditorScreen(true);

            if (template && editorRef.current) {
                setEditorContent(template[0]?.body_html);
                setInput(template[0]?.body_html);
            }
            if (defaultTemplate && editorRef.current) {
                setEditorContent(base64ToUtf8(defaultTemplate.html_base64));
                setInput(base64ToUtf8(defaultTemplate.html_base64));
            }
            return;
        }
        const contentToSend = editorContent || input;
        dispatch(
            sendEmail({
                cc: CC,
                bcc: BCC,
                reply: contentToSend,
                attachments: files,
                threadId: view ? viewThreadId : threadId,
            }),
        );
    };

    const handleBackClick = () => {
        if (showEditorScreen) {
            setShowEditorScreen(false);
        } else {
            onClose();
        }
    };
    const insertTextAtCursor = () => {
        if (editorRef.current) {
            editorRef.current.focus(); // ensure cursor is active
            editorRef.current.insertContent(
                priceTemp[0]?.body_html ?? "No Content Available",
            );
        }
    };


    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                attachmentBoxRef.current &&
                !attachmentBoxRef.current.contains(e.target)
            ) {
                setOpenAttachmentsFor(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    useEffect(() => {
        if (sendMessage) {
            onClose();
            setInput("");
            setFiles([]);
            setEditorContent("");
        }
        if (sendError) {
            toast.error(sendError);
            dispatch(viewEmailAction.clearAllErrors());
        }
    }, [sendMessage, sendError]);
    useEffect(() => {
        if (message && aiResponse) {
            if (message == "User") setAiNewContent(aiResponse);
            else if (message == "New") setAiNewContent(aiResponse);
            else setAiReplyContent(aiResponse);
            insertAiReply(aiResponse);
            dispatch(aiReplyAction.clearMessge());
        }
        if (aiError) {
            toast.error(aiError);
            dispatch(aiReplyAction.clearAllErrors());
        }
    }, [message, aiResponse, dispatch]);

    return (
        <>
            {(aiLoading || templateLoading) && <PageLoader />}

            <div className="flex flex-col h-full w-full">
                <div className="flex-1 px-6 pb-4 overflow-hidden">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="h-full"
                    >
                        <Editor
                            apiKey={TINY_EDITOR_API_KEY}
                            value={editorContent || input}
                            onEditorChange={setEditorContent}
                            onInit={(e, editor) => {
                                editorRef.current = editor;
                                setEditorReady(true);
                            }}
                            init={{
                                height: "100%",
                                menubar: true,
                                branding: false,
                                statusbar: true,

                                /* ================= PLUGINS ================= */
                                plugins: `
      advlist autolink autosave directionality
      visualblocks visualchars wordcount
      fullscreen preview searchreplace
      insertdatetime lists link image media
      table charmap pagebreak nonbreaking
      anchor code codesample help
      emoticons quickbars
    `,

                                /* ================= TOOLBAR ================= */
                                toolbar: `
      undo redo | blocks fontfamily fontsize |
      bold italic underline strikethrough forecolor backcolor |
      alignleft aligncenter alignright alignjustify |
      bullist numlist outdent indent |
      link image media table |
      emoticons charmap insertdatetime |
      preview fullscreen |
      code help
    `,

                                toolbar_mode: "sliding",

                                /* ================= MENUBAR ================= */
                                menubar: "file edit view insert format tools table help",

                                /* ================= QUICKBARS ================= */
                                quickbars_selection_toolbar:
                                    "bold italic underline | quicklink h2 h3 blockquote",
                                quickbars_insert_toolbar: "image media table",

                                /* ================= AUTOSAVE ================= */
                                autosave_ask_before_unload: true,
                                autosave_interval: "30s",
                                autosave_restore_when_empty: true,

                                /* ================= IMAGES ================= */
                                image_advtab: true,
                                image_caption: true,
                                image_title: true,
                                automatic_uploads: true,

                                /* ================= TABLE ================= */
                                table_advtab: true,
                                table_cell_advtab: true,
                                table_row_advtab: true,
                                table_resize_bars: true,

                                /* ================= LINKS ================= */
                                link_assume_external_targets: true,
                                link_context_toolbar: true,

                                /* ================= CODE ================= */
                                codesample_languages: [
                                    { text: "HTML/XML", value: "markup" },
                                    { text: "JavaScript", value: "javascript" },
                                    { text: "CSS", value: "css" },
                                    { text: "Java", value: "java" },
                                    { text: "Python", value: "python" },
                                    { text: "PHP", value: "php" },
                                ],

                                /* ================= ACCESSIBILITY ================= */
                                a11y_advanced_options: true,

                                /* ================= CONTENT STYLE ================= */
                                content_style: `
      body {
        font-family: -apple-system, BlinkMacSystemFont,
          'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        font-size: 15px;
        line-height: 1.6;
        color: #333;
      }

      img {
        max-width: 100%;
        height: auto;
      }

      table {
        border-collapse: collapse;
        width: 100%;
      }

      table, th, td {
        border: 1px solid #ccc;
      }

      th, td {
        padding: 8px;
      }
    `,

                                /* ================= PREVIEW ================= */
                                preview_styles:
                                    "font-family font-size font-weight font-style text-decoration color background-color border padding margin line-height",

                                /* ================= UX ================= */
                                contextmenu: "link image table",
                                resize: true,
                            }}
                        />
                    </motion.div>
                </div>

                {/* ACTION ROW */}

                <div className="p-6 border-t bg-gradient-to-r from-white to-gray-50 flex items-center justify-between gap-4 shadow-2xl">
                    <div className="flex items-center gap-3 flex-wrap">
                        {/* AI REPLY BUTTON */}
                        <ViewButton Icon={Sparkles}>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                onClick={() => {
                                    if (aiReplyContent == "") {
                                        dispatch(getAiReply(view ? viewThreadId : threadId));
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
                                    dispatch(
                                        getAiReply(
                                            view ? viewThreadId : threadId,
                                            1,
                                            editorContent,
                                        ),
                                    );

                                    insertAiReply(editorContent);
                                }}
                            >
                                <Zap className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">
                                    AI Now
                                </span>
                            </motion.button>
                        </ViewButton>

                        <AnimatePresence>
                            {showTemplatePopup && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[200] bg-black/60 flex items-center justify-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl"
                                    >
                                        {/* HEADER */}
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">
                                                Select Email Template
                                            </h3>
                                            <button
                                                onClick={() => setShowTemplatePopup(false)}
                                                className="p-2 rounded-full hover:bg-gray-100 cursor-pointer"
                                            >
                                                <X className="w-6 h-6" />
                                            </button>
                                        </div>
                                        {templateListLoading && (
                                            <div className="flex items-center justify-center">
                                                <LoadingChase />
                                            </div>
                                        )}
                                        {/* TEMPLATE LIST */}
                                        {!templateListLoading && (
                                            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2">
                                                {templateList.map((tpl) => (
                                                    <motion.div
                                                        key={tpl.id}
                                                        whileHover={{ scale: 1.01 }}
                                                        whileTap={{ scale: 0.99 }}
                                                        className="group relative rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all"
                                                    >
                                                        {/* Accent bar */}
                                                        <div className="absolute left-0 top-0 h-full w-1 rounded-l-xl bg-transparent group-hover:bg-indigo-500 transition-all" />

                                                        <button
                                                            onClick={() => {
                                                                setEditorContent(tpl.body_html);
                                                                setInput(tpl.body_html);
                                                                setTemplateId(tpl.id);
                                                                setOpenParent(null);
                                                                setShowTemplatePopup(false);
                                                            }}
                                                            className="w-full text-left px-5 py-4 flex flex-col gap-1"
                                                        >
                                                            {/* Header Row */}
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="text-sm font-semibold text-gray-900 truncate">
                                                                    {tpl.name}
                                                                </h4>
                                                                <button onClick={() =>
                                                                    navigate("/settings/templates", {
                                                                        state: { templateId: tpl.id },
                                                                    })
                                                                } className="cursor-pointer">
                                                                    <Edit size={16} />

                                                                </button>
                                                            </div>

                                                            {/* Preview */}
                                                            <p className="text-xs text-gray-500 line-clamp-1">
                                                                {tpl.body_html
                                                                    ?.replace(/<[^>]+>/g, "")
                                                                    ?.slice(0, 90) || "No preview available"}
                                                            </p>
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                        {!templateListLoading && templateList.length === 0 && (
                                            <div className="flex items-center justify-center">
                                                <p className="text-gray-500">No templates found</p>
                                            </div>
                                        )}
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <ViewButton Icon={Edit}>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gradient-to-r from-gray-500 to-gray-700 text-white p-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                                onClick={() => {
                                    setTemplateId(null);
                                    if (defaultTemplate && editorRef.current) {
                                        const html = base64ToUtf8(defaultTemplate.html_base64);
                                        setEditorContent(html);
                                        setInput(html);
                                        setOpenParent(null);
                                    }
                                    setShowTemplatePopup(true);
                                    refetch();
                                }}
                            >
                                <Mail className="w-4 h-4" />
                                <span className="text-sm font-medium hidden sm:inline">
                                    Template
                                </span>
                            </motion.button>
                        </ViewButton>

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
                                        {/* PARENT BUTTON */}
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

                                        {/* CHILDREN LIST */}
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
                        <ViewButton Icon={Edit}>
                            <motion.button
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-5 py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 font-medium"
                                onClick={insertTextAtCursor}
                            >
                                Price
                            </motion.button>
                        </ViewButton>

                        <Attachment data={files} onChange={setFiles} />
                        <MicInput editorRef={editorRef} />
                        <div className="flex items-center gap-2 mb-3">
                            <button
                                onClick={() => setShowCC((p) => !p)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-gray-100 hover:bg-gray-200"
                            >
                                CC
                            </button>
                            <button
                                onClick={() => setShowBCC((p) => !p)}
                                className="text-xs font-medium px-3 py-1.5 rounded-lg border bg-gray-100 hover:bg-gray-200"
                            >
                                BCC
                            </button>
                        </div>

                        <AnimatePresence>
                            {showCC && (
                                <motion.input
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    type="text"
                                    placeholder="CC (comma separated emails)"
                                    className="w-64 px-3 py-2 text-sm border rounded-xl mb-2"
                                    onChange={(e) =>
                                        setCC(
                                            e.target.value
                                                .split(",")
                                                .map((v) => v.trim())
                                                .filter(Boolean),
                                        )
                                    }
                                />
                            )}
                        </AnimatePresence>

                        <AnimatePresence>
                            {showBCC && (
                                <motion.input
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -5 }}
                                    type="text"
                                    placeholder="BCC (comma separated emails)"
                                    className="w-64 px-3 py-2 text-sm border rounded-xl"
                                    onChange={(e) =>
                                        setBCC(
                                            e.target.value
                                                .split(",")
                                                .map((v) => v.trim())
                                                .filter(Boolean),
                                        )
                                    }
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SEND BUTTON */}
                    <div className="flex gap-2 item-center justify-center">
                        <motion.button
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSendClick}
                            disabled={loading}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-4 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            <span>{sending ? "Sending..." : "Send Email"}</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </>
    )

}

export default ThreadReply