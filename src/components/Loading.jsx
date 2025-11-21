import { Mirage, Tailspin, TailChase } from "ldrs/react";
import "ldrs/react/Mirage.css";
import "ldrs/react/Tailspin.css";
import "ldrs/react/NewtonsCradle.css";
import "ldrs/react/TailChase.css";

export default function Loading({ text }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Mirage size="60" speed="2.5" color="green" />
      <p className="text-black mt-3">Loading {text}...</p>
    </div>
  );
}

export function LoadingSpin() {
  return (
    <>
      <Tailspin size="14" stroke="1" speed="0.9" color="white" />
    </>
  );
}
export function LoadingChase() {
  return <TailChase size="40" speed="1" color="green" />;
}
// Default values shown
