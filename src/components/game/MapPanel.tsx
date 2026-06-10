import { useGameStore } from '../../store/gameStore';
import { MAP_NODES, MAP_WIDTH, MAP_HEIGHT, getNode } from '../../data/mapData';
import { CloudRain, CloudLightning, Cloud, Zap, Coffee } from 'lucide-react';

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
      default:
        return '';
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
    setTargetNode(nodeId);
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

        {MAP_NODES.map(node => (
          <g
            key={node.id}
            onClick={() => handleNodeClick(node.id)}
            className="cursor-pointer transition-all"
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={node.type === 'intersection' ? 8 : 14}
              fill={getNodeColor(node)}
              fillOpacity="0.3"
              stroke={getNodeColor(node)}
              strokeWidth="2"
              filter={node.type !== 'intersection' ? 'url(#glow)' : undefined}
              className="transition-all hover:fill-opacity-50"
            />
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

      <div className="absolute bottom-3 left-3 right-3 flex gap-2 text-xs">
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
      </div>
    </div>
  );
};

export default MapPanel;
