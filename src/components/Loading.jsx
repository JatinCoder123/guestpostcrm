import { Mirage, Tailspin, TailChase, Ping, Hourglass } from "ldrs/react";
import "ldrs/react/Mirage.css";
import "ldrs/react/Tailspin.css";
import "ldrs/react/NewtonsCradle.css";
import "ldrs/react/TailChase.css";
import "ldrs/react/Ping.css";
import "ldrs/react/Hourglass.css";

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
export function LoadingChase({ size = "40", color = "green" }) {
  return <TailChase size={size} speed="1" color={color} />;
}
export function LoadingAll({ type = "ping" , size = "40", color = "green" }) {
  if (type == "ping") return <Ping size={size} speed="2" color={color} />;
  else if (type == "hourglass")
    return <Hourglass size="40" bgOpacity="0.1" speed="1.75" color="black" />;

  // Default values shown
}

// Default values shown

// Default values shown
