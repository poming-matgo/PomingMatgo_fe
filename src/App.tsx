import { useState } from 'react';
import { GameBoard } from './components/GameBoard';
import { Lobby } from './components/Lobby';

type Screen = 'lobby' | 'game';

interface GameState {
  userId: string;
  roomId: string;
  initialHasOpponent: boolean;
}

function App() {
  const [screen, setScreen] = useState<Screen>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);

  const handleEnterGame = (userId: string, roomId: string, initialHasOpponent: boolean) => {
    setGameState({ userId, roomId, initialHasOpponent });
    setScreen('game');
  };

  const handleBackToLobby = () => {
    setGameState(null);
    setScreen('lobby');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      {screen === 'lobby' && (
        <Lobby onEnterGame={handleEnterGame} />
      )}
      {screen === 'game' && gameState && (
        <GameBoard
          userId={gameState.userId}
          roomId={gameState.roomId}
          initialHasOpponent={gameState.initialHasOpponent}
          onBackToLobby={handleBackToLobby}
        />
      )}
    </div>
  );
}

export default App;
