import React from "react";
import { CloudinaryVideo } from "./CloudinaryVideo";

// const url = "/frag_bunny.mp4";
const url =
  "https://res.cloudinary.com/demo/video/upload/fl_hlsv3,sp_sd/dog.mp4dv";

function App() {
  return (
    <div>
      <header>Video</header>
      <CloudinaryVideo src={url} />
    </div>
  );
}

// <video src={url} controls />

export default App;
