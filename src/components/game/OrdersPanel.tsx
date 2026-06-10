import { useGameStore } from '../../store/gameStore';
import { getOrderTypeLabel, getOrderTypeColor, getOrderTypeBgColor, getOrderQualityLabel, getOrderQualityColor, getOrderQualityBorder } from '../../data/orders';
import { getNode } from '../../data/mapData';
import { Clock, MapPin, Utensils, User, DollarSign, AlertTriangle, CheckCircle, Package, Star, TrendingUp, TrendingDown } from 'lucide-react';
import type { Order, OrderQuality } from '../../types';

const OrderCard = ({ order, isActive, onClick }: { order: Order; isActive: boolean; onClick: () => void }) => {
  const pickupNode = getNode(order.pickupNodeId);
  const dropoffNode = getNode(order.dropoffNodeId);

  const timeColor = order.timeLimit < 30 ? 'text-red-400' : order.timeLimit < 60 ? 'text-yellow-400' : 'text-green-400';
  const timeUrgent = order.timeLimit < 30 ? 'animate-pulse' : '';

  return (
    <div
      onClick={onClick}
      className={`p-3 rounded-lg border cursor-pointer transition-all ${getOrderTypeBgColor(order.type)} ${getOrderQualityBorder(order.quality)} ${
        order.isEmergency ? 'border-red-500/70 shadow-[0_0_12px_rgba(239,68,68,0.25)]' : ''
      } ${
        isActive ? 'ring-2 ring-neon-blue scale-[1.02]' : 'hover:scale-[1.01]'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${getOrderTypeColor(order.type)} bg-night-800/50`}>
            {getOrderTypeLabel(order.type)}
          </span>
          {order.isEmergency ? (
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-500/30 text-red-400 border border-red-500/50">
              🆘 应急任务
            </span>
          ) : (
            <span className={`text-xs font-bold px-2 py-0.5 rounded ${getOrderQualityColor(order.quality)}`}>
              {getOrderQualityLabel(order.quality)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-neon-yellow font-bold">
          <DollarSign className="w-4 h-4" />
          <span>{order.reward}</span>
          {order.quality === 'premium' && !order.isEmergency && <span className="text-yellow-400 text-xs ml-1">↑</span>}
          {order.quality === 'poor' && !order.isEmergency && <span className="text-red-400 text-xs ml-1">↓</span>}
        </div>
      </div>

      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2 text-gray-300">
          <Utensils className="w-4 h-4 text-neon-pink" />
          <span className="truncate">{order.restaurant}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-300">
          <User className="w-4 h-4 text-neon-blue" />
          <span className="truncate">{order.customer}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-xs text-gray-500 truncate">
            {pickupNode?.name || '取餐点'} → {dropoffNode?.name || '送餐点'}
          </span>
        </div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className={`flex items-center gap-1 ${timeColor} ${timeUrgent}`}>
          <Clock className="w-4 h-4" />
          <span className="text-sm font-mono">
            {Math.floor(order.timeLimit / 60)}:{(order.timeLimit % 60).toString().padStart(2, '0')}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <div className="w-16 h-1.5 bg-night-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-orange-500 to-yellow-400 rounded-full transition-all"
              style={{ width: `${order.foodTemperature}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">{Math.round(order.foodTemperature)}°</span>
        </div>
      </div>

      {order.customerNote && (
        <div className="mt-2 text-xs text-gray-400 italic border-t border-night-600/50 pt-2">
          备注: {order.customerNote}
        </div>
      )}
    </div>
  );
};

const OrdersPanel = () => {
  const {
    availableOrders,
    activeOrders,
    selectedOrderId,
    selectOrder,
    acceptOrder,
    pickUpOrder,
    deliverOrder,
    cancelOrder,
    currentNodeId,
    player,
  } = useGameStore();

  const selectedOrder = [...availableOrders, ...activeOrders].find(o => o.id === selectedOrderId);

  const sortedAvailableOrders = [...availableOrders].sort((a, b) => {
    const qualityOrder: Record<OrderQuality, number> = { premium: 0, normal: 1, poor: 2 };
    return qualityOrder[a.quality] - qualityOrder[b.quality];
  });

  const getReputationLevel = () => {
    if (player.reputation >= 80) return { text: '极佳', color: 'text-yellow-400', icon: <Star className="w-4 h-4 fill-yellow-400" /> };
    if (player.reputation >= 60) return { text: '良好', color: 'text-green-400', icon: <TrendingUp className="w-4 h-4" /> };
    if (player.reputation >= 40) return { text: '一般', color: 'text-gray-400', icon: null };
    if (player.reputation >= 20) return { text: '较差', color: 'text-orange-400', icon: <TrendingDown className="w-4 h-4" /> };
    return { text: '极差', color: 'text-red-400', icon: <TrendingDown className="w-4 h-4" /> };
  };

  const repLevel = getReputationLevel();

  const premiumOrders = sortedAvailableOrders.filter(o => o.quality === 'premium');
  const normalOrders = sortedAvailableOrders.filter(o => o.quality === 'normal');
  const poorOrders = sortedAvailableOrders.filter(o => o.quality === 'poor');

  const canPickUp = (order: Order) => {
    return order.status === 'accepted' && order.pickupNodeId === currentNodeId;
  };

  const canDeliver = (order: Order) => {
    return order.status === 'picked' && order.dropoffNodeId === currentNodeId;
  };

  const handleAccept = () => {
    if (selectedOrder && selectedOrder.status === 'pending') {
      acceptOrder(selectedOrder.id);
    }
  };

  const handlePickUp = () => {
    if (selectedOrder) {
      pickUpOrder(selectedOrder.id);
    }
  };

  const handleDeliver = () => {
    if (selectedOrder) {
      deliverOrder(selectedOrder.id);
    }
  };

  const handleCancel = () => {
    if (selectedOrder && selectedOrder.status !== 'delivered') {
      cancelOrder(selectedOrder.id);
      selectOrder(null);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50">
        <h2 className="text-lg font-bold text-neon-blue neon-text-blue">📋 订单</h2>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-3 py-2 border-b border-night-600/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400">我的声誉</span>
              <div className="flex items-center gap-1">
                {repLevel.icon}
                <span className={`text-sm font-bold ${repLevel.color}`}>
                  {player.reputation}
                </span>
                <span className={`text-xs ${repLevel.color}`}>
                  ({repLevel.text})
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {player.reputation >= 60 ? '✨ 优质单更多' : player.reputation <= 30 ? '⚠️ 差单较多' : ''}
            </div>
          </div>
          <div className="mt-1 h-1.5 bg-night-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                player.reputation >= 60 ? 'bg-yellow-500' : player.reputation >= 40 ? 'bg-green-500' : player.reputation >= 20 ? 'bg-orange-500' : 'bg-red-500'
              }`}
              style={{ width: `${player.reputation}%` }}
            />
          </div>
        </div>

        <div className="flex border-b border-night-600/50">
          <div className="flex-1 px-3 py-2 text-center text-sm font-medium text-neon-yellow border-b-2 border-neon-yellow">
            可接 ({availableOrders.length})
          </div>
          <div className="flex-1 px-3 py-2 text-center text-sm text-gray-400">
            配送中 ({activeOrders.length})
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-3">
          {availableOrders.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-30" />
              <p>暂无订单</p>
              <p className="text-xs">等待新订单刷新...</p>
            </div>
          ) : (
            <>
              {premiumOrders.length > 0 && (
                <div>
                  <div className="text-xs text-yellow-400 mb-2 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-yellow-400" />
                    优质订单 ({premiumOrders.length})
                    <span className="text-gray-500 ml-1">· 奖励+30% · 时限更宽松</span>
                  </div>
                  <div className="space-y-2">
                    {premiumOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isActive={selectedOrderId === order.id}
                        onClick={() => selectOrder(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {normalOrders.length > 0 && (
                <div>
                  <div className="text-xs text-gray-400 mb-2">
                    普通订单 ({normalOrders.length})
                  </div>
                  <div className="space-y-2">
                    {normalOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isActive={selectedOrderId === order.id}
                        onClick={() => selectOrder(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {poorOrders.length > 0 && (
                <div>
                  <div className="text-xs text-red-400 mb-2">
                    差单 ({poorOrders.length})
                    <span className="text-gray-500 ml-1">· 奖励-30% · 时限更紧</span>
                  </div>
                  <div className="space-y-2">
                    {poorOrders.map(order => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        isActive={selectedOrderId === order.id}
                        onClick={() => selectOrder(order.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeOrders.length > 0 && (
            <div className="pt-2 border-t border-night-600/50">
              <div className="text-sm text-gray-500 pb-2">--- 配送中 ---</div>
              {activeOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={order}
                  isActive={selectedOrderId === order.id}
                  onClick={() => selectOrder(order.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="p-3 border-t border-night-600/50 bg-night-700/30">
          <div className="flex items-center gap-2 mb-2">
            {selectedOrder.status === 'pending' && (
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
            )}
            {selectedOrder.status === 'accepted' && (
              <Package className="w-4 h-4 text-blue-400" />
            )}
            {selectedOrder.status === 'picked' && (
              <CheckCircle className="w-4 h-4 text-green-400" />
            )}
            <span className="text-sm text-gray-300">
              {selectedOrder.status === 'pending' && '待接单'}
              {selectedOrder.status === 'accepted' && '待取餐'}
              {selectedOrder.status === 'picked' && '配送中'}
            </span>
          </div>

          <div className="flex gap-2">
            {selectedOrder.status === 'pending' && (
              <button
                onClick={handleAccept}
                className="flex-1 btn-neon-green text-sm"
              >
                接单
              </button>
            )}
            {selectedOrder.status === 'accepted' && canPickUp(selectedOrder) && (
              <button
                onClick={handlePickUp}
                className="flex-1 btn-neon text-sm"
              >
                取餐
              </button>
            )}
            {selectedOrder.status === 'picked' && canDeliver(selectedOrder) && (
              <button
                onClick={handleDeliver}
                className="flex-1 btn-neon-pink text-sm"
              >
                送达
              </button>
            )}
            {(selectedOrder.status === 'accepted' || selectedOrder.status === 'picked') && (
              <button
                onClick={handleCancel}
                className="px-3 py-2 rounded-lg text-sm text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-all"
              >
                取消
              </button>
            )}
          </div>

          {selectedOrder.status === 'accepted' && !canPickUp(selectedOrder) && (
            <p className="text-xs text-gray-500 mt-2 text-center">前往取餐点后可取餐</p>
          )}
          {selectedOrder.status === 'picked' && !canDeliver(selectedOrder) && (
            <p className="text-xs text-gray-500 mt-2 text-center">前往送餐点后可送达</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OrdersPanel;
