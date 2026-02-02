import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameBoard } from './components/GameBoard';
import { Lobby } from './components/Lobby';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Routes>
          <Route path="/" element={<Lobby />} />
          <Route path="/game" element={<GameBoard />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
