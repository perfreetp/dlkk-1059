import { useGameStore } from '../../store/gameStore';
import { Clock, DollarSign, Zap, Heart, Pause, Play, FastForward, SkipForward } from 'lucide-react';

const StatusBar = () => {
  const {
    remainingTime,
    currentEarnings,
    tips,
    stamina,
    vehicle,
    player,
    isPaused,
    speedMultiplier,
    pauseGame,
    resumeGame,
    setSpeedMultiplier,
    endGame,
  } = useGameStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.floor(Math.abs(seconds) % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const timeColor = remainingTime > 60 
    ? 'text-neon-green' 
    : remainingTime > 30 
      ? 'text-yellow-400' 
      : 'text-red-400';

  const timeUrgent = remainingTime < 30 ? 'animate-pulse' : '';

  const staminaColor = stamina > 60 
    ? 'bg-green-500' 
    : stamina > 30 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  const batteryColor = vehicle.battery > 60 
    ? 'bg-green-500' 
    : vehicle.battery > 30 
      ? 'bg-yellow-500' 
      : 'bg-red-500';

  return (
    <div className="glass-panel px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className={`flex items-center gap-2 ${timeColor} ${timeUrgent}`}>
          <Clock className="w-5 h-5" />
          <span className="font-mono text-lg font-bold">{formatTime(remainingTime)}</span>
        </div>

        <div className="flex items-center gap-2 text-neon-yellow">
          <DollarSign className="w-5 h-5" />
          <span className="font-bold text-lg">¥{currentEarnings + tips}</span>
          {tips > 0 && (
            <span className="text-xs text-neon-green">(+{tips})</span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 w-32">
          <Heart className="w-4 h-4 text-red-400" />
          <div className="flex-1 h-2 bg-night-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${staminaColor} rounded-full transition-all`}
              style={{ width: `${stamina}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{Math.round(stamina)}</span>
        </div>

        <div className="flex items-center gap-2 w-32">
          <Zap className="w-4 h-4 text-neon-green" />
          <div className="flex-1 h-2 bg-night-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${batteryColor} rounded-full transition-all`}
              style={{ width: `${vehicle.battery}%` }}
            />
          </div>
          <span className="text-xs text-gray-400 w-8">{Math.round(vehicle.battery)}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSpeedMultiplier(1)}
          className={`p-1.5 rounded transition-all ${
            speedMultiplier === 1 
              ? 'bg-neon-blue/20 text-neon-blue' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title="1倍速"
        >
          <Play className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSpeedMultiplier(2)}
          className={`p-1.5 rounded transition-all ${
            speedMultiplier === 2 
              ? 'bg-neon-yellow/20 text-neon-yellow' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title="2倍速"
        >
          <FastForward className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSpeedMultiplier(3)}
          className={`p-1.5 rounded transition-all ${
            speedMultiplier === 3 
              ? 'bg-neon-pink/20 text-neon-pink' 
              : 'text-gray-500 hover:text-gray-300'
          }`}
          title="3倍速"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-night-600 mx-1"></div>

        <button
          onClick={isPaused ? resumeGame : pauseGame}
          className="p-1.5 rounded text-gray-400 hover:text-white transition-all"
          title={isPaused ? '继续' : '暂停'}
        >
          {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
        </button>

        <button
          onClick={endGame}
          className="px-3 py-1 rounded text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
        >
          结束
        </button>
      </div>
    </div>
  );
};

export default StatusBar;
