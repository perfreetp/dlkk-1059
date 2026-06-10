import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { CHAPTERS } from '../../data/chapters';
import { 
  Trophy, Medal, Clock, TrendingUp, Star, 
  Target, Zap, Award, BarChart3, Crown
} from 'lucide-react';
import type { ChapterRecord, LeaderboardEntry } from '../../types';

const formatTime = (seconds: number): string => {
  if (seconds === Infinity || seconds === 0 || !isFinite(seconds)) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, name: '雨夜骑士', score: 1850, deliveries: 42, successRate: 96 },
  { rank: 2, name: '闪电侠', score: 1680, deliveries: 38, successRate: 92 },
  { rank: 3, name: '外卖之王', score: 1520, deliveries: 35, successRate: 89 },
  { rank: 4, name: '夜行侠', score: 1380, deliveries: 32, successRate: 87 },
  { rank: 5, name: '飞毛腿', score: 1250, deliveries: 30, successRate: 85 },
  { rank: 6, name: '风之子', score: 1120, deliveries: 28, successRate: 82 },
  { rank: 7, name: '极速者', score: 980, deliveries: 25, successRate: 80 },
  { rank: 8, name: '暗夜精灵', score: 850, deliveries: 22, successRate: 78 },
  { rank: 9, name: '路路通', score: 720, deliveries: 20, successRate: 75 },
  { rank: 10, name: '老司机', score: 600, deliveries: 18, successRate: 72 },
];

const loadLeaderboard = (): LeaderboardEntry[] => {
  try {
    const saved = localStorage.getItem('delivery_rider_leaderboard_v1');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load leaderboard:', e);
  }
  return DEFAULT_LEADERBOARD;
};

