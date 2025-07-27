import React, { useState, useEffect, useRef } from "react";
import clickSound from "../assets/click.mp3"; // adjust path if needed

const BeginnerMode = () => {
  const [input, setInput] = useState("");
  const [chords, setChords] = useState([]);
  const [currentChord, setCurrentChord] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(1000); // milliseconds

  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(clickSound);
  }, []);

  useEffect(() => {
    if (!isRunning || chords.length === 0) return;

    const interval = setInterval(() => {
      const rand = chords[Math.floor(Math.random() * chords.length)];
      setCurrentChord(rand);

      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => {
          console.warn("Sound playback failed:", e);
        });
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, chords, speed]);

  const handleStart = () => {
    const cleaned = input
      .split(",")
      .map((chord) => chord.trim().toUpperCase())
      .filter((c) => c.length > 0);
    if (cleaned.length === 0) return alert("Please enter at least one chord.");
    setChords(cleaned);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentChord("");
  };

  return (
    <div className="text-white max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-yellow-400 mb-4">Beginner Practice Mode</h2>

      <label className="block mb-2 text-sm">Enter chords! (comma-separated):</label>
      <input
        type="text"
        className="w-full p-1 mb-3 rounded text-black"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="E, A, D, G, C"
      />

      <div className="flex items-center justify-between mb-4">
        <button
          onClick={handleStart}
          className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-black"
        >
          Start
        </button>
        <button
          onClick={handleStop}
          className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded text-black"
        >
          Stop
        </button>
      </div>

      <label className="block mb-1 text-sm">Speed (ms):</label>
      <input
        type="range"
        min="300"
        max="3000"
        step="100"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full mb-6"
      />
      <p className="text-sm mb-4">Interval: {speed}ms</p>

      {isRunning && currentChord && (
        <div className="text-5xl font-extrabold text-center text-pink-400 animate-pulse mt-6">
          {currentChord}
        </div>
      )}
    </div>
  );
};

export default BeginnerMode;
