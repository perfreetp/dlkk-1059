import { useGameStore } from '../../store/gameStore';
import { MAP_NODES } from '../../data/mapData';
import { 
  Battery, Wrench, Zap, Gauge, Bike, RefreshCw, 
  AlertTriangle, Coffee, Heart, Activity, Shield, 
  Clock, FileText, Truck, Ambulance, CheckCircle, XCircle
} from 'lucide-react';

const VehiclePanel = () => {
  const { 
    vehicle, 
    currentEarnings, 
    player,
    stamina,
    chargeVehicle, 
    repairVehicle,
    rest,
    currentNodeId,
    callRescue,
    isBeingRescued,
    rescueProgress,
    rescueCost,
    rescueTimeCost,
    rescueTargetNodeId,
    acceptEmergencyMission,
    buyInsurance,
    buyMaintenance,
    player,
    sessionRescueCost,
    sessionRepairCost,
  } = useGameStore();
  
  const repairRecords = player.repairRecords;
  const rescueRecords = player.rescueRecords;
  
  const currentNode = currentNodeId ? MAP_NODES.find(n => n.id === currentNodeId) : null;
  const isAtChargingStation = currentNode?.type === 'charging';
  const isAtRepairShop = currentNode?.type === 'repair';
  const isAtRestStation = currentNode?.type === 'rest';

  const batteryColor = vehicle.battery > 60 ? 'bg-green-500' : vehicle.battery > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const durabilityColor = vehicle.durability > 60 ? 'bg-green-500' : vehicle.durability > 30 ? 'bg-yellow-500' : 'bg-red-500';
  const staminaColor = stamina > 60 ? 'bg-green-500' : stamina > 30 ? 'bg-yellow-500' : 'bg-red-500';

  const totalMoney = currentEarnings + player.money;

  const handleCharge = (amount: number) => {
    chargeVehicle(amount);
  };

  const handleRepair = (amount: number) => {
    repairVehicle(amount);
  };

  const handleRest = (amount: number) => {
    rest(amount);
  };

  const getSpeedModifier = () => {
    let mod = 1;
    if (vehicle.durability <= 20) mod *= 0.6;
    else if (vehicle.durability <= 50) mod *= 0.85;
    if (vehicle.battery <= 0) mod *= 0.1;
    else if (vehicle.battery <= 10) mod *= 0.5;
    if (stamina <= 0) mod *= 0.3;
    else if (stamina <= 30) mod *= 0.6;
    return mod;
  };

  const speedMod = getSpeedModifier();

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50">
        <h2 className="text-lg font-bold text-neon-green neon-text-blue">🛵 车辆 & 状态</h2>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <div className="text-center py-4">
          <div className="text-6xl mb-2">🏍️</div>
          <h3 className="text-xl font-bold text-neon-blue">{vehicle.name}</h3>
          <p className="text-sm text-gray-500">{vehicle.type}</p>
          {speedMod < 1 && (
            <div className="mt-2 text-xs text-orange-400 flex items-center justify-center gap-1">
              <Activity className="w-3 h-3" />
              当前速度: {Math.round(speedMod * 100)}%
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Battery className="w-4 h-4 text-neon-green" />
                <span className="text-sm text-gray-300">电量</span>
              </div>
              <span className="text-sm font-mono text-neon-green">
                {Math.round(vehicle.battery)}/{vehicle.maxBattery}%
              </span>
            </div>
            <div className="h-3 bg-night-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${batteryColor} rounded-full transition-all duration-300`}
                style={{ width: `${(vehicle.battery / vehicle.maxBattery) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              消耗: {vehicle.batteryDrain.toFixed(2)}%/秒
              {vehicle.maxBattery > 100 && (
                <span className="text-neon-green ml-2">✓ 扩容电池 +{vehicle.maxBattery - 100}%</span>
              )}
              {vehicle.battery <= 10 && (
                <span className="text-red-400 ml-2">⚠️ 电量不足，速度下降</span>
              )}
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
            <p className="text-xs text-gray-500 mt-1">
              最大耐久: {vehicle.maxDurability}%
              {vehicle.durability <= 20 && (
                <span className="text-red-400 ml-2">⚠️ 耐久过低，请尽快维修！</span>
              )}
              {vehicle.durability <= 50 && vehicle.durability > 20 && (
                <span className="text-yellow-400 ml-2">⚠️ 耐久不足，速度受影响</span>
              )}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                <span className="text-sm text-gray-300">体力</span>
              </div>
              <span className="text-sm font-mono text-pink-400">
                {Math.round(stamina)}/{player.maxStamina}
              </span>
            </div>
            <div className="h-3 bg-night-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${staminaColor} rounded-full transition-all duration-300`}
                style={{ width: `${(stamina / player.maxStamina) * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stamina <= 30 && (
                <span className="text-yellow-400">⚠️ 体力不足，速度下降</span>
              )}
              {stamina <= 0 && (
                <span className="text-red-400 ml-2">⚠️ 体力耗尽！</span>
              )}
            </p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-neon-blue" />
                <span className="text-sm text-gray-300">基础速度</span>
              </div>
              <span className="text-sm font-mono text-neon-blue">
                {vehicle.speed} km/h
              </span>
            </div>
          </div>
        </div>

        {vehicle.battery <= 0 && (
          <div className="glass-panel p-3 border border-red-500/50 bg-red-500/10 space-y-3">
            <div className="flex items-center gap-2 text-red-400 text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>电量耗尽！无法行驶，请充电或呼叫救援。</span>
            </div>
            {!isBeingRescued ? (
              <div className="space-y-2">
                <button
                  onClick={callRescue}
                  className="w-full py-2 rounded bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30 transition-all flex items-center justify-center gap-2"
                >
                  <Truck className="w-4 h-4" />
                  呼叫救援拖车
                </button>
                {rescueCost > 0 && (
                  <p className="text-xs text-center text-gray-400">
                    预计费用: ¥{rescueCost} | 预计耗时: {rescueTimeCost}秒
                  </p>
                )}
                {rescueCost === 0 && rescueTimeCost > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs text-yellow-400 text-center">
                      ⚠️ 余额不足！可选择应急救援方案
                    </p>
                    <button
                      onClick={acceptEmergencyMission}
                      className="w-full py-2 rounded bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Ambulance className="w-4 h-4" />
                      接受应急任务（低收益抵扣费用）
                    </button>
                    <p className="text-xs text-gray-500 text-center">
                      需完成1单低收益订单抵扣救援费
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-orange-400 flex items-center gap-1">
                    <Truck className="w-4 h-4 animate-pulse" />
                    救援车正在赶来...
                  </span>
                  <span className="text-gray-400">{Math.round(rescueProgress * 100)}%</span>
                </div>
                <div className="h-2 bg-night-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all duration-300"
                    style={{ width: `${rescueProgress * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 text-center">
                  目标充电站 | 费用: ¥{rescueCost} | 已耗时: {Math.round(rescueTimeCost * rescueProgress)}秒
                </p>
              </div>
            )}
          </div>
        )}

        {isBeingRescued && vehicle.battery > 0 && (
          <div className="glass-panel p-3 border border-orange-500/50 bg-orange-500/10 space-y-2">
            <div className="flex items-center gap-2 text-orange-400 text-sm">
              <Truck className="w-4 h-4 animate-pulse" />
              <span>救援拖车正在运送至充电站...</span>
            </div>
            <div className="h-2 bg-night-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-300"
                style={{ width: `${rescueProgress * 100}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center">
              {Math.round(rescueProgress * 100)}% 完成 | 费用: ¥{rescueCost}
            </p>
          </div>
        )}

        <div className="glass-panel p-3 space-y-2">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <Zap className="w-4 h-4 text-neon-green" />
            充电站
          </h4>
          
          {isAtChargingStation ? (
            <div className="space-y-2">
              <p className="text-xs text-green-400">✓ 已到达充电站 (0.2元/%)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleCharge(20)}
                  disabled={vehicle.battery >= vehicle.maxBattery || totalMoney < 4}
                  className={`py-2 text-sm rounded transition-all ${
                    vehicle.battery < vehicle.maxBattery && totalMoney >= 4
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +20% (¥4)
                </button>
                <button
                  onClick={() => handleCharge(50)}
                  disabled={vehicle.battery >= vehicle.maxBattery || totalMoney < 10}
                  className={`py-2 text-sm rounded transition-all ${
                    vehicle.battery < vehicle.maxBattery && totalMoney >= 10
                      ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +50% (¥10)
                </button>
              </div>
              <button
                onClick={() => handleCharge(vehicle.maxBattery)}
                disabled={vehicle.battery >= vehicle.maxBattery || totalMoney < Math.ceil((vehicle.maxBattery - vehicle.battery) * 0.2)}
                className={`w-full py-2 text-sm rounded transition-all ${
                  vehicle.battery < vehicle.maxBattery && totalMoney >= Math.ceil((vehicle.maxBattery - vehicle.battery) * 0.2)
                    ? 'bg-neon-green/20 text-neon-green border border-neon-green/50 hover:bg-neon-green/30'
                    : 'bg-night-700 text-gray-600 cursor-not-allowed'
                }`}
              >
                充满 (¥{Math.ceil((vehicle.maxBattery - vehicle.battery) * 0.2)})
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              找到地图上的⚡充电站进行充电
            </p>
          )}
        </div>

        <div className="glass-panel p-3 space-y-3">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-orange-400" />
            修车铺
          </h4>
          
          {isAtRepairShop ? (
            <div className="space-y-3">
              <p className="text-xs text-orange-400">✓ 已到达修车铺 (0.5元/%)</p>
              
              <div className="space-y-2">
                <p className="text-xs text-gray-400">维修服务</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleRepair(20)}
                    disabled={vehicle.durability >= vehicle.maxDurability || totalMoney < 10}
                    className={`py-2 text-sm rounded transition-all ${
                      vehicle.durability < vehicle.maxDurability && totalMoney >= 10
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30'
                        : 'bg-night-700 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    +20% (¥10)
                  </button>
                  <button
                    onClick={() => handleRepair(50)}
                    disabled={vehicle.durability >= vehicle.maxDurability || totalMoney < 25}
                    className={`py-2 text-sm rounded transition-all ${
                      vehicle.durability < vehicle.maxDurability && totalMoney >= 25
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30'
                        : 'bg-night-700 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    +50% (¥25)
                  </button>
                </div>
                <button
                  onClick={() => handleRepair(vehicle.maxDurability)}
                  disabled={vehicle.durability >= vehicle.maxDurability || totalMoney < Math.ceil((vehicle.maxDurability - vehicle.durability) * 0.5)}
                  className={`w-full py-2 text-sm rounded transition-all ${
                    vehicle.durability < vehicle.maxDurability && totalMoney >= Math.ceil((vehicle.maxDurability - vehicle.durability) * 0.5)
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50 hover:bg-orange-500/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  完全修复 (¥{Math.ceil((vehicle.maxDurability - vehicle.durability) * 0.5)})
                </button>
              </div>

              <div className="border-t border-night-600/50 pt-3 space-y-2">
                <p className="text-xs text-gray-400">保养服务（降低耐久消耗）</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => buyMaintenance('basic')}
                    disabled={totalMoney < 50 || vehicle.maintenanceBonus >= 0.4}
                    className={`py-2 text-sm rounded transition-all ${
                      totalMoney >= 50 && vehicle.maintenanceBonus < 0.4
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30'
                        : 'bg-night-700 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    基础保养<br/><span className="text-xs">¥50 -20%消耗</span>
                  </button>
                  <button
                    onClick={() => buyMaintenance('full')}
                    disabled={totalMoney < 120 || vehicle.maintenanceBonus >= 0.4}
                    className={`py-2 text-sm rounded transition-all ${
                      totalMoney >= 120 && vehicle.maintenanceBonus < 0.4
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30'
                        : 'bg-night-700 text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    全面保养<br/><span className="text-xs">¥120 -40%消耗</span>
                  </button>
                </div>
                {vehicle.maintenanceBonus > 0 && (
                  <p className="text-xs text-green-400 text-center">
                    ✓ 当前保养效果: -{Math.round(vehicle.maintenanceBonus * 100)}% 耐久消耗
                  </p>
                )}
              </div>

              <div className="border-t border-night-600/50 pt-3 space-y-2">
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Shield className="w-3 h-3" /> 车辆保险
                </p>
                {vehicle.insurance && vehicle.insurance.active ? (
                  <div className="p-2 rounded bg-green-500/10 border border-green-500/30">
                    <div className="flex justify-between text-sm">
                      <span className="text-green-400">{vehicle.insurance.name}</span>
                      <span className="text-gray-400">
                        剩余 {Math.max(0, Math.floor((vehicle.insurance.expiresAt - Date.now()) / 1000))}秒
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      覆盖: {Math.round(vehicle.insurance.coverage * 100)}% 维修/救援费用
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => buyInsurance('basic')}
                      disabled={totalMoney < 100}
                      className={`py-2 text-sm rounded transition-all ${
                        totalMoney >= 100
                          ? 'bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30'
                          : 'bg-night-700 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      基础保险<br/><span className="text-xs">¥100 50%覆盖</span>
                    </button>
                    <button
                      onClick={() => buyInsurance('full')}
                      disabled={totalMoney < 300}
                      className={`py-2 text-sm rounded transition-all ${
                        totalMoney >= 300
                          ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50 hover:bg-purple-500/30'
                          : 'bg-night-700 text-gray-600 cursor-not-allowed'
                      }`}
                    >
                      全险<br/><span className="text-xs">¥300 100%覆盖</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              找到地图上的🔧修车铺进行维修、保养或购买保险
            </p>
          )}
        </div>

        {(repairRecords.length > 0 || rescueRecords.length > 0 || sessionRepairCost > 0 || sessionRescueCost > 0) && (
          <div className="glass-panel p-3 space-y-2">
            <h4 className="font-medium text-gray-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-400" />
              服务记录
            </h4>
            {(sessionRepairCost > 0 || sessionRescueCost > 0) && (
              <div className="flex justify-between text-xs bg-night-700/50 p-2 rounded">
                <span className="text-gray-400">本次累计支出</span>
                <span className="text-red-400">
                  维修¥{sessionRepairCost} + 救援¥{sessionRescueCost} = ¥{sessionRepairCost + sessionRescueCost}
                </span>
              </div>
            )}
            {vehicle.totalRepairCost > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">历史累计修车费</span>
                <span className="text-gray-400">¥{vehicle.totalRepairCost}</span>
              </div>
            )}
            {repairRecords.slice(-3).reverse().map(record => (
              <div key={record.id} className="text-xs p-2 bg-night-700/30 rounded">
                <div className="flex justify-between">
                  <span className="text-orange-400">🔧 {record.description}</span>
                  <span className="text-red-400">-¥{record.cost}</span>
                </div>
              </div>
            ))}
            {rescueRecords.slice(-2).reverse().map(record => (
              <div key={record.id} className="text-xs p-2 bg-night-700/30 rounded">
                <div className="flex justify-between">
                  <span className="text-yellow-400">🚚 {record.description}</span>
                  <span className="text-red-400">-¥{record.cost}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="glass-panel p-3 space-y-2">
          <h4 className="font-medium text-gray-300 flex items-center gap-2">
            <Coffee className="w-4 h-4 text-yellow-400" />
            骑手驿站
          </h4>
          
          {isAtRestStation ? (
            <div className="space-y-2">
              <p className="text-xs text-yellow-400">✓ 已到达驿站 (0.1元/点)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleRest(20)}
                  disabled={stamina >= player.maxStamina || totalMoney < 2}
                  className={`py-2 text-sm rounded transition-all ${
                    stamina < player.maxStamina && totalMoney >= 2
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +20体力 (¥2)
                </button>
                <button
                  onClick={() => handleRest(50)}
                  disabled={stamina >= player.maxStamina || totalMoney < 5}
                  className={`py-2 text-sm rounded transition-all ${
                    stamina < player.maxStamina && totalMoney >= 5
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                      : 'bg-night-700 text-gray-600 cursor-not-allowed'
                  }`}
                >
                  +50体力 (¥5)
                </button>
              </div>
              <button
                onClick={() => handleRest(player.maxStamina)}
                disabled={stamina >= player.maxStamina || totalMoney < Math.ceil((player.maxStamina - stamina) * 0.1)}
                className={`w-full py-2 text-sm rounded transition-all ${
                  stamina < player.maxStamina && totalMoney >= Math.ceil((player.maxStamina - stamina) * 0.1)
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 hover:bg-yellow-500/30'
                    : 'bg-night-700 text-gray-600 cursor-not-allowed'
                }`}
              >
                完全恢复 (¥{Math.ceil((player.maxStamina - stamina) * 0.1)})
              </button>
            </div>
          ) : (
            <p className="text-xs text-gray-500">
              找到地图上的☕驿站休息恢复体力
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehiclePanel;
