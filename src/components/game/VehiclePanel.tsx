import { useGameStore } from '../../store/gameStore';
import { MAP_NODES } from '../../data/mapData';
import { Battery, Wrench, Zap, Gauge, Bike, RefreshCw } from 'lucide-react';

const VehiclePanel = () => {
  const { vehicle, currentEarnings, chargeVehicle, currentNodeId } = useGameStore();
  const currentNode = currentNodeId ? MAP_NODES.find(n => n.id === currentNodeId) : null;
  const isAtChargingStation = currentNode?.type === 'charging';

  const batteryColor = vehicle.battery > 60 ? 'bg-green-500' : vehicle.battery > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const durabilityColor = vehicle.durability > 60 ? 'bg-green-500' : vehicle.durability > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const handleCharge = (amount: number) => {
    chargeVehicle(amount);
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50">
        <h2 className="text-lg font-bold text-neon-green neon-text-blue">🛵 车辆</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div className="text-center py-4">
          <div className="text-6xl mb-2">🏍️</div>
          <h3 className="text-xl font-bold text-neon-blue">{vehicle.name}</h3>
          <p className="text-sm text-gray-500">{vehicle.type}</p>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-gray-300">电量</span>
              </div>
              <span className="text-sm font-mono text-neon-green">
                {Math.round(vehicle.battery)}%
              </span>
            </div>
            <div className="h-3 bg-night-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${batteryColor} rounded-full transition-all duration-300`}
                style={{ width: `${vehicle.battery}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              消耗: {vehicle.batteryDrain.toFixed(2)}%/秒
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-orange-400" />
                <span className="text-sm text-gray-300">耐久</span>
              </div>
              <span className="text-sm font-mono text-orange-400">
                {Math.round(vehicle.durability)}%
              </span>
            </div>
            <div className="h-3 bg-night-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${durabilityColor} rounded-full transition-all duration-300`}
                style={{ width: `${vehicle.durability}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-neon-blue" />
                <span className="text-sm text-gray-300">速度</span>
              </div>
              <span className="text-sm font-mono text-neon-blue">
                {vehicle.speed} km/h
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel p-3 space-y-2">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-green" />
            充电站
          </h4>
          
          {isAtChargingStation ? (
            <div className="space-y-2">
              <p className="text-xs text-green-400">✓ 已到达充电站</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCharge(20)}
                  disabled={vehicle.battery >= 100 || currentEarnings < 4}
                  className={`py-2 text-sm rounded transition-all ${
                    vehicle.battery < 100 && currentEarnings >= 4
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +20% (¥4)
                </button>
                <button
                  onClick={() => handleCharge(50)}
                  disabled={vehicle.battery >= 100 || currentEarnings < 10}
                  className={`py-2 text-sm rounded transition-all ${
                    vehicle.battery < 100 && currentEarnings >= 10
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +50% (¥10)
                </button>
              </div>
              <button
                onClick={() => handleCharge(100)}
                disabled={vehicle.battery >= 100 || currentEarnings < 20}
                className={`w-full py-2 text-sm rounded transition-all ${
                  vehicle.battery < 100 && currentEarnings >= 20
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                    : 'bg-night-700 text-gray-600 cursor-not-allowed'
                }`}
              >
                充满 (¥{Math.ceil((100 - vehicle.battery) * 0.2)})
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              找到地图上的⚡充电站进行充电
            </p>
          )}
        </div>

        <div className="glass-panel p-3">
          <h4 className="font-medium text-gray-300 flex items-center gap-2 mb-2">
            <RefreshCw className="w-4 h-4 text-orange-400" />
            维修
          </h4>
          <p className="text-xs text-gray-500">
            耐久度过低会影响行驶速度
          </p>
          <button
            disabled={true}
            className="w-full mt-2 py-2 text-sm rounded bg-night-700 text-gray-600 cursor-not-allowed"
          >
            维修站功能开发中...
          </button>
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;
