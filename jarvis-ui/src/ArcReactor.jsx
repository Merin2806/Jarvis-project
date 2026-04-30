import { motion } from "framer-motion";

export default function ArcReactor() {

  return (
    <div style={container}>

      {/* outer rotating ring */}

      <motion.div
        style={outerRing}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
      />

      {/* inner rotating ring */}

      <motion.div
        style={innerRing}
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
      />

      {/* core container */}

      <div style={coreContainer}>

        {/* pulsing energy core */}

        <motion.div
          style={core}
          animate={{
            scale: [1, 1.15, 1],
            boxShadow: [
              "0 0 40px #6cf0ff",
              "0 0 80px #6cf0ff",
              "0 0 40px #6cf0ff"
            ]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* static text */}

        <h1 style={text}>JARVIS</h1>

      </div>

    </div>
  );
}

const container = {
  width: "100vw",
  height: "100vh",
  background: "black",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  position: "relative"
};

const outerRing = {
  position: "absolute",
  width: "320px",
  height: "320px",
  borderRadius: "50%",
  border: "4px solid #6cf0ff",
  boxShadow: "0 0 40px #6cf0ff"
};

const innerRing = {
  position: "absolute",
  width: "220px",
  height: "220px",
  borderRadius: "50%",
  border: "3px dashed #7df9ff",
  boxShadow: "0 0 20px #7df9ff"
};

const coreContainer = {
  position: "relative",
  width: "120px",
  height: "120px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const core = {
  width: "120px",
  height: "120px",
  borderRadius: "50%",
  background: "radial-gradient(#7df9ff,#007a8c)"
};

const text = {
  position: "absolute",
  color: "white",
  letterSpacing: "4px",
  fontSize: "18px"
};