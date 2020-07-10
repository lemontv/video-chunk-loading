import React, { useState, useEffect } from "react";

type CloudinaryVideoProps = React.DetailedHTMLProps<
  React.ImgHTMLAttributes<HTMLVideoElement>,
  HTMLVideoElement
>;

const mimeCodec = 'video/mp4; codecs="avc1.42E01E, mp4a.40.2"';
const chunkSize = 1000000;

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

  useEffect(() => {
    if (!src) return;

    (async () => {
      const { headers } = await fetchVideoInfo(src);
      const size = parseInt(headers.get("Content-Length") || "0", 10);
      let start = 0;
      let end = getEnd(start, chunkSize, size);

      const mediaSource = new MediaSource();
      setURL(window.URL.createObjectURL(mediaSource));
      mediaSource.addEventListener("sourceopen", () => {
        const sourceBuffer = mediaSource.addSourceBuffer(mimeCodec);
        sourceBuffer.addEventListener("updateend", () => {
          if (end !== size - 1) {
            start = end + 1;
            end = getEnd(start, chunkSize, size);
            loadBuffer(src, sourceBuffer, start, end);
          }
        });

        loadBuffer(src, sourceBuffer, start, end);
      });
    })();
  }, [src]);

  return { url };
};

export const CloudinaryVideo: React.FC<CloudinaryVideoProps> = (props) => {
  const { src } = props;
  const { url } = useVideo(src);

  return <video src={url} controls />;
};

export default CloudinaryVideo;
