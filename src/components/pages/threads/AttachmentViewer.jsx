import React from "react";
import { X } from "lucide-react"; // optional (or use simple ❌)

const getFileType = (url) => {
    console.log(url)
    const ext = url.split(".").pop().toLowerCase();

    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "image";
    if (["mp4", "webm", "ogg"].includes(ext)) return "video";
    if (ext === "pdf") return "pdf";
    return "other";
};

const AttachmentViewer = ({ files = [], isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">

            {/* Modal Box */}
            <div className="bg-white w-[90%] md:w-[70%] max-h-[80vh] rounded-2xl shadow-xl relative overflow-hidden">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow hover:bg-gray-100"
                >
                    {/* You can replace with ❌ if no lucide */}
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[80vh]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {files.map((file, index) => {
                            console.log(file)
                            const type = getFileType(file);

                            return (
                                <div
                                    key={index}
                                    className="border rounded-xl overflow-hidden"
                                >
                                    {type === "image" && (
                                        <img
                                            src={file.url}
                                            alt="attachment"
                                            className="w-full h-48 object-cover"
                                        />
                                    )}

                                    {type === "video" && (
                                        <video controls className="w-full h-48">
                                            <source src={file} />
                                        </video>
                                    )}

                                    {type === "pdf" && (
                                        <iframe
                                            src={file}
                                            title="pdf"
                                            className="w-full h-48"
                                        />
                                    )}

                                    {type === "other" && (
                                        <div className="flex flex-col items-center justify-center h-48">
                                            <span className="text-4xl">📄</span>
                                            <p className="text-sm mt-2">Unsupported File</p>
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="p-2 flex justify-between text-sm">
                                        <a
                                            href={file}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500"
                                        >
                                            Open
                                        </a>
                                        <a href={file} download className="text-gray-500">
                                            Download
                                        </a>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AttachmentViewer;