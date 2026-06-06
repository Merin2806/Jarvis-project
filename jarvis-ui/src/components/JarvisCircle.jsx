import { useState, useEffect } from "react";
import "./JarvisCircle.css";

export default function JarvisCircle() {
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [response, setResponse] = useState("Jarvis is ready...");
  const [userQuery, setUserQuery] = useState("");

  useEffect(() => {
    // Connect to the local Python SSE server
    const eventSource = new EventSource("http://localhost:8000/events");

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.state === "listening") {
          setListening(true);
          setSpeaking(false);
          setResponse("Listening...");
          setUserQuery("");
        } else if (data.state === "processing") {
          setListening(false);
          setSpeaking(false);
          setUserQuery(data.query);
          setResponse("Thinking...");
        } else if (data.state === "speaking") {
          setListening(false);
          setSpeaking(true);
          setResponse(data.response);
        } else if (data.state === "idle") {
          setListening(false);
          setSpeaking(false);
          setUserQuery("");
          setResponse("Jarvis is ready...");
        } else if (data.state === "exit") {
          setListening(false);
          setSpeaking(false);
          setUserQuery("");
          setResponse("Jarvis signing off. Love you 3000.");
        }
      } catch (err) {
        console.error("Error parsing SSE event:", err);
      }
    };

    eventSource.onerror = () => {
      // Graceful fallback: reset to idle if server is down
      setListening(false);
      setSpeaking(false);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="container">
      <div className="nebula"></div>
      <div className="stars"></div>

      <div className="circle-wrapper">
        <div className={`sphere ${speaking ? "active" : ""} ${listening ? "listening" : ""}`}>
          <div className="outer-hud-ring"></div>
          <div className="inner-hud-ring"></div>
          <div className="core-glow"></div>
        </div>
        <span className="jarvis-text">JARVIS</span>
      </div>

      {userQuery && <p className="user-query">You: "{userQuery}"</p>}
      <p className="response">{response}</p>
    </div>
  );
}