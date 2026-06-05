import { useNavigate, useOutletContext } from "react-router-dom";
import TemplateSelectorModal from "../../TemplateSelectorModal";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import useModule from "../../../hooks/useModule";
import { base64ToUtf8, getDomain } from "../../../assets/assets";
import { useEffect, useRef, useState } from "react";
import { useThreadContext } from "../../../hooks/useThreadContext";
import {
  Brain,
  CircleDollarSign,
  CreditCard,
  Edit,
  Edit2,
  Heart,
  HandMetal,
  LayoutTemplateIcon,
  Sparkles,
  Trash2,
  X,
  Zap,
  FileText,
  Settings,
  PenLine,
  Check,
  StopCircle,
  CircleStop,
} from "lucide-react";
import Attachment from "../../Attachment";
import MicInput from "../../MicInput";
import { LoadingChase } from "../../Loading";
import { CREATE_DEAL_API_KEY, FETCH_GPC_X_API_KEY } from "../../../store/constants";
import { aiReplyAction, getAiReply } from "../../../store/Slices/aiReply";
import FirstReplyBtn from "../../FirstReplyBtn";
import {DeepReplyBtn} from "../../DeepReplyBtn";
import { SmallTinyEditor } from "../../TinyEditor";
import IconButton from "../../ui/Buttons/IconButton";
import { BiSolidMessageCheck } from "react-icons/bi";
import { editContact, viewEmailAction } from "../../../store/Slices/viewEmail";
import { fetchGpc } from "../../../services/api";
import { useNext } from "../../../hooks/useNext";

