import { useRef, useContext, useState } from "react";
import pdfToText from "react-pdftotext";
import { franc } from "franc-min";
import { FileContext } from "../App";
import Message from "./Message";
import addPdf from "../assets/add-pdf.png";
import validPdf from "../assets/valid-pdf.png";
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
  const [extractedText, setExtractedText] = useState(""); // New state for text
  const [showTextPanel, setShowTextPanel] = useState(false); // Toggle text panel

  const getSpeechLang = (detectedLang) => LANG_MAP[detectedLang] || "en-US";

  const handleFileSelection = (selectedFile) => {
    if (selectedFile.type !== "application/pdf") {
      setMessage("Please upload a PDF file");
      return;
    }
    setFile(selectedFile);
    setExtractedText(""); // Clear previous text
    setShowTextPanel(false); // Hide panel on new file
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
      const res = await fetch("https://pdf2audioapi.onrender.com/convert", {
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
          setExtractedText("");
          setShowTextPanel(false);
          return;
        }
        console.log(text);
        setExtractedText(text); // Store extracted text
        setShowTextPanel(true); // Show text panel
        const detectedLang = franc(text);
        fetchAudioFile(text, getSpeechLang(detectedLang));
      })
      .catch((error) => {
        console.log("Failed to extract text from PDF: " + error);
        setMessage("Error reading the PDF");
        setExtractedText("");
        setShowTextPanel(false);
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

  const toggleTextPanel = () => {
    setShowTextPanel(!showTextPanel);
  };

  return (
    <div className="converter-container">
      <div className="converter">
        <div
          className="dropzone"
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          aria-label="Dropzone for PDF upload"
        >
          <div>
            <img
              src={file ? validPdf : addPdf}
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
      {extractedText && (
        <div className={`text-panel ${showTextPanel ? "visible" : "hidden"}`}>
          <div className="text-panel-header">
            <h3>PDF Content</h3>
            <button
              onClick={toggleTextPanel}
              aria-label={showTextPanel ? "Hide text panel" : "Show text panel"}
            >
              {showTextPanel ? "Hide" : "Show"}
            </button>
          </div>
          <div
            className="text-content"
            role="region"
            aria-label="Extracted PDF text"
          >
            <p>{extractedText}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Converter;
