import { useState, useEffect } from "react";
import "./JarvisCircle.css";

export default function JarvisCircle() {
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeaking(prev => !prev);
    }, 800);

    return () => clearInterval(interval);
  }, []);
return (
  <div className="container">

    <div className="nebula"></div>
    <div className="stars"></div>

    <div className={`sphere ${speaking ? "active" : ""}`}>
      <div className="inner-galaxy"></div>
      <span className="jarvis-text">JARVIS</span>
    </div>

    <p className="response">Jarvis is ready...</p>

  </div>
);
}