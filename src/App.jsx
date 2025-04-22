import { useState, createContext } from "react";
import "./App.css";
import Converter from "./components/Converter";

export const FileContext = createContext();

function App() {
  const [file, setFile] = useState(null);

  return (
    <FileContext.Provider value={{ file, setFile }}>
      <div className="app-container">
        <div className="title">
          <h1>PDF to Audio </h1>
        </div>
        <div className="wrapper">
          <Converter />
        </div>
        <div className="footer">Crafted by Biliqis Bukola</div>
      </div>
    </FileContext.Provider>
  );
}

export default App;
