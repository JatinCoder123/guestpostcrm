import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { motion } from "framer-motion";

const MicInput = ({ editorRef }) => {
    const recognitionRef = useRef(null);
    const lastTranscriptRef = useRef("");
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
        recognition.interimResults = false;
        recognition.continuous = false;

        recognition.onresult = (event) => {
            const result = event.results[event.resultIndex];
            if (!result.isFinal) return;

            const transcript = result[0].transcript.trim();

            // 🔒 Prevent duplicate insert
            if (!transcript || transcript === lastTranscriptRef.current) return;

            lastTranscriptRef.current = transcript;

            if (editorRef.current) {
                editorRef.current.insertContent(transcript + " ");
            }
        };

        recognition.onend = () => {
            setListening(false); // 🔑 sync UI with real mic state
        };

        recognition.onerror = () => {
            setListening(false);
        };

        recognitionRef.current = recognition; // 🔑 FIX #1

        return () => {
            recognition.stop();
            recognitionRef.current = null;
        };
    }, [editorRef]);

    const toggleMic = () => {
        const recognition = recognitionRef.current;
        if (!recognition) return;

        if (listening) {
            recognition.stop();
            setListening(false);
        } else {
            lastTranscriptRef.current = ""; // reset before new session
            recognition.start();
            setListening(true);
        }
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleMic}
            className={`p-3 rounded-full cursor-pointer hover:opacity-90 shadow-lg transition-all duration-200 flex items-center gap-2 text-white ${listening
                ? "bg-gradient-to-r from-red-500 to-pink-600 "
                : "bg-slate-800 "
                }`}
        >
            {listening ? <MicOff size={18} /> : <Mic size={18} />}

        </motion.button>
    );
};

export default MicInput;