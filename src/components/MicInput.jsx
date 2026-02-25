import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

const MicInput = ({ editorRef }) => {
    const recognitionRef = useRef(null);
    const listeningRef = useRef(false); // real mic state
    const finalTranscriptRef = useRef(""); // committed text

    const [listening, setListening] = useState(false);

    useEffect(() => {
        const SpeechRecognition =
            window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("Speech Recognition not supported");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = true;   // 🔥 REAL-TIME TEXT
        recognition.continuous = true;       // 🔥 DON'T STOP ON SILENCE

        recognition.onresult = (event) => {
            let interimText = "";

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;

                if (event.results[i].isFinal) {
                    finalTranscriptRef.current += transcript + " ";
                } else {
                    interimText += transcript;
                }
            }

            if (editorRef.current) {
                editorRef.current.focus(); // ensure cursor is active

                editorRef.current.insertContent(
                    finalTranscriptRef.current + interimText
                );
            }
        };

        recognition.onend = () => {
            // 🔁 Auto-restart unless user stopped it
            if (listeningRef.current) {
                recognition.start();
            }
        };

        recognition.onerror = (e) => {
            console.error("Speech error:", e);
        };

        recognitionRef.current = recognition;

        return () => recognition.stop();
    }, [editorRef]);

    const toggleMic = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (listeningRef.current) {
            listeningRef.current = false;
            setListening(false);
            recognition.stop();
        } else {
            finalTranscriptRef.current = "";
            listeningRef.current = true;
            setListening(true);
            recognition.start();
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMic}
            className={`p-3 rounded-full shadow-lg flex items-center gap-2 text-white ${listening
                ? "bg-gradient-to-r from-red-500 to-pink-600"
                : "bg-blue-600"
                }`}
        >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
        </motion.button>
    );
};

export default MicInput;