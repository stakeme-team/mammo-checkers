import React from "react";
import { ControllerConnector } from "@cartridge/connector";

type PlayProps = {
  controller: ControllerConnector;
  setIsPlaying: (playing: boolean) => void;
};

export const Play = ({ controller, setIsPlaying }: PlayProps) => {
  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div>
      <button onClick={handlePlay}>
        Играть
      </button>
    </div>
  );
}; 