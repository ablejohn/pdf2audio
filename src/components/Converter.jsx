import { useRef, useContext, useState } from "react";
import pdfToText from "react-pdftotext";
import { franc } from "franc-min";
import { FileContext } from "../App";
import Message from "./Message";
import "../styling/converter.css";

const LANG_MAP = {
  eng: "en-US",
  por: "pt-BR",
  spa: "es-ES",
};

function Converter() {
  const { file, setFile } = useContext(FileContext);
  const inputRef = useRef();
  const [audioUrl, setAudioUrl] = useState(null);
  const [audio, setAudio] = useState(null);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const getSpeechLang = (detectedLang) => LANG_MAP[detectedLang] || "en-US";

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setMessage("Please upload a PDF file");
      return;
    }
    setFile(selectedFile);
  };

  const createAudioUrl = (blob) => {
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    if (audio) audio.pause();
    setAudio(new Audio(url));
  };

  const fetchAudioFile = async (text, lang) => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:3000/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          lang: lang,
        }),
      });

      if (!res.ok) {
        throw new Error("Error during the HTTP request");
      }

      const blob = await res.blob();
      createAudioUrl(blob);
    } catch (error) {
      console.log("Failed to convert text to audio file: " + error);
      setMessage("Oops, something went wrong! Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const extractText = (file) => {
    pdfToText(file)
      .then((text) => {
        if (!text) {
          setMessage("No text found in the PDF");
          return;
        }
        console.log(text);
        const detectedLang = franc(text);
        fetchAudioFile(text, getSpeechLang(detectedLang));
      })
      .catch((error) => {
        console.log("Failed to extract text from PDF: " + error);
        setMessage("Error reading the PDF");
      });
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    handleFileSelection(files[0]);
  };

  const handleFileInputChange = (event) => {
    handleFileSelection(event.target.files[0]);
  };

  const handleBrowseFile = () => {
    inputRef.current.click();
  };

  return (
    <div className="converter">
      <div
        className="dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        aria-label="Dropzone for PDF upload"
      >
        <div>
          <img
            src={`src/assets/${file ? "valid-pdf.png" : "add-pdf.png"}`}
            alt={file ? "PDF uploaded" : "Upload PDF icon"}
            className="dropzone-icon"
          />
          <h2>{file ? `Ready: ${file.name}` : "Drop your PDF here"}</h2>
          <p>{file ? "Or choose another PDF" : "Or browse to upload"}</p>
          <input
            type="file"
            name="file"
            id="file"
            accept="application/pdf"
            hidden
            onChange={handleFileInputChange}
            ref={inputRef}
            aria-label="PDF file input"
          />
          {file ? (
            <>
              <button
                onClick={() => extractText(file)}
                disabled={isLoading}
                aria-busy={isLoading}
              >
                {isLoading ? "Converting..." : "Convert to Audio"}
              </button>
              {audioUrl && (
                <audio
                  controls
                  src={audioUrl}
                  aria-label="Audio playback"
                ></audio>
              )}
            </>
          ) : (
            <button onClick={handleBrowseFile}>Browse Files</button>
          )}
        </div>
      </div>
      <Message message={message} />
    </div>
  );
}

export default Converter;
