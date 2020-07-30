import React, { useState, useEffect } from "react";

type CloudinaryVideoProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

// const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
// const mimeCodec = 'video/mp4; codecs="mp4a.40.2,avc1.64001f"';
const mimeCodec =
  'video/mp4; codecs="mp4a.40.2,avc1.64001f"; profiles="mp41,mp42,isom"';
const chunkSize = 100000;

const fetchVideoInfo = async (url: string) => {
  const { headers } = await fetch(url, { method: "HEAD" });
  return {
    headers,
  };
};

const loadBuffer = async (
  url: string,
  sourceBuffer: SourceBuffer,
  start: number,
  end: number
) => {
  const headers = new Headers({
    Range: `bytes=${start}-${end}`,
  });

  console.log("start", start);
  console.log("end", end);

  const response = await fetch(url, { headers });
  const data = await response.arrayBuffer();

  sourceBuffer.appendBuffer(data);
};

const getEnd = (start: number, chunkSize: number, size: number) => {
  const end = start + chunkSize;

  return end > size ? size - 1 : end;
};

const useVideo = (src?: string) => {
  const [url, setURL] = useState<string>();
  const [mediaSource] = useState(new MediaSource());

  useEffect(() => {
    if (!src) return;
    let hasError = false;

    (async () => {
      const { headers } = await fetchVideoInfo(src);
      const size = parseInt(headers.get("Content-Length") || "0", 10);
      let start = 0;
      let end = getEnd(start, chunkSize, size);

      setURL(window.URL.createObjectURL(mediaSource));
      mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        sourceBuffer.addEventListener("updateend", () => {
          if (end < size - 1 && !hasError) {
            start = end + 1;
            end = getEnd(start, chunkSize, size);
            loadBuffer(src, sourceBuffer, start, end);
          }
        });

        console.log("media SourceOpen");
        sourceBuffer.addEventListener("updatestart", function (e) {
          console.log("buffer UpdateStart: " + mediaSource.readyState);
        });
        sourceBuffer.addEventListener("update", function (e) {
          console.log("buffer Update: " + mediaSource.readyState);
        });
        sourceBuffer.addEventListener("updateend", function (e) {
          console.log("buffer UpdateEnd: " + mediaSource.readyState);
        });
        sourceBuffer.addEventListener("abort", function (e) {
          console.log("buffer Abort: " + mediaSource.readyState);
        });

        sourceBuffer.addEventListener("error", (e) => {
          console.log("buffer Error: " + mediaSource.readyState);
          console.log(e);
          hasError = true;
        });

        loadBuffer(src, sourceBuffer, start, end);
      });
      mediaSource.addEventListener("sourceended", (e) => {
        console.log("media SourceEnded: " + mediaSource.readyState);
      });
      mediaSource.addEventListener("sourceclose", (e) => {
        console.log("media SourceClose: " + mediaSource.readyState);
      });
      mediaSource.addEventListener("error", (e) => {
        console.log("media Error: " + mediaSource.readyState);
        hasError = true;
      });
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return { url };
};

export const CloudinaryVideo: React.FC<CloudinaryVideoProps> = (props) => {
  const { src } = props;
  const { url } = useVideo(src);

  return <video src={url} controls />;
};

export default CloudinaryVideo;
