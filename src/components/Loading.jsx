import { Mirage } from "ldrs/react";
import "ldrs/react/Mirage.css";

export default function Loading({ text }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Mirage size="60" speed="2.5" color="green" />
      <p className="text-black mt-3">Loading {text}...</p>
    </div>
  );
}
