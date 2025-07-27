// App.jsx
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import * as Tone from "tone";
import clickSound from "./assets/click.mp3";
import "./App.css";
import useChordDetection from "./hooks/useChordDetection";
import HomePage from "./components/HomePage";
import Navbar from "./components/NavBar";
import About from "./components/About";
import BeginnerMode from "./components/BeginnerMode";
import IntermediateMode from "./components/IntermediateMode";
import AdvancedMode from "./components/AdvancedMode";

function App() {
  const [mode, setMode] = useState("custom");
  const [difficulty, setDifficulty] = useState("easy");
  const [currentChord, setCurrentChord] = useState("");
  const [chords, setChords] = useState([]);
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [error, setError] = useState("");
  const [intervalId, setIntervalId] = useState(null);
  const [isMicrophoneActive, setIsMicrophoneActive] = useState(false);

  const click = useRef(new Audio(clickSound));
  const { detectedChord, confidence } = useChordDetection(isMicrophoneActive);

  const showRandomChord = (list) => {
    const randomChord = list[Math.floor(Math.random() * list.length)];
    setCurrentChord(randomChord);
    try {
      click.current.currentTime = 0;
      click.current.play();
    } catch (err) {
      console.warn("🔇 Click sound blocked:", err.message);
    }
  };

  useEffect(() => {
    if (
      !currentChord ||
      !detectedChord ||
      waitingForNext ||
      !isMicrophoneActive
    )
      return;

    const normalize = (c) =>
      c
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
    const expected = normalize(currentChord);
    const detected = normalize(detectedChord);
    const conf = parseFloat(confidence);

    if (isNaN(conf) || conf < 50) return;

    if (expected === detected) {
      setWaitingForNext(true);
      try {
        click.current.currentTime = 0;
        click.current.play();
      } catch (err) {
        console.warn("🔇 Click blocked:", err.message);
      }
      setTimeout(() => {
        showRandomChord(chords);
        setWaitingForNext(false);
      }, 800);
    }
  }, [
    detectedChord,
    confidence,
    isMicrophoneActive,
    currentChord,
    chords,
    waitingForNext,
  ]);

  return (
    <Router>
      <Navbar />
      <div style={{ paddingTop: "80px" }}> 
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/beginner"
            element={
              <div className="max-w-4xl mx-auto p-4">
                <BeginnerMode
                  difficulty={difficulty}
                  setDifficulty={setDifficulty}
                />
              </div>
            }
          />
          <Route
            path="/intermediate"
            element={
              <div className="max-w-4xl mx-auto p-4">
                <IntermediateMode />
              </div>
            }
          />
          <Route
            path="/advanced"
            element={
              <div className="max-w-4xl mx-auto p-4">
                <AdvancedMode
                  detectedChord={detectedChord}
                  confidence={confidence}
                  click={click}
                />
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
