import React, { useState } from 'react';
import { motion } from 'framer-motion';

type GameMode = 'casual' | 'wallet';

export const GameModeSelector: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('casual');

  const handleModeChange = (mode: GameMode) => {
    setSelectedMode(mode);
    localStorage.setItem('gameMode', mode);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="game-mode-selector"
    >
      <button 
        onClick={() => handleModeChange('casual')}
        className={selectedMode === 'casual' ? 'active' : ''}
      >
        Casual Mode
      </button>
      <button 
        onClick={() => handleModeChange('wallet')}
        className={selectedMode === 'wallet' ? 'active' : ''}
      >
        Wallet Mode
      </button>
    </motion.div>
  );
};
