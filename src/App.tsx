import { GameBoard } from './components/GameBoard/GameBoard';
import { WorldSelectScreen } from './components/WorldSelect/WorldSelectScreen';
import { useGameStore } from './store/gameStore';
import './index.css';

function App() {
  const gameStarted = useGameStore((s) => s.gameStarted);
  return gameStarted ? <GameBoard /> : <WorldSelectScreen />;
}

export default App;
