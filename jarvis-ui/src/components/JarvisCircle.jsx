import { useState, useEffect, useRef } from "react";
import "./JarvisCircle.css";

export default function JarvisCircle() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [response, setResponse] = useState("Jarvis is ready...");
  const [userQuery, setUserQuery] = useState("");

  const leftWaveRef = useRef(null);
  const rightWaveRef = useRef(null);

  useEffect(() => {
    // Connect to the local Python SSE server
    const eventSource = new EventSource("http://localhost:8000/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state === "listening") {
          setListening(true);
          setSpeaking(false);
          setProcessing(false);
          setResponse("Listening...");
          setUserQuery("");
        } else if (data.state === "processing") {
          setListening(false);
          setSpeaking(false);
          setProcessing(true);
          setUserQuery(data.query);
          setResponse("Thinking...");
        } else if (data.state === "speaking") {
          setListening(false);
          setSpeaking(true);
          setProcessing(false);
          setResponse(data.response);
        } else if (data.state === "idle") {
          setListening(false);
          setSpeaking(false);
          setProcessing(false);
          setUserQuery("");
          setResponse("Jarvis is ready...");
        } else if (data.state === "exit") {
          setListening(false);
          setSpeaking(false);
          setProcessing(false);
          setUserQuery("");
          setResponse("Jarvis signing off. Love you 3000.");
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      setListening(false);
      setSpeaking(false);
      setProcessing(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  // Animation loop for horizontal waveform
  useEffect(() => {
    let animationId;
    let phase = 0;

    const updateWaves = () => {
      phase += 0.12;

      // Determine wave parameters based on current state
      let maxAmp = 0;
      let freq = 0.05;
      
      if (speaking) {
        maxAmp = 25 + Math.sin(phase * 2) * 10;
        freq = 0.08;
      } else if (listening) {
        maxAmp = 8 + Math.sin(phase) * 3;
        freq = 0.04;
      } else if (processing) {
        maxAmp = 3;
        freq = 0.12;
      } else {
        // Idle: very tiny ambient vibration
        maxAmp = 1.5;
        freq = 0.03;
      }

      // Generate paths for left and right wave
      // Left wave spans x=50 to x=320, right wave spans x=480 to x=750
      // Baseline y=400
      const generateWavePath = (startX, endX) => {
        const width = endX - startX;
        let points = [];
        const segments = 45;
        
        for (let i = 0; i <= segments; i++) {
          const x = startX + (i / segments) * width;
          
          // Envelope: fades out at the edges (near startX and endX)
          const envelope = Math.sin((i / segments) * Math.PI);
          
          // Generate displacement using sine waves and noise
          const noise = Math.sin(x * freq + phase) * Math.cos(x * 0.02 - phase * 0.5);
          const dy = envelope * maxAmp * noise;
          const y = 400 + dy;
          
          points.push(`${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`);
        }
        return points.join(" ");
      };

      if (leftWaveRef.current) {
        leftWaveRef.current.setAttribute("d", generateWavePath(50, 320));
      }
      if (rightWaveRef.current) {
        rightWaveRef.current.setAttribute("d", generateWavePath(480, 750));
      }

      animationId = requestAnimationFrame(updateWaves);
    };

    updateWaves();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [speaking, listening, processing]);

  return (
    <div className="container">
      <div className="nebula"></div>
      <div className="stars"></div>

      <div className="circle-wrapper">
        <svg
          viewBox="0 0 800 800"
          className={`arc-reactor-svg ${speaking ? "speaking" : ""} ${listening ? "listening" : ""} ${processing ? "processing" : ""}`}
        >
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-strong" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur1" />
              <feGaussianBlur stdDeviation="5" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glow-subtle" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <pattern id="honeycomb" width="16" height="27.71" patternUnits="userSpaceOnUse" patternTransform="scale(1.2)">
              <path d="M8 0 L16 4.62 L16 13.86 L8 18.48 L0 13.86 L0 4.62 Z" fill="none" stroke="rgba(255, 80, 0, 0.45)" stroke-width="0.8" />
              <path d="M0 27.71 L8 23.09 L16 27.71" fill="none" stroke="rgba(255, 80, 0, 0.45)" stroke-width="0.8" />
            </pattern>

            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ffffff" />
              <stop offset="25%" stop-color="#ffea00" />
              <stop offset="65%" stop-color="#ff5100" stop-opacity="0.95" />
              <stop offset="100%" stop-color="#7a0000" stop-opacity="0.2" />
            </radialGradient>

            <radialGradient id="reactorBgGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#ff3300" stop-opacity="0.22" />
              <stop offset="50%" stop-color="#ff2200" stop-opacity="0.06" />
              <stop offset="100%" stop-color="#000000" stop-opacity="0" />
            </radialGradient>

            <linearGradient id="horizontalGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ff2200" stop-opacity="0.8" />
              <stop offset="25%" stop-color="#ff5500" stop-opacity="0.5" />
              <stop offset="42%" stop-color="#ff3300" stop-opacity="0.05" />
              <stop offset="50%" stop-color="#ff2200" stop-opacity="0" />
              <stop offset="58%" stop-color="#ff3300" stop-opacity="0.05" />
              <stop offset="75%" stop-color="#ff5500" stop-opacity="0.5" />
              <stop offset="100%" stop-color="#ff2200" stop-opacity="0.8" />
            </linearGradient>

            <linearGradient id="bracketGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#ff1a00" />
              <stop offset="50%" stop-color="#ffaa00" />
              <stop offset="100%" stop-color="#ff1a00" />
            </linearGradient>
          </defs>

          {/* Background glow behind reactor */}
          <circle cx="400" cy="400" r="300" fill="url(#reactorBgGlow)" pointer-events="none" />

          {/* Left & Right Concentric Ripples */}
          <g className="audio-ripples" filter="url(#glow)">
            <circle cx="400" cy="400" r="230" fill="none" stroke="url(#horizontalGlow)" stroke-width="1" />
            <circle cx="400" cy="400" r="260" fill="none" stroke="url(#horizontalGlow)" stroke-width="1.5" />
            <circle cx="400" cy="400" r="290" fill="none" stroke="url(#horizontalGlow)" stroke-width="2" />
            <circle cx="400" cy="400" r="320" fill="none" stroke="url(#horizontalGlow)" stroke-width="1.5" />
            <circle cx="400" cy="400" r="350" fill="none" stroke="url(#horizontalGlow)" stroke-width="1" />
          </g>

          {/* Horizontal Center Axis Grid Lines */}
          <g className="grid-lines" opacity="0.4">
            <line x1="50" y1="400" x2="750" y2="400" stroke="#ff3c00" stroke-width="0.5" stroke-dasharray="2 15" />
          </g>

          {/* Dynamic Audio Visualizer Waves (Horizontal) */}
          <path ref={leftWaveRef} fill="none" stroke="#ff3c00" stroke-width="2.5" filter="url(#glow)" />
          <path ref={rightWaveRef} fill="none" stroke="#ff3c00" stroke-width="2.5" filter="url(#glow)" />

          {/* Main HUD Circles */}
          <g className="hud-rings">
            {/* Outermost dotted scale */}
            <circle cx="400" cy="400" r="210" fill="none" stroke="#ff1a00" stroke-width="1" stroke-dasharray="2 8" opacity="0.3" />
            
            {/* Thin outer boundary */}
            <circle cx="400" cy="400" r="200" fill="none" stroke="#ff3c00" stroke-width="1" opacity="0.5" />

            {/* Rotating Outer Ring with 4 gaps / Ticks */}
            <g className="outer-hud-ring-group">
              <circle cx="400" cy="400" r="185" fill="none" stroke="#ff5500" stroke-width="3" stroke-dasharray="230 60" filter="url(#glow-subtle)" />
              {/* Outer ticks */}
              <circle cx="400" cy="400" r="176" fill="none" stroke="#ff1a00" stroke-width="4" stroke-dasharray="1 6" opacity="0.6" />
            </g>

            {/* Counter-rotating Middle Ring */}
            <g className="middle-hud-ring-group">
              <circle cx="400" cy="400" r="160" fill="none" stroke="#ff7700" stroke-width="1.5" stroke-dasharray="120 40" />
              <circle cx="400" cy="400" r="152" fill="none" stroke="#ff1a00" stroke-width="3" stroke-dasharray="2 12" opacity="0.7" />
            </g>

            {/* Outer Heavy Segmented Wedges/Shields (The chunky arc reactor outer shells) */}
            <g className="reactor-shields-group" filter="url(#glow-subtle)">
              <circle cx="400" cy="400" r="135" fill="none" stroke="url(#bracketGlow)" stroke-width="12" stroke-dasharray="165 47" />
              {/* Accent thin overlays */}
              <circle cx="400" cy="400" r="143" fill="none" stroke="#ffaa00" stroke-width="1.5" stroke-dasharray="165 47" />
              <circle cx="400" cy="400" r="127" fill="none" stroke="#ff3300" stroke-width="1" stroke-dasharray="165 47" />
            </g>

            {/* Inner Rotating Ring */}
            <g className="inner-hud-ring-group">
              <circle cx="400" cy="400" r="114" fill="none" stroke="#ff1a00" stroke-width="1" stroke-dasharray="10 30" />
              <circle cx="400" cy="400" r="106" fill="none" stroke="#ffaa00" stroke-width="5" stroke-dasharray="1 8" opacity="0.8" />
            </g>

            {/* Stationary Ticks framing the core */}
            <g className="core-frame-ticks" opacity="0.8">
              <circle cx="400" cy="400" r="88" fill="none" stroke="#ff3c00" stroke-width="1.5" />
              <circle cx="400" cy="400" r="82" fill="none" stroke="#ff5500" stroke-width="3" stroke-dasharray="4 12" />
              <circle cx="400" cy="400" r="76" fill="none" stroke="#ffaa00" stroke-width="1" stroke-dasharray="2 4" />
            </g>
          </g>

          {/* Glowing Center Core */}
          <g className="reactor-core-group">
            {/* Glow base */}
            <circle cx="400" cy="400" r="62" fill="url(#coreGlow)" filter="url(#glow-strong)" />
            {/* Honeycomb grid overlay */}
            <circle cx="400" cy="400" r="62" fill="url(#honeycomb)" />
            {/* Core border highlight */}
            <circle cx="400" cy="400" r="62" fill="none" stroke="#ffea00" stroke-width="2" filter="url(#glow)" opacity="0.9" />
            {/* Core center hot spot */}
            <circle cx="400" cy="400" r="15" fill="#ffffff" filter="url(#glow)" />
          </g>

          {/* Footer HUD (J.A.R.V.I.S. text & bracket details) */}
          <g className="footer-hud">
            <path d="M 280 620 L 265 620 L 265 655 L 280 655" fill="none" stroke="#ff3c00" stroke-width="2" opacity="0.8" filter="url(#glow-subtle)" />
            <path d="M 520 620 L 535 620 L 535 655 L 520 655" fill="none" stroke="#ff3c00" stroke-width="2" opacity="0.8" filter="url(#glow-subtle)" />
            <text x="400" y="646" text-anchor="middle" className="jarvis-title-text" filter="url(#glow-subtle)">
              J.A.R.V.I.S.
            </text>
            <g opacity="0.8" filter="url(#glow-subtle)">
              <line x1="290" y1="664" x2="510" y2="664" stroke="#ff3c00" stroke-width="1.5" />
              <polygon points="400,672 395,664 405,664" fill="#ff3c00" />
              <circle cx="290" cy="664" r="3" fill="#ff3c00" />
              <circle cx="510" cy="664" r="3" fill="#ff3c00" />
              <line x1="345" y1="664" x2="345" y2="669" stroke="#ff3c00" stroke-width="1.5" />
              <line x1="455" y1="664" x2="455" y2="669" stroke="#ff3c00" stroke-width="1.5" />
            </g>
          </g>
        </svg>
      </div>

      {userQuery && <p className="user-query">You: "{userQuery}"</p>}
      <p className="response">{response}</p>
    </div>
  );
}