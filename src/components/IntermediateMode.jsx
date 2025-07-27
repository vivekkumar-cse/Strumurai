import React, { useState, useEffect, useRef } from "react";
import clickSound from "../assets/click.mp3"; // ✅ Make sure this path is correct

const difficultyLevels = {
  easy: ["E", "A", "D", "G", "C"],
  medium: ["Am", "Em", "Dm", "Cmaj7", "G7", "Bm"],
  hard: ["F#m", "Bb", "Ebmaj7", "C#dim", "G#m7", "B7"],
};

const difficultySpeeds = {
  easy: 2000,
  medium: 1200,
  hard: 700,
};

const IntermediateMode = () => {
  const [difficulty, setDifficulty] = useState("easy");
  const [currentChord, setCurrentChord] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [speed, setSpeed] = useState(difficultySpeeds["easy"]);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(clickSound);
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      const chords = difficultyLevels[difficulty];
      const rand = chords[Math.floor(Math.random() * chords.length)];
      setCurrentChord(rand);

      // Play sound
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => console.warn("Audio error:", e));
      }
    }, speed);

    return () => clearInterval(interval);
  }, [isRunning, difficulty, speed]);

  const handleStart = () => {
    setSpeed(difficultySpeeds[difficulty]);
    setIsRunning(true);
  };

  const handleStop = () => {
    setIsRunning(false);
    setCurrentChord("");
  };

  return (
    <div className="text-white max-w-2xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-blue-300 mb-4">Intermediate Practice Mode</h2>

      <label className="block mb-2 text-sm">Select Difficulty:</label>
      <select
        className="w-full p-2 mb-4 text-black rounded"
        value={difficulty}
        onChange={(e) => {
          setDifficulty(e.target.value);
          setSpeed(difficultySpeeds[e.target.value]);
        }}
        disabled={isRunning}
      >
        <option value="easy">Easy</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

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

      <label className="block mb-1 text-sm">Adjust Speed (ms):</label>
      <input
        type="range"
        min="300"
        max="3000"
        step="100"
        value={speed}
        onChange={(e) => setSpeed(Number(e.target.value))}
        className="w-full mb-4"
      />
      <p className="text-sm mb-6">Interval: {speed}ms</p>

      {isRunning && currentChord && (
        <div className="text-6xl font-extrabold text-center text-pink-400 animate-pulse mt-6">
          {currentChord}
        </div>
      )}
    </div>
  );
};

export default IntermediateMode;
