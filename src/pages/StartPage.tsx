import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameStore } from '../store/gameStore';
import { CHAPTERS } from '../data/chapters';
import RainEffect from '../components/game/RainEffect';
import { Trophy, Star, Lock, Play, Zap, DollarSign, Target } from 'lucide-react';

const StartPage = () => {
  const navigate = useNavigate();
  const { player, loadPlayer } = useGameStore();

  useEffect(() => {
    loadPlayer();
  }, [loadPlayer]);

  const handleStartChapter = (chapterId: string) => {
    navigate(`/game/${chapterId}`);
  };

  const getDifficultyStars = (difficulty: number) => {
    return Array(5).fill(0).map((_, i) => (
      <Star
        key={i}
        className={`w-3 h-3 ${i < difficulty ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`}
      />
    ));
  };

  const getWeatherIcon = (weather: string) => {
    switch (weather) {
      case 'clear': return '🌙';
      case 'light_rain': return '🌧️';
      case 'heavy_rain': return '⛈️';
      case 'storm': return '🌩️';
      default: return '🌙';
    }
  };

  const getWeatherText = (weather: string) => {
    switch (weather) {
      case 'clear': return '晴';
      case 'light_rain': return '小雨';
      case 'heavy_rain': return '大雨';
      case 'storm': return '暴雨';
      default: return '晴';
    }
  };

  return (
    <div className="min-h-screen bg-night-900 relative overflow-hidden">
      <RainEffect intensity="light" />
      
      <div className="relative z-10 container mx-auto px-6 py-8">
        <header className="text-center mb-12 pt-8">
          <div className="text-6xl mb-4 animate-float">🏍️</div>
          <h1 className="text-5xl font-bold mb-2">
            <span className="text-neon-blue neon-text-blue">夜</span>
            <span className="text-neon-pink neon-text-pink">色</span>
            <span className="text-neon-yellow neon-text-yellow">骑</span>
            <span className="text-neon-green">手</span>
          </h1>
          <p className="text-gray-400 text-lg">城市夜班外卖骑手模拟</p>
        </header>

        <div className="glass-panel p-4 mb-8 max-w-md mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-night-600 flex items-center justify-center text-2xl">
                👤
              </div>
              <div>
                <div className="font-bold text-white">{player.name}</div>
                <div className="text-sm text-gray-400">Lv.{player.level}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-neon-yellow font-bold">¥{player.money}</div>
              <div className="text-xs text-gray-500">总配送: {player.totalDeliveries}单</div>
            </div>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>经验值</span>
              <span>{player.exp} / {player.level * 100}</span>
            </div>
            <div className="h-2 bg-night-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-blue to-neon-pink rounded-full transition-all"
                style={{ width: `${(player.exp / (player.level * 100)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">选择章节</h2>
          <p className="text-gray-500 text-sm">完成章节目标解锁下一章节</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {CHAPTERS.map(chapter => {
            const isUnlocked = player.unlockedChapters.includes(chapter.id);
            const highScore = player.highScores[chapter.id] || 0;
            const isCleared = highScore >= chapter.targetEarnings;

            return (
              <div
                key={chapter.id}
                onClick={() => isUnlocked && handleStartChapter(chapter.id)}
                className={`glass-panel p-5 transition-all duration-300 ${
                  isUnlocked
                    ? 'cursor-pointer hover:scale-105 hover:shadow-neon-blue'
                    : 'opacity-50 cursor-not-allowed'
                }`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="text-4xl">{chapter.icon}</div>
                  {!isUnlocked && (
                    <Lock className="w-5 h-5 text-gray-500" />
                  )}
                  {isCleared && (
                    <Trophy className="w-5 h-5 text-yellow-400" />
                  )}
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{chapter.name}</h3>
                
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {getDifficultyStars(chapter.difficulty)}
                  </div>
                  <span className="text-xs text-gray-500">
                    {getWeatherIcon(chapter.weather)} {getWeatherText(chapter.weather)}
                  </span>
                </div>

                <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                  {chapter.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Target className="w-3 h-3" />
                      目标收益
                    </span>
                    <span className="text-neon-yellow">¥{chapter.targetEarnings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      时限
                    </span>
                    <span className="text-gray-300">{Math.floor(chapter.timeLimit / 60)}分钟</span>
                  </div>
                  {highScore > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500 flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        最高分
                      </span>
                      <span className="text-neon-green">¥{highScore}</span>
                    </div>
                  )}
                </div>

                {isUnlocked && (
                  <button className="w-full mt-4 btn-neon flex items-center justify-center gap-2">
                    <Play className="w-4 h-4" />
                    开始挑战
                  </button>
                )}
                {!isUnlocked && (
                  <div className="w-full mt-4 py-2 text-center text-sm text-gray-500 border border-night-600 rounded-lg">
                    完成上一章节解锁
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center mt-12 text-gray-600 text-sm">
          <p>提示：合理规划路线，注意电量和体力，争取更多收益！</p>
        </div>
      </div>
    </div>
  );
};

export default StartPage;
