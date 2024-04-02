// src/components/ARScene.js
import React, { useEffect } from 'react';

const ARScene = () => {
  useEffect(() => {
    // Ensure A-Frame and AR.js are loaded
    if (window.AFRAME && window.AFRAME.components['arjs']) {
      console.log('A-Frame and AR.js are ready to use');
    } else {
      console.error('A-Frame or AR.js not detected');
    }
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw' }}>
      <a-scene embedded arjs="sourceType: webcam;">
        <a-marker preset="hiro">
          <a-box position="0 0.5 0" material="color: yellow;"></a-box>
        </a-marker>
        <a-entity camera></a-entity>
      </a-scene>
    </div>
  );
};

export default ARScene;
