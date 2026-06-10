import { useGameStore } from '../../store/gameStore';
import { MAP_NODES, MAP_WIDTH, MAP_HEIGHT, getNode } from '../../data/mapData';
import { CloudRain, CloudLightning, Cloud, Zap, Coffee, Wrench, AlertTriangle, Mountain, Timer, AlertOctagon, Truck } from 'lucide-react';

const MapPanel = () => {
  const {
    playerPosition,
    currentNodeId,
    currentRoute,
    availableOrders,
    activeOrders,
    weather,
    setTargetNode,
    selectOrder,
    vehicle,
    trafficLights,
    roadEvents,
    isAtTrafficLight,
    currentTrafficLight,
    waitingAtLight,
    runRedLight,
    waitAtLight,
    isBeingRescued,
    rescueProgress,
    rescueTargetNodeId,
  } = useGameStore();

  const getWeatherIcon = () => {
    switch (weather) {
      case 'clear':
        return <Cloud className="w-5 h-5 text-gray-400" />;
      case 'light_rain':
        return <CloudRain className="w-5 h-5 text-blue-400" />;
      case 'heavy_rain':
        return <CloudRain className="w-5 h-5 text-blue-500" />;
      case 'storm':
        return <CloudLightning className="w-5 h-5 text-yellow-400" />;
      default:
        return <Cloud className="w-5 h-5 text-gray-400" />;
    }
  };

  const getWeatherText = () => {
    switch (weather) {
      case 'clear':
        return '晴';
      case 'light_rain':
        return '小雨';
      case 'heavy_rain':
        return '大雨';
      case 'storm':
        return '暴雨';
      default:
        return '晴';
    }
  };

  const getNodeColor = (node: typeof MAP_NODES[0]) => {
    switch (node.type) {
      case 'restaurant':
        return '#ff00aa';
      case 'building':
        return '#00d4ff';
      case 'charging':
        return '#00ff88';
      case 'rest':
        return '#ffcc00';
      case 'repair':
        return '#ff8c00';
      case 'intersection':
        return '#4a5568';
      default:
        return '#718096';
    }
  };

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return '🍜';
      case 'building':
        return '🏢';
      case 'charging':
        return '⚡';
      case 'rest':
        return '☕';
      case 'repair':
        return '🔧';
      default:
        return '';
    }
  };

  const getTrafficLightColor = (nodeId: string) => {
    const light = trafficLights.find(l => l.nodeId === nodeId);
    if (!light) return null;
    switch (light.state) {
      case 'red': return '#ef4444';
      case 'yellow': return '#eab308';
      case 'green': return '#22c55e';
    }
  };

  const getRoadEventIcon = (type: string) => {
    switch (type) {
      case 'flood': return '🌊';
      case 'traffic_jam': return '🚗';
      case 'construction': return '🚧';
      case 'accident': return '⚠️';
      case 'slope': return '⛰️';
      default: return '❓';
    }
  };

  const renderRoute = () => {
    if (currentRoute.length < 2) return null;

    const pathData = currentRoute.map((nodeId, index) => {
      const node = getNode(nodeId);
      if (!node) return '';
      return `${index === 0 ? 'M' : 'L'} ${node.x} ${node.y}`;
    }).join(' ');

    return (
      <path
        d={pathData}
        stroke="#00d4ff"
        strokeWidth="3"
        fill="none"
        strokeDasharray="10,5"
        opacity="0.8"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-30"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    );
  };

  const renderConnections = () => {
    const rendered = new Set<string>();
    
    return MAP_NODES.map(node =>
      node.connections.map(connId => {
        const key = [node.id, connId].sort().join('-');
        if (rendered.has(key)) return null;
        rendered.add(key);
        
        const connNode = getNode(connId);
        if (!connNode) return null;
        
        return (
          <line
            key={key}
            x1={node.x}
            y1={node.y}
            x2={connNode.x}
            y2={connNode.y}
            stroke="#2d3748"
            strokeWidth="4"
            strokeLinecap="round"
          />
        );
      })
    );
  };

  const handleNodeClick = (nodeId: string) => {
    if (nodeId === currentNodeId) return;
    if (isAtTrafficLight || waitingAtLight) return;
    if (isBeingRescued) return;
    setTargetNode(nodeId);
  };

  const renderRoadEvents = () => {
    return roadEvents.map(event => {
      const node = getNode(event.nodeId);
      if (!node) return null;
      return (
        <g key={event.id} className="animate-pulse">
          <circle
            cx={node.x}
            cy={node.y - 30}
            r="12"
            fill="#f97316"
            fillOpacity="0.3"
            stroke="#f97316"
            strokeWidth="2"
          />
          <text
            x={node.x}
            y={node.y - 26}
            textAnchor="middle"
            fontSize="14"
            className="pointer-events-none select-none"
          >
            {getRoadEventIcon(event.type)}
          </text>
        </g>
      );
    });
  };

  return (
    <div className="relative w-full h-full glass-panel overflow-hidden">
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 px-3 py-2 glass-panel">
        {getWeatherIcon()}
        <span className="text-sm text-gray-300">{getWeatherText()}</span>
      </div>

      <div className="absolute top-3 right-3 z-10 px-3 py-2 glass-panel">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-neon-green" />
          <span className="text-sm text-neon-green">
            {Math.round(vehicle.battery)}%
          </span>
        </div>
      </div>

      {isBeingRescued && (
        <div className="absolute top-16 left-3 right-3 z-10 px-3 py-2 glass-panel">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-sm text-orange-400">救援中</span>
            <span className="text-xs text-gray-400 ml-auto">
              {Math.round(rescueProgress * 100)}%
            </span>
          </div>
          <div className="h-1.5 bg-night-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 rounded-full transition-all duration-300"
              style={{ width: `${rescueProgress * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            正在拖往充电站...
          </p>
        </div>
      )}

      {!isBeingRescued && roadEvents.length > 0 && (
        <div className="absolute top-16 left-3 z-10 px-3 py-2 glass-panel max-w-[200px]">
          <div className="flex items-center gap-1 text-xs text-orange-400 mb-1">
            <AlertTriangle className="w-3 h-3" />
            <span>路况事件</span>
          </div>
          {roadEvents.slice(0, 2).map(event => (
            <div key={event.id} className="text-xs text-gray-400">
              {getRoadEventIcon(event.type)} {event.description}
            </div>
          ))}
        </div>
      )}

      {waitingAtLight && currentTrafficLight && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 px-4 py-2 glass-panel">
          <div className="flex items-center gap-2">
          <Timer className="w-4 h-4 text-yellow-400 animate-pulse" />
          <span className="text-sm text-yellow-400">
            等待绿灯... {Math.ceil(currentTrafficLight.timer)}秒
          </span>
        </div>
      </div>
      )}

      <svg
        className="w-full h-full"
        viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <radialGradient id="bgGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#0f1f38" />
            <stop offset="100%" stopColor="#050a14" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <rect width={MAP_WIDTH} height={MAP_HEIGHT} fill="url(#bgGradient)" />

        {renderConnections()}
        {renderRoute()}
        {renderRoadEvents()}

        {MAP_NODES.map(node => (
          <g
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className="cursor-pointer transition-all"
          >
            {node.isSlope && (
              <text
                x={node.x - 20}
                y={node.y - 15}
                textAnchor="middle"
                fontSize="12"
                className="pointer-events-none select-none"
              >
                ⛰️
              </text>
            )}
            
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'intersection' ? 12 : 14}
              fill={getNodeColor(node)}
              fillOpacity="0.3"
              stroke={getNodeColor(node)}
              strokeWidth="2"
              filter={node.type !== 'intersection' ? 'url(#glow)' : undefined}
              className="transition-all hover:fill-opacity-50"
            />
            
            {node.hasTrafficLight && (
              <>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="6"
                  fill={getTrafficLightColor(node.id) || '#4a5568'}
                  className="transition-colors duration-300"
                  filter="url(#glow)"
                />
                <circle
                  cx={node.x}
                  cy={node.y}
                  r="18"
                  fill="none"
                  stroke={getTrafficLightColor(node.id) || '#4a5568'}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                  opacity="0.5"
                />
              </>
            )}
            
            {node.type !== 'intersection' && (
              <text
                x={node.x}
                y={node.y + 5}
                textAnchor="middle"
                fontSize="14"
                className="pointer-events-none select-none"
              >
                {getNodeIcon(node.type)}
              </text>
            )}
            {node.name && node.type !== 'intersection' && (
              <text
                x={node.x}
                y={node.y + 28}
                textAnchor="middle"
                fontSize="10"
                fill="#a0aec0"
                className="pointer-events-none select-none"
              >
                {node.name}
              </text>
            )}
          </g>
        ))}

        {availableOrders.map(order => (
          <g key={`avail-${order.id}`}>
            <circle
              cx={order.pickupLocation.x}
              cy={order.pickupLocation.y - 25}
              r="10"
              fill="#ffcc00"
              fillOpacity="0.2"
              stroke="#ffcc00"
              strokeWidth="2"
              className="animate-pulse"
            />
            <text
              x={order.pickupLocation.x}
              y={order.pickupLocation.y - 22}
              textAnchor="middle"
              fontSize="12"
              fill="#ffcc00"
              className="pointer-events-none select-none font-bold"
            >
              ¥{order.reward}
            </text>
          </g>
        ))}

        {activeOrders.map(order => (
          <g key={`active-${order.id}`}>
            {order.status === 'accepted' && (
              <circle
                cx={order.pickupLocation.x}
                cy={order.pickupLocation.y - 25}
                r="12"
                fill="#00ff88"
                fillOpacity="0.3"
                stroke="#00ff88"
                strokeWidth="2"
                className="animate-pulse"
              />
            )}
            {order.status === 'picked' && (
              <>
                <circle
                  cx={order.dropoffLocation.x}
                  cy={order.dropoffLocation.y - 25}
                  r="12"
                  fill="#ff00aa"
                  fillOpacity="0.3"
                  stroke="#ff00aa"
                  strokeWidth="2"
                  className="animate-pulse"
                />
                <text
                  x={order.dropoffLocation.x}
                  y={order.dropoffLocation.y - 21}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#ff00aa"
                  className="pointer-events-none select-none"
                >
                  送
                </text>
              </>
            )}
          </g>
        ))}

        <g filter="url(#glow)">
          <circle
            cx={playerPosition.x}
            cy={playerPosition.y}
            r="18"
            fill="#00d4ff"
            fillOpacity="0.3"
          />
          <circle
            cx={playerPosition.x}
            cy={playerPosition.y}
            r="10"
            fill="#00d4ff"
          />
          <text
            x={playerPosition.x}
            y={playerPosition.y + 4}
            textAnchor="middle"
            fontSize="12"
            className="pointer-events-none select-none"
          >
            🏍️
          </text>
        </g>
      </svg>

      {isAtTrafficLight && currentTrafficLight && !waitingAtLight && (
        <div className="absolute inset-0 bg-black/60 z-20 flex items-center justify-center">
          <div className="glass-panel p-6 max-w-sm w-full mx-4 animate-pulse">
            <div className="text-center mb-4">
              <div className="w-20 h-20 mx-auto mb-3 rounded-full flex items-center justify-center"
                style={{ 
                  backgroundColor: currentTrafficLight.state === 'red' ? 'rgba(239,68,68,0.2)' : 'rgba(234,179,8,0.2)',
                  border: `3px solid ${currentTrafficLight.state === 'red' ? '#ef4444' : '#eab308'}`
                }}
              >
                <span className="text-4xl">🚦</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">
                {currentTrafficLight.state === 'red' ? '红灯' : '黄灯'}
              </h3>
              <p className="text-sm text-gray-400">
                等待约 {Math.ceil(currentTrafficLight.timer)} 秒变绿
              </p>
            </div>
            
            <div className="space-y-2">
              <button
                onClick={waitAtLight}
                className="w-full py-3 rounded-lg bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Timer className="w-5 h-5" />
                等待绿灯（安全）
              </button>
              <button
                onClick={runRedLight}
                className="w-full py-3 rounded-lg bg-red-500/20 text-red-400 border border-red-500/50 hover:bg-red-500/30 transition-all flex items-center justify-center gap-2"
              >
                <AlertOctagon className="w-5 h-5" />
                冒险闯灯（有风险）
              </button>
            </div>
            
            <p className="text-xs text-gray-500 text-center mt-4">
              闯灯可能：罚款¥50、声誉-5、车辆损伤
            </p>
          </div>
        </div>
      )}

      {waitingAtLight && currentTrafficLight && (
        <div className="absolute inset-0 bg-black/40 z-20 flex items-center justify-center pointer-events-none">
          <div className="glass-panel p-6 max-w-sm w-full mx-4">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center bg-yellow-500/20 border-2 border-yellow-500">
                <Timer className="w-8 h-8 text-yellow-400 animate-pulse" />
              </div>
              <h3 className="text-lg font-bold text-yellow-400 mb-1">等待绿灯中...</h3>
              <div className="text-3xl font-mono text-white mb-2">
                {Math.ceil(currentTrafficLight.timer)}
              </div>
              <p className="text-sm text-gray-400">秒后自动通行</p>
              <div className="mt-4 h-2 bg-night-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-yellow-500 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.max(0, (1 - currentTrafficLight.timer / currentTrafficLight.maxTimer)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <span className="w-3 h-3 rounded-full bg-pink-500"></span>
          <span className="text-gray-400">餐厅</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <span className="w-3 h-3 rounded-full bg-blue-400"></span>
          <span className="text-gray-400">小区</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <span className="w-3 h-3 rounded-full bg-green-400"></span>
          <span className="text-gray-400">充电站</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <Coffee className="w-3 h-3 text-yellow-400" />
          <span className="text-gray-400">休息站</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <Wrench className="w-3 h-3 text-orange-400" />
          <span className="text-gray-400">修车铺</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <Mountain className="w-3 h-3 text-gray-400" />
          <span className="text-gray-400">坡道</span>
        </div>
        <div className="flex items-center gap-1 px-2 py-1 glass-panel">
          <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-gray-400">红绿灯</span>
        </div>
      </div>
    </div>
  );
};

export default MapPanel;
