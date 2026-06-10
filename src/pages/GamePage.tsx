import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { useGameLoop } from '../hooks/useGameLoop';
import StatusBar from '../components/game/StatusBar';
import SidebarNav from '../components/game/SidebarNav';
import MapPanel from '../components/game/MapPanel';
import OrdersPanel from '../components/game/OrdersPanel';
import BackpackPanel from '../components/game/BackpackPanel';
import VehiclePanel from '../components/game/VehiclePanel';
import MessagesPanel from '../components/game/MessagesPanel';
import SettlementPanel from '../components/game/SettlementPanel';
import LeaderboardPanel from '../components/game/LeaderboardPanel';
import RainEffect from '../components/game/RainEffect';

const GamePage = () => {
  const { chapterId } = useParams<{ chapterId: string }>();
  const navigate = useNavigate();
  const { startGame, isPlaying, isSettled, currentPanel, weather, loadPlayer } = useGameStore();
  
  useGameLoop();

  useEffect(() => {
    loadPlayer();
    if (chapterId) {
      startGame(chapterId);
    }
  }, [chapterId, startGame, loadPlayer]);

  useEffect(() => {
    if (isSettled) {
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSettled, navigate]);

  if (!isPlaying && !isSettled) {
    return (
      <div className="h-screen flex items-center justify-center bg-night-900">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏍️</div>
          <p className="text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  const renderPanel = () => {
    switch (currentPanel) {
      case 'map':
        return <MapPanel />;
      case 'orders':
        return <OrdersPanel />;
      case 'backpack':
        return <BackpackPanel />;
      case 'vehicle':
        return <VehiclePanel />;
      case 'messages':
        return <MessagesPanel />;
      case 'settlement':
        return <SettlementPanel />;
      case 'leaderboard':
        return <LeaderboardPanel />;
      default:
        return <MapPanel />;
    }
  };

  const showRain = weather === 'light_rain' || weather === 'heavy_rain' || weather === 'storm';
  const rainIntensity = weather === 'storm' ? 'heavy' : weather === 'heavy_rain' ? 'medium' : 'light';

  return (
    <div className="h-screen flex flex-col bg-night-900 overflow-hidden relative">
      {showRain && <RainEffect intensity={rainIntensity} />}
      
      <div className="p-3">
        <StatusBar />
      </div>

      <div className="flex-1 flex gap-3 px-3 pb-3 overflow-hidden">
        <SidebarNav />

        <div className="flex-1 overflow-hidden">
          {renderPanel()}
        </div>

        <div className="w-80 flex-shrink-0 overflow-hidden">
          {currentPanel === 'map' ? <OrdersPanel /> : <MapPanel />}
        </div>
      </div>
    </div>
  );
};

export default GamePage;
