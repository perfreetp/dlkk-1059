import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { 
  MessageSquare, User, Settings, AlertCircle, FileText, 
  ShieldCheck, CheckCircle2, XCircle, Clock, Send, X
} from 'lucide-react';
import type { Message, Order } from '../../types';

const MessageBubble = ({ message }: { message: Message }) => {
  const getTypeIcon = () => {
    switch (message.type) {
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'customer':
        return <User className="w-4 h-4" />;
      case 'story':
        return <MessageSquare className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      case 'appeal':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getTypeColor = () => {
    switch (message.type) {
      case 'system':
        return 'bg-neon-blue/10 border-neon-blue/30 text-neon-blue';
      case 'customer':
        return 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink';
      case 'story':
        return 'bg-neon-yellow/10 border-neon-yellow/30 text-neon-yellow';
      case 'report':
        return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'appeal':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      default:
        return 'bg-night-700 border-night-600 text-gray-300';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`p-3 rounded-lg border ${getTypeColor()} ${!message.read ? 'ring-1 ring-neon-blue/50' : ''}`}>
      <div className="flex items-start gap-2">
        <div className="mt-0.5">{getTypeIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="font-medium text-sm">{message.sender}</span>
            <span className="text-xs opacity-60">{formatTime(message.timestamp)}</span>
          </div>
          <p className="text-sm text-gray-300 break-words">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

const ReportForm = ({ 
  order, 
  onSubmit, 
  onClose,
  type 
}: { 
  order: Order; 
  onSubmit: (reason: string, description: string) => void; 
  onClose: () => void;
  type: 'report' | 'appeal';
}) => {
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');

  const reportReasons = [
    '路面积水绕路',
    '交通拥堵延误',
    '商家出餐慢',
    '顾客地址难找',
    '车辆故障',
    '天气原因',
  ];

  const appealReasons = [
    '非骑手原因超时',
    '顾客恶意差评',
    '餐品问题非骑手责任',
    '系统定位错误',
    '已按备注处理',
  ];

  const reasons = type === 'report' ? reportReasons : appealReasons;
  const title = type === 'report' ? '异常报备' : '差评申诉';
  const colorClass = type === 'report' ? 'text-orange-400' : 'text-purple-400';
  const btnClass = type === 'report' 
    ? 'bg-orange-500/20 text-orange-400 border-orange-500/50 hover:bg-orange-500/30'
    : 'bg-purple-500/20 text-purple-400 border-purple-500/50 hover:bg-purple-500/30';

  return (
    <div className="glass-panel p-4 border border-night-600/50">
      <div className="flex justify-between items-center mb-3">
        <h4 className={`font-bold ${colorClass}`}>
          {type === 'report' ? <FileText className="w-4 h-4 inline mr-1" /> : <ShieldCheck className="w-4 h-4 inline mr-1" />}
          {title}
        </h4>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="text-xs text-gray-400 mb-3">
        订单: {order.restaurant} → {order.customer}
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">选择原因</label>
          <div className="grid grid-cols-2 gap-1">
            {reasons.map(r => (
              <button
                key={r}
                onClick={() => setReason(r)}
                className={`text-xs px-2 py-1.5 rounded border transition-all ${
                  reason === r
                    ? btnClass
                    : 'bg-night-700 text-gray-400 border-night-600 hover:border-night-500'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-xs text-gray-400 mb-1 block">详细说明</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请补充说明情况..."
            className="w-full h-20 bg-night-800 border border-night-600 rounded px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-neon-blue resize-none"
          />
        </div>

        <button
          onClick={() => reason && onSubmit(reason, description)}
          disabled={!reason}
          className={`w-full py-2 rounded text-sm flex items-center justify-center gap-1 transition-all ${
            reason ? btnClass : 'bg-night-700 text-gray-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
          提交{title}
        </button>
      </div>
    </div>
  );
};

const MessagesPanel = () => {
  const { 
    messages, 
    markMessageRead, 
    unreadMessageCount,
    submitReport,
    submitAppeal,
    failedOrders,
    deliveredOrders,
    player,
  } = useGameStore();

  const [showReportForm, setShowReportForm] = useState<string | null>(null);
  const [showAppealForm, setShowAppealForm] = useState<string | null>(null);

  const eligibleForReport = [...failedOrders, ...deliveredOrders.filter(o => o.hasIssue)];
  const eligibleForAppeal = [...failedOrders, ...deliveredOrders.filter(o => (o.rating || 5) <= 2)];

  const handleSubmitReport = (orderId: string, reason: string, description: string) => {
    submitReport(orderId, reason, description);
    setShowReportForm(null);
  };

  const handleSubmitAppeal = (orderId: string, reason: string, description: string) => {
    submitAppeal(orderId, reason, description);
    setShowAppealForm(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
            <Clock className="w-3 h-3" />处理中
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded">
            <CheckCircle2 className="w-3 h-3" />通过
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/20 text-red-400 rounded">
            <XCircle className="w-3 h-3" />未通过
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel">
      <div className="p-3 border-b border-night-600/50 flex justify-between items-center">
        <h2 className="text-lg font-bold text-neon-yellow neon-text-yellow">💬 消息</h2>
        {unreadMessageCount > 0 && (
          <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
            {unreadMessageCount}
          </span>
        )}
      </div>

      {(eligibleForReport.length > 0 || eligibleForAppeal.length > 0 || player.reports.length > 0 || player.appeals.length > 0) && (
        <div className="p-3 border-b border-night-600/50 space-y-3 max-h-64 overflow-y-auto">
          {eligibleForReport.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-orange-400 mb-2 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />可报备订单
              </h4>
              <div className="space-y-1">
                {eligibleForReport.filter(o => !player.reports.find(r => r.orderId === o.id)).map(order => (
                  <div key={order.id} className="flex justify-between items-center text-xs bg-night-800/50 rounded px-2 py-1.5">
                    <span className="text-gray-400 truncate flex-1">
                      {order.restaurant} → {order.customer}
                      {order.issueType && <span className="text-red-400 ml-1">({order.issueType === 'late' ? '超时' : order.issueType === 'cold' ? '餐凉' : '备注'})</span>}
                    </span>
                    <button
                      onClick={() => setShowReportForm(showReportForm === order.id ? null : order.id)}
                      className="ml-2 px-2 py-0.5 text-orange-400 border border-orange-500/30 rounded hover:bg-orange-500/10"
                    >
                      报备
                    </button>
                  </div>
                ))}
              </div>
              {showReportForm && (
                <div className="mt-2">
                  {eligibleForReport.filter(o => !player.reports.find(r => r.orderId === o.id) && o.id === showReportForm).map(order => (
                    <ReportForm
                      key={order.id}
                      order={order}
                      type="report"
                      onSubmit={(reason, desc) => handleSubmitReport(order.id, reason, desc)}
                      onClose={() => setShowReportForm(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {eligibleForAppeal.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-purple-400 mb-2 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />可申诉订单
              </h4>
              <div className="space-y-1">
                {eligibleForAppeal.filter(o => !player.appeals.find(a => a.orderId === o.id)).map(order => (
                  <div key={order.id} className="flex justify-between items-center text-xs bg-night-800/50 rounded px-2 py-1.5">
                    <span className="text-gray-400 truncate flex-1">
                      {order.restaurant} → {order.customer}
                      <span className="text-yellow-400 ml-1">({order.rating || 0}星)</span>
                    </span>
                    <button
                      onClick={() => setShowAppealForm(showAppealForm === order.id ? null : order.id)}
                      className="ml-2 px-2 py-0.5 text-purple-400 border border-purple-500/30 rounded hover:bg-purple-500/10"
                    >
                      申诉
                    </button>
                  </div>
                ))}
              </div>
              {showAppealForm && (
                <div className="mt-2">
                  {eligibleForAppeal.filter(o => !player.appeals.find(a => a.orderId === o.id) && o.id === showAppealForm).map(order => (
                    <ReportForm
                      key={order.id}
                      order={order}
                      type="appeal"
                      onSubmit={(reason, desc) => handleSubmitAppeal(order.id, reason, desc)}
                      onClose={() => setShowAppealForm(null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {(player.reports.length > 0 || player.appeals.length > 0) && (
            <div>
              <h4 className="text-xs font-medium text-gray-400 mb-2">历史记录</h4>
              <div className="space-y-1">
                {player.reports.slice(-3).reverse().map(report => (
                  <div key={report.id} className="text-xs bg-night-800/50 rounded px-2 py-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-orange-400">报备: {report.reason}</span>
                      {getStatusBadge(report.status)}
                    </div>
                    {report.result && <div className="text-gray-500 mt-0.5">{report.result}</div>}
                  </div>
                ))}
                {player.appeals.slice(-3).reverse().map(appeal => (
                  <div key={appeal.id} className="text-xs bg-night-800/50 rounded px-2 py-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-400">申诉: {appeal.reason}</span>
                      {getStatusBadge(appeal.status)}
                    </div>
                    {appeal.result && <div className="text-gray-500 mt-0.5">{appeal.result}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-2">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-30" />
            <p>暂无消息</p>
          </div>
        ) : (
          messages.map(message => (
            <div
              key={message.id}
              onClick={() => !message.read && markMessageRead(message.id)}
            >
              <MessageBubble message={message} />
            </div>
          ))
        )}
      </div>

      <div className="p-3 border-t border-night-600/50">
        <div className="flex gap-2 text-xs text-gray-500 flex-wrap">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-blue"></div>
            <span>系统</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
            <span>顾客</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-neon-yellow"></div>
            <span>剧情</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-orange-400"></div>
            <span>报备</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span>申诉</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
