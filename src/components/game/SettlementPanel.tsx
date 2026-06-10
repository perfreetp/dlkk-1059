import { useGameStore } from '../../store/gameStore';
import { getChapter } from '../../data/chapters';
import { Trophy, DollarSign, Package, Clock, Star, TrendingUp, XCircle, CheckCircle } from 'lucide-react';

const SettlementPanel = () => {
  const {
    currentEarnings,
    tips,
    deliveredOrders,
    failedOrders,
    remainingTime,
    currentChapterId,
    gameTime,
    isSettled,
    resetGame,
  } = useGameStore();

  const chapter = currentChapterId ? getChapter(currentChapterId) : null;
  const totalEarnings = currentEarnings + tips;
  const totalOrders = deliveredOrders.length + failedOrders.length;
  const successRate = totalOrders > 0 ? Math.round((deliveredOrders.length / totalOrders) * 100) : 0;
  const isWin = chapter ? totalEarnings >= chapter.targetEarnings : false;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(Math.abs(seconds) / 60);
    const secs = Math.floor(Math.abs(seconds) % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const avgTip = deliveredOrders.length > 0 ? Math.round(tips / deliveredOrders.length) : 0;

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-4 border-b border-night-600/50">
        <h2 className="text-lg font-bold text-neon-blue neon-text-blue">📊 结算</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {chapter && (
          <div className={`p-4 rounded-xl border text-center ${
            isSettled 
              ? isWin 
                ? 'bg-neon-green/10 border-neon-green/30' 
                : 'bg-red-500/10 border-red-500/30'
              : 'bg-night-700/50 border-night-600/50'
          }`}>
            <div className="text-4xl mb-2">
              {isSettled ? (isWin ? '🏆' : '😔') : '📈'}
            </div>
            <h3 className="text-xl font-bold mb-1">
              {isSettled ? (isWin ? '挑战成功！' : '挑战失败') : '进行中...'}
            </h3>
            <p className="text-sm text-gray-400">{chapter.name}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="glass-panel p-3 text-center">
            <DollarSign className="w-6 h-6 mx-auto mb-1 text-neon-yellow" />
            <div className="text-2xl font-bold text-neon-yellow">
              ¥{totalEarnings}
            </div>
            <div className="text-xs text-gray-500">总收益</div>
          </div>
          <div className="glass-panel p-3 text-center">
            <Package className="w-6 h-6 mx-auto mb-1 text-neon-green" />
            <div className="text-2xl font-bold text-neon-green">
              {deliveredOrders.length}
            </div>
            <div className="text-xs text-gray-500">完成订单</div>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            详细统计
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">配送费</span>
              <span className="text-gray-300">¥{currentEarnings}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">小费</span>
              <span className="text-neon-green">+¥{tips}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">平均小费</span>
              <span className="text-gray-300">¥{avgTip}</span>
            </div>
            <div className="border-t border-night-600/50 my-2"></div>
            <div className="flex justify-between">
              <span className="text-gray-500">成功订单</span>
              <span className="text-neon-green">{deliveredOrders.length} 单</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">失败订单</span>
              <span className="text-red-400">{failedOrders.length} 单</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">成功率</span>
              <span className={successRate >= 80 ? 'text-neon-green' : successRate >= 50 ? 'text-yellow-400' : 'text-red-400'}>
                {successRate}%
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-4 space-y-3">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            时间统计
          </h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">已用时间</span>
              <span className="text-gray-300">{formatTime(gameTime)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">剩余时间</span>
              <span className={remainingTime > 60 ? 'text-neon-green' : remainingTime > 30 ? 'text-yellow-400' : 'text-red-400'}>
                {formatTime(remainingTime)}
              </span>
            </div>
            {chapter && (
              <div className="flex justify-between">
                <span className="text-gray-500">目标收益</span>
                <span className={totalEarnings >= chapter.targetEarnings ? 'text-neon-green' : 'text-yellow-400'}>
                  ¥{chapter.targetEarnings}
                </span>
              </div>
            )}
          </div>
          
          {chapter && (
            <div className="mt-2">
              <div className="h-2 bg-night-700 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    totalEarnings >= chapter.targetEarnings ? 'bg-neon-green' : 'bg-neon-blue'
                  }`}
                  style={{ width: `${Math.min(100, (totalEarnings / chapter.targetEarnings) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>目标: ¥{chapter.targetEarnings}</span>
              </div>
            </div>
          )}
        </div>

        {deliveredOrders.length > 0 && (
          <div className="glass-panel p-4">
            <h4 className="font-medium text-gray-300 flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-400" />
              最近完成
            </h4>
            <div className="space-y-2 max-h-32 overflow-y-auto scrollbar-thin">
              {deliveredOrders.slice(-5).reverse().map(order => (
                <div key={order.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-neon-green shrink-0" />
                  <span className="flex-1 truncate text-gray-400">
                    {order.restaurant} → {order.customer}
                  </span>
                  <span className="text-neon-yellow">¥{order.reward}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {failedOrders.length > 0 && (
          <div className="glass-panel p-4">
            <h4 className="font-medium text-gray-300 flex items-center gap-2 mb-3">
              <XCircle className="w-4 h-4 text-red-400" />
              失败订单
            </h4>
            <div className="space-y-2 max-h-24 overflow-y-auto scrollbar-thin">
              {failedOrders.slice(-3).reverse().map(order => (
                <div key={order.id} className="flex items-center gap-2 text-sm">
                  <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span className="flex-1 truncate text-gray-400">
                    {order.restaurant} → {order.customer}
                  </span>
                  <span className="text-red-400 text-xs">超时</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {isSettled && (
        <div className="p-4 border-t border-night-600/50">
          <button
            onClick={resetGame}
            className="w-full btn-neon"
          >
            返回章节选择
          </button>
        </div>
      )}
    </div>
  );
};

export default SettlementPanel;
