import * as pdfjsLib from "pdfjs-dist";

// Set worker to a reliable, up-to-date CDN (version 4.0.379 as of April 2025)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.0.379/pdf.worker.min.js";

export const extractTextFromPDF = async (file) => {
  try {
    // Read the PDF file as an ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let text = "";
    // Loop through all pages
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      // Combine text items, adding a space between them
      text += content.items.map((item) => item.str).join(" ") + "\n";
    }
    
    if (!text.trim()) {
      throw new Error("No text could be extracted from the PDF");
    }
    
    return {
      text: text.trim(),
      pages: pdf.numPages,
    };
  } catch (error) {
    console.error("Error extracting PDF text:", error);
    throw new Error("Failed to extract text from PDF. Ensure the file is valid and contains text.");
  }
};