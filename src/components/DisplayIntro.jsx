import { useContext, useEffect } from "react";
import { PageContext } from "../context/pageContext.jsx";
import video from "/video.mp4"

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
        src={video}
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
