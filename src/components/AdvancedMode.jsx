// AdvancedMode.jsx
import React, { useState, useEffect, useRef } from "react";
import useChordDetection from "../hooks/useChordDetection";
import clickSound from "../assets/click.mp3";
import * as Tone from "tone";

const beginnerPresets = {
  easy: ["C", "G", "D", "Em", "Am"],
  medium: ["F", "A", "Dm", "Bm", "E"],
  hard: ["F#m", "B7", "Cm", "G#m", "D7"],
};

const AdvancedMode = () => {
  const [difficulty, setDifficulty] = useState("easy");
  const [started, setStarted] = useState(false);
  const [chords, setChords] = useState([]);
  const [currentChord, setCurrentChord] = useState("");
  const [waitingForNext, setWaitingForNext] = useState(false);
  const [error, setError] = useState("");

  const click = useRef(new Audio(clickSound));
  const { detectedChord, confidence } = useChordDetection(started); // Only activate detection when started

  const showRandomChord = (list) => {
    const randomChord = list[Math.floor(Math.random() * list.length)];
    setCurrentChord(randomChord);
    try {
      click.current.currentTime = 0;
      click.current.play();
    } catch (err) {
      console.warn("Click sound blocked:", err.message);
    }
  };

  const handleStart = async () => {
    try {
      await Tone.start();
      const chordList = beginnerPresets[difficulty] || [];
      if (chordList.length === 0) return setError("No chords for selected difficulty.");

      setChords(chordList);
      setError("");
      setStarted(true);
      showRandomChord(chordList);
    } catch (err) {
      setError("Audio error: " + err.message);
    }
  };

  const handleStop = () => {
    setStarted(false);
    setChords([]);
    setCurrentChord("");
    setWaitingForNext(false);
    setError("");
  };

  useEffect(() => {
    if (!started || !detectedChord || !currentChord || waitingForNext) return;

    const normalize = (c) => c.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
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
        console.warn("Sound blocked:", err.message);
      }

      setTimeout(() => {
        showRandomChord(chords);
        setWaitingForNext(false);
      }, 800);
    }
  }, [detectedChord, confidence, currentChord, waitingForNext, started, chords]);

  return (
    <div className="text-white text-center p-6">
      <h1 className="text-3xl font-bold mb-4">🎸 Advanced Mode</h1>

      {!started && (
        <div className="mb-4">
          <label className="block text-lg mb-2">Select Difficulty:</label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="text-black px-4 py-2 rounded"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      )}

      {!started ? (
        <button
          onClick={handleStart}
          className="mt-4 bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-800"
        >
          Start Practice
        </button>
      ) : (
        <>
          <div className="mt-6">
            <h2 className="text-2xl mb-2">Play this chord:</h2>
            <div className="text-4xl font-bold flash">{currentChord}</div>

            <p className="mt-4">
              Detected: <strong>{detectedChord || "..."}</strong>
            </p>
            <p>
              Confidence: <strong>{confidence?.toFixed(1) || 0}%</strong>
            </p>
          </div>

          <button
            onClick={handleStop}
            className="mt-6 bg-red-600 text-white px-6 py-2 rounded hover:bg-red-800"
          >
            Stop Practice
          </button>
        </>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
};

export default AdvancedMode;
