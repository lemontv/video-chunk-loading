import React from "react";
import { CloudinaryVideo } from "./CloudinaryVideo";

const url = "/frag_bunny.mp4";
// const url = "https://res.cloudinary.com/demo/video/upload/dog.mp4";

function App() {
  return (
    <div>
      <header>Video</header>
      <CloudinaryVideo src={url} />
    </div>
  );
}

export default App;