const ReplyButtons = ({ editorRef, editorReady }) => {
  const {
    setEditorContent,
    setFiles,
    files,
    editorContent,
    htmlfile,
    setHtmlfile,
    pdfLoading,
  } = useOutletContext();
  const {
    context: { currentEmail, currentThread: threadId },
  } = useThreadContext();
  const { moveToNext } = useNext()
  const [showTemplatePopup, setShowTemplatePopup] = useState(false);
  const [aiReplyContent, setAiReplyContent] = useState("");
  const [openParent, setOpenParent] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [templateId, setTemplateId] = useState(null);
  const [editMode, setEditMode] = useState(false); // ← dedicated edit toggle

  const navigate = useNavigate();
  const [showHtmlEditor, setShowHtmlEditor] = useState(false);
  const [tempHtml, setTempHtml] = useState(htmlfile || "");
  const [editorReadyLocal, setEditorReadyLocal] = useState(false);

  const editorRefLocal = useRef(null);

  const {
    loading: aiLoading,
    aiReply: aiResponse,
    error: aiError,
    message,
  } = useSelector((s) => s.aiReply);
  const { crmEndpoint } = useSelector((s) => s.user);
  const dispatch = useDispatch();

  /* ── data hooks ─────────────────────────────────────────── */
  const { loading, data: buttons } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_buttons&type=regular&email=${currentEmail}`,
    name: "BUTTONS",
    dependencies: [currentEmail, favourites],
  });
  const { loading: contactLoading, data: contact } = useModule({
    url: `${crmEndpoint}&type=get_contact&email=${currentEmail}`,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": FETCH_GPC_X_API_KEY, // 🔥 replace with env variable

    }, name: "GETTING CONTACT",
    dependencies: [currentEmail],
  });

  const {
    loading: templateLoading,
    data: template,
    refetch,
  } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates", where: { id: templateId } },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
    name: `TEMPLATE WITH ID ${templateId}`,
    dependencies: [templateId],
    enabled: templateId,
  });

  const { data: defaultTemplate } = useModule({
    url: `${getDomain(crmEndpoint)}/index.php?entryPoint=updateOffer&email=${currentEmail}`,
    name: "DEFAULT TEMPLATE",
    dependencies: [currentEmail],
  });

  const { data: priceTemp } = useModule({
    url: `${crmEndpoint.split("?")[0]}?entryPoint=get_post_all&action_type=get_data`,
    method: "POST",
    body: { module: "EmailTemplates", where: { name: "PRICE_LIST" } },
    headers: {
      "x-api-key": CREATE_DEAL_API_KEY,
      "Content-Type": "application/json",
    },
    name: "Price Template",
    dependencies: [currentEmail],
  });

  /* ── effects ─────────────────────────────────────────────── */
  useEffect(() => {
    if (template && editorReady && editorRef.current) {
      const html =
        template?.[0]?.body_html || base64ToUtf8(defaultTemplate?.html_base64);
      if (html) setEditorContent(html);
      else toast.warn("Template is empty—starting with blank editor.");
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



  /* ── helpers ─────────────────────────────────────────────── */
  const insertTextAtCursor = () => {
    if (editorRef.current) {
      editorRef.current.focus();
      editorRef.current.insertContent(
        priceTemp?.[0]?.body_html ?? "No Content Available",
      );
    }
  };
  const [stopLoading, setStopLoading] = useState(false)
  const hanldeConvDone = () => {
    dispatch(editContact({ contact: { ...contact.contact, conversation_complete: "1" }, account: { ...contact.account }, }, null,));
    dispatch(viewEmailAction.compleConv({ message: `Conversion Complete with ${currentEmail}`, sendedEmail: currentEmail }));
    moveToNext(currentEmail)
  };
  function insertAiReply(input) {
    setOpenParent(null);
    setTemplateId(null);
    setEditorContent(input);
  }

  const Btn = ({
    onClick,
    onEdit,
    gradient = "bg-gray-600",
    icon: Icon,
    label,
  }) => (
    <div className="relative inline-flex">
      <motion.button
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={onClick}
        title={label}
        className={`flex items-center gap-1 ${gradient} text-white text-[10.5px] font-medium
                    px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-150
                    whitespace-nowrap`}
      >
        {Icon && <Icon className="w-3 h-3 shrink-0" />}
        {label}
      </motion.button>

      {/* Edit badge — visible only in editMode */}
      <AnimatePresence>
        {editMode && onEdit && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.12 }}
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="absolute -top-2 -right-2 bg-amber-400 hover:bg-amber-500
                       border-2 border-white rounded-full p-[3px] shadow-lg"
            style={{ zIndex: 9999 }}
            title="Edit template"
          >
            <Edit2 className="w-2 h-2 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* ── HTML Editor Modal ────────────────────────────────── */}
      <AnimatePresence>
        {showHtmlEditor && (
          <motion.div
            className="fixed inset-0 bg-black/40 flex items-center justify-center"
            style={{ zIndex: 9999 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white w-[900px] max-w-[95%] h-[80vh] rounded-2xl shadow-xl flex flex-col"
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
            >
              <div className="flex justify-between items-center p-3 border-b">
                <h2 className="font-semibold text-lg">Edit File</h2>
                <button onClick={() => setShowHtmlEditor(false)}>
                  <X />
                </button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SmallTinyEditor
                  editorContent={tempHtml}
                  setEditorContent={setTempHtml}
                  editorRef={editorRefLocal}
                  setEditorReady={setEditorReadyLocal}
                />
              </div>
              <div className="flex justify-end gap-2 p-3 border-t">
                <button
                  onClick={() => setShowHtmlEditor(false)}
                  className="px-4 py-2 bg-gray-200 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setHtmlfile(tempHtml);
                    setShowHtmlEditor(false);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg text-sm"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Template Selector Modal ──────────────────────────── */}
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

      <div className="flex flex-col w-full" style={{ overflow: "visible" }}>
        {/* ═══ SECTION A — all action buttons, always visible ═══ */}
        <div
          className="flex flex-wrap items-center gap-1.5 px-1 py-1.5"
          style={{ overflow: "visible" }}
        >
          {/* ── AI Smart Reply ── */}
          <Btn
            gradient="bg-gradient-to-r from-indigo-500 to-purple-600"
            icon={Sparkles}
            label="AI  Reply"
            onClick={() => {
              if (aiReplyContent === "") dispatch(getAiReply(threadId, null, null, currentEmail));
              insertAiReply(aiReplyContent);
            }}
            onEdit={() => navigate("/settings/templates")}
          />

          {/* ── AI Now ── */}
          <Btn
            gradient="bg-gradient-to-r from-yellow-400 to-orange-500"
            icon={Zap}
            label="AI Now"
            onClick={() => {
              dispatch(getAiReply(threadId, 1, editorContent, currentEmail));
              insertAiReply(editorContent);
            }}
            onEdit={() => navigate("/settings/templates")}
          />

          {/* ── Pricing ── */}
          <Btn
            gradient="bg-gradient-to-r from-blue-500 to-cyan-600"
            icon={CreditCard}
            label="Pricing"
            onClick={insertTextAtCursor}
            onEdit={() =>
              navigate("/settings/templates", {
                state: { templateId: priceTemp?.[0]?.id },
              })
            }
          />

          {/* ── Template picker ── */}
          <Btn
            gradient="bg-gradient-to-r from-gray-500 to-gray-700"
            icon={LayoutTemplateIcon}
            label="Template"
            onClick={() => {
              setTemplateId(null);
              if (defaultTemplate && editorRef.current) {
                setEditorContent(base64ToUtf8(defaultTemplate.html_base64));
                setOpenParent(null);
              }
              setShowTemplatePopup(true);
              refetch();
            }}
            onEdit={() =>
              navigate("/settings/templates", { state: { templateId } })
            }
          />

          {/* ── Dynamic API buttons ── */}
          {loading ? (
            <LoadingChase className="p-1" />
          ) : (
            buttons?.map((btnGroup, i) => {
              const parent = btnGroup.parent_btn;
              const children = btnGroup.child_btn;
              const isOpen = openParent === parent.id;

              return (
                <div
                  key={i}
                  className="relative inline-flex"
                  style={{ overflow: "visible" }}
                >
                  {/* Parent button */}
                  <div className="relative inline-flex">
                    <motion.button
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => {
                        setTemplateId(parent.email_template_id);
                        setOpenParent(isOpen ? null : parent.id);
                      }}
                      className="flex items-center gap-1 bg-gradient-to-r from-purple-500 to-pink-600
                                 text-white text-[10.5px] font-medium px-4 py-2 rounded-md
                                 shadow-sm hover:shadow-md transition-all whitespace-nowrap"
                    >
                      {parent.button_label}
                    </motion.button>

                    {/* Edit badge */}
                    <AnimatePresence>
                      {editMode && (
                        <motion.button
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.12 }}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate("/settings/templates", {
                              state: { templateId: parent.email_template_id },
                            });
                          }}
                          className="absolute -top-2 -right-2 bg-amber-400 hover:bg-amber-500
                                     border-2 border-white rounded-full p-[3px] shadow-lg"
                          style={{ zIndex: 9999 }}
                          title="Edit template"
                        >
                          <Edit2 className="w-2 h-2 text-white" />
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Children dropdown */}
                  <AnimatePresence>
                    {isOpen && children?.length > 0 && (
                      <motion.div
                        initial={{ y: 4, opacity: 0, scale: 0.95 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 4, opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.14,
                          type: "spring",
                          stiffness: 420,
                          damping: 32,
                        }}
                        className="absolute bottom-full left-0 mb-2 flex flex-col gap-1
                                   bg-white p-1.5 rounded-xl border border-gray-200 min-w-[140px]"
                        style={{
                          zIndex: 9999,
                          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                        }}
                      >
                        {children.map((child, j) => (
                          <div key={j} className="relative inline-flex">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.97 }}
                              onClick={() => {
                                setTemplateId(child.email_template_id);
                                setOpenParent(null);
                              }}
                              className="w-full text-left bg-gray-900 hover:bg-gray-800 text-white
                                         text-[11px] font-medium px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
                            >
                              {child.button_label}
                            </motion.button>

                            {/* Child edit badge */}
                            <AnimatePresence>
                              {editMode && (
                                <motion.button
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  exit={{ scale: 0, opacity: 0 }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate("/settings/templates", {
                                      state: {
                                        templateId: child.email_template_id,
                                      },
                                    });
                                  }}
                                  className="absolute -top-2 -right-2 bg-amber-400 hover:bg-amber-500
                                             border-2 border-white rounded-full p-[3px] shadow-lg"
                                  style={{ zIndex: 9999 }}
                                  title="Edit"
                                >
                                  <Edit2 className="w-2 h-2 text-white" />
                                </motion.button>
                              )}
                            </AnimatePresence>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}

          {/* ── First Reply ── */}
          <FirstReplyBtn email={currentEmail} />
          <DeepReplyBtn />
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400 }}
            className="flex items-center justify-center bg-slate-600 hover:bg-green-700 cursor-pointer text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={hanldeConvDone}
            disabled={contactLoading}
          >
            <BiSolidMessageCheck className="w-6 h-6" />
          </motion.button>
          <IconButton
            disabled={stopLoading || contactLoading}
            loading={stopLoading}
            onClick={async () => {
              setStopLoading(true);

              try {
                const newValue =
                  contact?.contact?.is_stop === "1" ? "0" : "1";

                const data = await fetchGpc({
                  params: {
                    type: "force_stop",
                    id: contact?.contact?.id,
                    new_value: newValue,
                    user: currentEmail,
                  },
                });

                console.log(data);
                toast.success(
                  newValue === "1"
                    ? "Emails stopped successfully"
                    : "Emails resumed successfully"
                );
                moveToNext(currentEmail)
              } catch (err) {
                console.error(err);
                toast.error("Failed To Change Email State!");
              } finally {
                setStopLoading(false);
              }
            }}
            label={contact?.contact?.is_stop === "1"
              ? "Resume Emails"
              : "Stop Future Emails"}
            icon={StopCircle}
            className={`flex items-center gap-2 text-white text-[10.5px] font-medium
    p-2 rounded-full shadow-sm hover:shadow-md transition-all duration-150
    whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed
    ${contact?.contact?.is_stop === "1"
                ? "bg-gradient-to-r from-red-500 to-red-700"
                : "bg-gradient-to-r from-yellow-400 to-orange-500"
              }`}
          />



          {/* ── Edit Invoice (only if htmlfile exists) ── */}
          {htmlfile && (
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                setTempHtml(htmlfile);
                setShowHtmlEditor(true);
              }}
              className="flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white
                         text-[10.5px] font-medium px-2 py-[4px] rounded-md shadow-sm
                         hover:shadow-md transition-all whitespace-nowrap"
            >
              <Edit className="w-5 h-5 shrink-0" />
              Edit Invoice
            </motion.button>
          )}
        </div>

        {/* ═══ SECTION B — utility footer ═══ */}
        <div className="flex  items-center justify-between gap-3 px-1 py-1 border-t border-gray-100">
          {/* Left: utility icons */}
          <div className="flex items-center gap-2">
            {/* Clear editor */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => setEditorContent("")}
              className="p-1.5 bg-red-50 rounded-lg transition-colors text-red-500 "
              title="Clear editor"
            >
              <Trash2 className="w-6 h-6" />
            </motion.button>

            {/* Attachment */}
            {pdfLoading ? (
              <div className="px-2 py-1 bg-gray-100 rounded-lg text-[10px] text-gray-400">
                Preparing…
              </div>
            ) : (
              <Attachment data={files} onChange={setFiles} />
            )}

            {/* Mic */}
            <MicInput editorRef={editorRef} />
          </div>

          {/* Right: ✏️ Edit mode toggle — dedicated button */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => setEditMode((v) => !v)}
            className={`flex items-center gap-1 text-[10.5px] font-semibold px-2 py-1 rounded-lg
                        border transition-all duration-150 ${editMode
                ? "bg-amber-400 border-amber-400 text-white shadow-md"
                : "bg-white border-gray-300 text-gray-500 hover:border-amber-400 hover:text-amber-500"
              }`}
            title="Toggle edit mode"
          >
            {editMode ? (
              <>
                <Check className="w-6 h-6" /> Done
              </>
            ) : (
              <>
                <PenLine className="w-4 h-4" />
              </>
            )}
          </motion.button>
        </div>
      </div>
    </>
  );
};

export default ReplyButtons;
