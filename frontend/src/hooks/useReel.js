import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { ReelEngine } from "@/reel/engine";

// Keep the reel functional when the hosting project has no backend env yet.
// A configured API origin still wins; otherwise Vercel's same-origin functions
// under /api handle narration and proxy the generated voice files.
const BACKEND = (process.env.REACT_APP_BACKEND_URL || "").replace(/\/$/, "");
const API = `${BACKEND}/api`;

export function useReel() {
  const [version, setVersionState] = useState("v3");
  const langRef = useRef("en");
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lang, setLangState] = useState("en");
  const [lines, setLines] = useState([]);
  const [voLoading, setVoLoading] = useState(false);
  const [recording, setRecording] = useState(null);
  const [download, setDownload] = useState(null);
  const [mode, setModeState] = useState("reel");
  const [hover, setHover] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filter, setFilterState] = useState("ALL");

  const loadVO = useCallback(async (l) => {
    const eng = engineRef.current;
    if (!eng) return;
    setVoLoading(true);
    try {
      if (l === "off") {
        await eng.setNarration(null);
        const { data } = await axios.get(`${API}/reel/narration`, { params: { lang: "en", version } });
        setLines(data.lines);
      } else {
        const { data } = await axios.get(`${API}/reel/narration`, { params: { lang: l, version } });
        setLines(data.lines);
        await eng.setNarration(data.lines, BACKEND);
      }
      if (eng.playing) eng.seek(eng.t);
    } catch (e) {
      await eng.setNarration(null);
      setError("Narração indisponível nesta reprodução. A instrumental continua; experimente Sem voz.");
    } finally {
      setVoLoading(false);
    }
  }, [version]);

  useEffect(() => {
    const eng = new ReelEngine(canvasRef.current, version);
    engineRef.current = eng;
    window.__reel = eng;
    eng.onTime = (t) => setTime(t);
    eng.onEnd = () => setPlaying(false);
    let alive = true;
    eng.load((p) => alive && setProgress(p))
      .then(() => alive && loadVO(langRef.current))
      .then(() => { if (!alive || !eng.explore) return; eng.explore.onHover = (it) => setHover(it); setReady(true); })
      .catch(() => alive && setError("Falha ao carregar os assets do showreel."));
    return () => { alive = false; eng.dispose(); };
  }, [loadVO, version]);

  const toggle = useCallback(async () => {
    const eng = engineRef.current;
    if (!eng || !ready || recording !== null) return;
    if (eng.playing) { eng.pause(); setPlaying(false); }
    else { setModeState("reel"); setSelected(null); await eng.play(); setPlaying(true); }
  }, [ready, recording]);

  const seek = useCallback((t) => {
    const eng = engineRef.current;
    if (recording !== null || !eng) return;
    if (eng.mode !== "reel") { eng.setMode("reel"); setModeState("reel"); setSelected(null); }
    eng.seek(t);
  }, [recording]);
  const restart = useCallback(async () => {
    const eng = engineRef.current;
    if (!eng || recording !== null) return;
    setModeState("reel");
    eng.seek(0);
    if (!eng.playing) { await eng.play(); setPlaying(true); }
  }, [recording]);

  const setLang = useCallback(async (l) => { langRef.current = l; setLangState(l); await loadVO(l); }, [loadVO]);

  const exportVideo = useCallback(async () => {
    const eng = engineRef.current;
    if (!eng || recording !== null) return;
    setDownload(null);
    setModeState("reel");
    setRecording(0);
    setPlaying(true);
    try {
      const { blob, ext } = await eng.record((p) => setRecording(p));
      const url = URL.createObjectURL(blob);
      const name = `edmundo-kutuzov-${version}-16x9.${ext}`;
      setDownload({ url, name, size: blob.size });
      const a = document.createElement("a");
      a.href = url;
      a.download = name;
      a.click();
    } catch (e) {
      setError(e.message || "A exportação falhou.");
    } finally {
      setRecording(null);
      setPlaying(false);
    }
  }, [recording, version]);

  const setMode = useCallback((m) => {
    const eng = engineRef.current;
    if (!eng || recording !== null) return;
    eng.setMode(m);
    setPlaying(false);
    setSelected(null);
    setHover(null);
    setModeState(m);
  }, [recording]);

  const setFilter = useCallback((f) => {
    const eng = engineRef.current;
    if (eng && eng.explore) eng.explore.filter = f;
    setFilterState(f);
  }, []);

  const pointer = useCallback((type, nx, ny, extra) => {
    const eng = engineRef.current;
    if (!eng || !eng.explore) return;
    if (eng.mode === "explore") {
      const ex = eng.explore;
      if (type === "move") { ex.pointer(nx, ny); ex.move(nx, ny); }
      if (type === "down") ex.down(nx, ny);
      if (type === "up") { const it = ex.up(); if (it) setSelected(it); }
      if (type === "leave") { ex.pointer(9, 9); ex.up(); }
      if (type === "wheel") ex.wheel(extra);
    } else if (type === "move") eng.setParallax(nx * 2 - 1, -(ny * 2 - 1));
    else if (type === "leave") eng.setParallax(0, 0);
  }, []);

  const setVersion = useCallback((v) => {
    if (!["v1","v2","v3"].includes(v) || v === version || recording !== null) return;
    setReady(false); setPlaying(false); setError(""); setProgress(0); setDownload(null);
    setTime(0); setModeState("reel"); setSelected(null); setVersionState(v);
  }, [version, recording]);

  return { version, setVersion, duration: version === "v1" ? 52 : 60, mode, setMode, hover, selected, setSelected, filter, setFilter, pointer, canvasRef, progress, ready, error, setError, time, playing, toggle, seek, restart, lang, setLang, lines, voLoading, recording, exportVideo, download };
}

