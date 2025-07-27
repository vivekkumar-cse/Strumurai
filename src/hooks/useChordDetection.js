import Meyda from 'meyda';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import * as Tone from 'tone';

const DEBUG = true;

const useChordDetection = (isListening) => {
  const [detectedChord, setDetectedChord] = useState('Listening...');
  const [confidence, setConfidence] = useState(null);

  const audioContextRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const mediaSourceRef = useRef(null);
  const meydaAnalyzerRef = useRef(null);
  const startedRef = useRef(false);
  const lastChordRef = useRef(null);

  const noteNameToIndex = useMemo(() => ({
    C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3,
    E: 4, F: 5, "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8,
    A: 9, "A#": 10, Bb: 10, B: 11, "Cb": 11, "B#": 0,
  }), []);

  const chords = useMemo(() => [
    { name: "C", notes: ["C", "E", "G"] },
    { name: "C#", notes: ["C#", "F", "G#"] },
    { name: "D", notes: ["D", "F#", "A"] },
    { name: "D#", notes: ["D#", "G", "A#"] },
    { name: "E", notes: ["E", "G#", "B"] },
    { name: "F", notes: ["F", "A", "C"] },
    { name: "F#", notes: ["F#", "A#", "C#"] },
    { name: "G", notes: ["G", "B", "D"] },
    { name: "G#", notes: ["G#", "C", "D#"] },
    { name: "A", notes: ["A", "C#", "E"] },
    { name: "A#", notes: ["A#", "D", "F"] },
    { name: "B", notes: ["B", "D#", "F#"] },
    { name: "Cm", notes: ["C", "Eb", "G"] },
    { name: "C#m", notes: ["C#", "E", "G#"] },
    { name: "Dm", notes: ["D", "F", "A"] },
    { name: "D#m", notes: ["D#", "F#", "A#"] },
    { name: "Em", notes: ["E", "G", "B"] },
    { name: "Fm", notes: ["F", "Ab", "C"] },
    { name: "F#m", notes: ["F#", "A", "C#"] },
    { name: "Gm", notes: ["G", "Bb", "D"] },
    { name: "G#m", notes: ["G#", "B", "D#"] },
    { name: "Am", notes: ["A", "C", "E"] },
    { name: "A#m", notes: ["A#", "C#", "F"] },
    { name: "Bm", notes: ["B", "D", "F#"] },
  ], []);

  const chordVectors = useMemo(() =>
    chords.map(chord => ({
      name: chord.name,
      chroma: chord.notes.reduce((vec, note) => {
        const idx = noteNameToIndex[note];
        if (idx !== undefined) vec[idx] = 1;
        return vec;
      }, new Array(12).fill(0)),
    })), [chords, noteNameToIndex]);

  const cosineSimilarity = useCallback((a, b) => {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < 12; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return magA && magB ? dot / (Math.sqrt(magA) * Math.sqrt(magB)) : 0;
  }, []);

  const recognizeChord = useCallback((liveChroma) => {
    const max = Math.max(...liveChroma);
    if (max === 0) return null;

    const normalized = liveChroma.map(v => v / max);
    let best = { name: null, similarity: 0 };

    for (const chord of chordVectors) {
      const sim = cosineSimilarity(normalized, chord.chroma);
      if (sim > best.similarity) best = { name: chord.name, similarity: sim };
    }

    const threshold = best.name?.endsWith("m") ? 0.68 : 0.72;
    const isValid = best.similarity >= threshold;

    setConfidence(parseFloat((best.similarity * 100).toFixed(1)));

    if (DEBUG) {
      console.log(`🎯 Match: ${best.name} (${(best.similarity * 100).toFixed(1)}%)`);
    }

    return isValid ? best.name.toUpperCase() : null;
  }, [chordVectors, cosineSimilarity]);

  const stopMicrophone = useCallback(() => {
    if (!startedRef.current) return;
    startedRef.current = false;

    meydaAnalyzerRef.current?.stop();
    meydaAnalyzerRef.current = null;

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }

    mediaSourceRef.current = null;

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    if (DEBUG) console.log("🛑 Microphone stopped");
  }, []);

  const startMicrophone = useCallback(async () => {
    if (startedRef.current) return;
    startedRef.current = true;

    try {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      await Tone.start();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaSourceRef.current = audioContextRef.current.createMediaStreamSource(stream);

      meydaAnalyzerRef.current = Meyda.createMeydaAnalyzer({
        audioContext: audioContextRef.current,
        source: mediaSourceRef.current,
        bufferSize: 2048,
        featureExtractors: ['chroma', 'loudness'],
        callback: (features) => {
          const { chroma, loudness } = features || {};
          const vol = loudness?.total ?? 0;

          if (Array.isArray(chroma) && chroma.length === 12 && vol > 0.01) {
            const chord = recognizeChord(chroma);
            if (chord && chord !== lastChordRef.current) {
              setDetectedChord(chord);
              lastChordRef.current = chord;
            }
          } else {
            setDetectedChord("Listening...");
            setConfidence(null);
          }
        },
      });

      meydaAnalyzerRef.current.start();
      if (DEBUG) console.log("🎙️ Microphone + Meyda started");
    } catch (err) {
      console.error("🚫 Mic error:", err);
      setDetectedChord("Mic Error");
      setConfidence(null);
      stopMicrophone();
    }
  }, [recognizeChord, stopMicrophone]);

  useEffect(() => {
    if (isListening) {
      startMicrophone();
    } else {
      stopMicrophone();
      setDetectedChord("Listening...");
      setConfidence(null);
    }

    return () => stopMicrophone();
  }, [isListening, startMicrophone, stopMicrophone]);

  return { detectedChord, confidence };
};

export default useChordDetection;






