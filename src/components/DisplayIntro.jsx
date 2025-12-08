import { useContext, useEffect } from "react";
import { PageContext } from "../context/pageContext.jsx";


const DisplayIntro = () => {
  const { setDisplayIntro } = useContext(PageContext);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayIntro(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-screen overflow-hidden m-0 p-0">
      <video
        src="/video.mp4"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
      />
    </div>
  );
};

export default DisplayIntro;
