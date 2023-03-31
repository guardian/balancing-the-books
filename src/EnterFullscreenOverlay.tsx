import React from "react";

interface EnterFullscreenOverlayProps {
  onClick: () => void;
}
export const EnterFullscreenOverlay = ({onClick}:EnterFullscreenOverlayProps) => <div
  onClick={onClick}
  className="fullscreen-overlay"
  style={{
    position: "absolute",
    display: "flex",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    background: "rgba(0, 0, 0, 0.5)",
    cursor: "pointer",
    zIndex: 9999,
    alignItems: "center",
    justifyContent: "space-around",
    color: "white",
  }}
>
  <h1>Enter fullscreen to interact...</h1>
</div>;
