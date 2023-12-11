import React from "react";
import TypingCard from "@/components/TypingCard";
import "./style.css";
import BackgroundImage from "@/assets/images/Peternakan-Sapi.jpg";

function Background() {
  

  return (
    <div>
      <div
        className="bg"
        style={{
          backgroundColor: "#ffffff",
          height: "100vh",
          backgroundSize: "cover",
          backgroundPosition: "center",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></div>
    </div>
  );
}

export default Background;