const saveLeaderboard = (data: LeaderboardEntry[]) => {
  try {
    localStorage.setItem('delivery_rider_leaderboard_v1', JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save leaderboard:', e);
  }
};

const mergePlayerToLeaderboard = (baseList: LeaderboardEntry[], playerScore: number, playerName: string, deliveries: number, successRate: number): LeaderboardEntry[] => {
  const playerEntry: LeaderboardEntry = {
    rank: 0,
    name: playerName + ' (我)',
    score: playerScore,
    deliveries,
    successRate,
    isPlayer: true,
  };

  const filtered = baseList.filter(e => !e.isPlayer);
  filtered.push(playerEntry);
  filtered.sort((a, b) => b.score - a.score);
  filtered.forEach((e, i) => e.rank = i + 1);
  return filtered.slice(0, 10);
};

const LeaderboardPanel = () => {
  const { player } = useGameStore();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const baseList = loadLeaderboard();
    const totalScore = Object.values(player.chapterRecords).reduce((sum, r) => sum + r.bestScore, 0) + player.totalEarnings + player.totalTips;
    const totalSuccessRate = player.totalDeliveries > 0 
      ? Math.round((player.totalSuccessfulDeliveries / player.totalDeliveries) * 100) 
      : 0;
    const merged = mergePlayerToLeaderboard(baseList, totalScore, player.name, player.totalSuccessfulDeliveries, totalSuccessRate);
    setLeaderboard(merged);
    saveLeaderboard(merged);
  }, [player.name, player.chapterRecords, player.totalEarnings, player.totalTips, player.totalSuccessfulDeliveries, player.totalDeliveries]);

  const totalScore = Object.values(player.chapterRecords).reduce((sum, r) => sum + r.bestScore, 0) + player.totalEarnings + player.totalTips;
  const totalDeliveries = player.totalSuccessfulDeliveries;
  const totalSuccessRate = player.totalDeliveries > 0 
    ? Math.round((player.totalSuccessfulDeliveries / player.totalDeliveries) * 100) 
    : 0;

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return <Crown className="w-5 h-5 text-yellow-400" />;
      case 2: return <Medal className="w-5 h-5 text-gray-300" />;
      case 3: return <Award className="w-5 h-5 text-orange-400" />;
      default: return <span className="w-5 h-5 text-center text-gray-500 text-sm">{rank}</span>;
    }
  };

  const getRankBg = (rank: number, isPlayer?: boolean) => {
    if (isPlayer) return 'bg-neon-blue/20 border-neon-blue/50';
    switch (rank) {
      case 1: return 'bg-yellow-500/10 border-yellow-500/30';
      case 2: return 'bg-gray-400/10 border-gray-400/30';
      case 3: return 'bg-orange-500/10 border-orange-500/30';
      default: return 'bg-night-800/50 border-night-600/30';
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50">
        <h2 className="text-lg font-bold text-neon-yellow neon-text-yellow">🏆 排行榜 & 战绩</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div className="glass-panel p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-blue to-neon-pink flex items-center justify-center text-2xl">
              🏍️
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{player.name}</h3>
              <p className="text-xs text-gray-400">Lv.{player.level} · 声誉 {player.reputation}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-night-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Trophy className="w-3 h-3" />总收益
              </div>
              <div className="text-lg font-bold text-neon-yellow">¥{player.totalEarnings + player.totalTips}</div>
            </div>
            <div className="bg-night-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Zap className="w-3 h-3" />总配送
              </div>
              <div className="text-lg font-bold text-neon-green">{player.totalSuccessfulDeliveries}单</div>
            </div>
            <div className="bg-night-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Target className="w-3 h-3" />成功率
              </div>
              <div className="text-lg font-bold text-neon-blue">
                {player.totalDeliveries > 0 ? Math.round((player.totalSuccessfulDeliveries / player.totalDeliveries) * 100) : 0}%
              </div>
            </div>
            <div className="bg-night-800/50 rounded p-2 text-center">
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <Star className="w-3 h-3" />小费
              </div>
              <div className="text-lg font-bold text-neon-pink">¥{player.totalTips}</div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            全服排行榜
          </h3>
          
          <div className="space-y-2">
            {leaderboard.map((entry) => {
              const isPlayer = entry.isPlayer;
              return (
                <div 
                  key={entry.name}
                  className={`flex items-center gap-3 p-2 rounded-lg border ${getRankBg(entry.rank, isPlayer)}`}
                >
                  <div className="w-8 flex justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`font-medium truncate ${isPlayer ? 'text-neon-blue' : 'text-gray-200'}`}>
                      {entry.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {entry.deliveries > 0 && `${entry.deliveries}单 · ${Math.round(entry.successRate)}%`}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-neon-yellow">¥{entry.score}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-panel p-4">
          <h3 className="font-bold text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-blue" />
            章节战绩
          </h3>
          
          <div className="space-y-2">
            {CHAPTERS.map((chapter) => {
              const record: ChapterRecord | undefined = player.chapterRecords[chapter.id];
              const isUnlocked = player.unlockedChapters.includes(chapter.id);
              const successRate = record && record.totalDeliveries > 0 
                ? Math.round((record.successfulDeliveries / record.totalDeliveries) * 100) 
                : 0;
              
              return (
                <div 
                  key={chapter.id}
                  className={`p-3 rounded-lg border ${
                    isUnlocked 
                      ? 'bg-night-800/50 border-night-600/50' 
                      : 'bg-night-900/50 border-night-700/30 opacity-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{chapter.icon}</span>
                      <div>
                        <h4 className={`font-medium ${isUnlocked ? 'text-white' : 'text-gray-600'}`}>
                          {chapter.name}
                          {!isUnlocked && ' 🔒'}
                        </h4>
                        <p className="text-xs text-gray-500">{chapter.description}</p>
                      </div>
                    </div>
                    {record && record.playCount > 0 && (
                      <div className="text-right">
                        <div className="text-sm font-bold text-neon-yellow">
                          ¥{record.bestScore}
                        </div>
                        <div className="text-xs text-gray-500">最佳</div>
                      </div>
                    )}
                  </div>
                  
                  {record && record.playCount > 0 ? (
                    <div className="grid grid-cols-5 gap-1 text-xs">
                      <div className="bg-night-900/50 rounded p-1.5 text-center">
                        <div className="text-gray-500 flex items-center justify-center">
                          <TrendingUp className="w-3 h-3" />
                        </div>
                        <div className="text-neon-green font-medium">{successRate}%</div>
                        <div className="text-gray-600">成功率</div>
                      </div>
                      <div className="bg-night-900/50 rounded p-1.5 text-center">
                        <div className="text-gray-500 flex items-center justify-center">
                          <Zap className="w-3 h-3" />
                        </div>
                        <div className="text-neon-blue font-medium">{record.successfulDeliveries}</div>
                        <div className="text-gray-600">完成</div>
                      </div>
                      <div className="bg-night-900/50 rounded p-1.5 text-center">
                        <div className="text-gray-500 flex items-center justify-center">
                          <Clock className="w-3 h-3" />
                        </div>
                        <div className="text-neon-yellow font-medium">{formatTime(record.bestTime)}</div>
                        <div className="text-gray-600">最快</div>
                      </div>
                      <div className="bg-night-900/50 rounded p-1.5 text-center">
                        <div className="text-gray-500 flex items-center justify-center">
                          <BarChart3 className="w-3 h-3" />
                        </div>
                        <div className="text-neon-pink font-medium">{formatTime(record.averageTimePerOrder || 0)}</div>
                        <div className="text-gray-600">平均</div>
                      </div>
                      <div className="bg-night-900/50 rounded p-1.5 text-center">
                        <div className="text-gray-500 flex items-center justify-center">
                          <Target className="w-3 h-3" />
                        </div>
                        <div className="text-white font-medium">{record.playCount}</div>
                        <div className="text-gray-600">次数</div>
                      </div>
                    </div>
                  ) : (
                    isUnlocked && (
                      <div className="text-xs text-gray-500 text-center py-2">
                        暂无战绩数据，快去挑战吧！
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;
