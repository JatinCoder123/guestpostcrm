import { useContext, useEffect } from "react";
import { PageContext } from "../context/pageContext.jsx";
import video from "/video.mp4"

const DisplayIntro = () => {
  const { setDisplayIntro } = useContext(PageContext);
  return (
    <div className="h-screen w-screen overflow-hidden m-0 p-0">
      <video
        src={video}
        autoPlay
        muted
        playsInline
        onEnded={() => {
          setDisplayIntro(false);
          localStorage.setItem("displayIntro", "false");
        }}
      />
    </div>
  );
};

export default DisplayIntro;
