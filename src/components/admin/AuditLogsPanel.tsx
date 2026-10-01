import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { auditService } from '../../services/auditService';
import { isLiveSupabaseConfigured } from '../../lib/supabase';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  RefreshCw,
  Search,
  Trash2,
  Filter,
  Check,
  Zap,
  Clock,
  Shield,
  Code
} from 'lucide-react';

interface AuditLogsPanelProps {
  logs: AuditLog[];
  onRefresh: () => Promise<void>;
}

export const AuditLogsPanel: React.FC<AuditLogsPanelProps> = ({ logs, onRefresh }) => {
  const [filterAction, setFilterAction] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [pingResult, setPingResult] = useState<{
    success: boolean;
    latencyMs: number;
    message: string;
  } | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const handlePingDatabase = async () => {
    setIsPinging(true);
    try {
      const result = await auditService.pingDatabase();
      setPingResult({
        success: result.success,
        latencyMs: result.latencyMs,
        message: result.message,
      });
      await onRefresh();
    } catch (err: any) {
      setPingResult({
        success: false,
        latencyMs: 0,
        message: err.message || 'Database ping failed',
      });
    } finally {
      setIsPinging(false);
    }
  };

  const handleClearLogs = async () => {
    if (confirm('Are you sure you want to clear the audit logs history?')) {
      await auditService.clearLogs();
      await onRefresh();
    }
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterStatus !== 'all' && log.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDetails = log.details.toLowerCase().includes(q);
      const matchEntity = log.entity.toLowerCase().includes(q);
      const matchUser = log.performed_by.toLowerCase().includes(q);
      const matchId = log.entity_id ? log.entity_id.toLowerCase().includes(q) : false;
      return matchDetails || matchEntity || matchUser || matchId;
    }
    return true;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'delete':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
            DELETE
          </span>
        );
      case 'update':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
            UPDATE
          </span>
        );
      case 'create':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            CREATE
          </span>
        );
      case 'delivery':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
            DELIVERY
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-slate-800 text-slate-300">
            {action}
          </span>
        );
    }
  };

  const getStatusIcon = (status: string, synced: boolean) => {
    if (status === 'success') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (status === 'warning') {
      return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
    }
    return <XCircle className="w-4 h-4 text-red-400 shrink-0" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Diagnostics & Action Bar */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs uppercase tracking-wider font-extrabold text-emerald-400">
              SUPABASE AUDIT &amp; TELEMETRY LOGS
            </span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Database Activity &amp; Request Tracking</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitors product deletions, catalog updates, orders, and verifies whether requests reach your Supabase PostgreSQL database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handlePingDatabase}
            disabled={isPinging}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-750 flex items-center gap-1.5 disabled:opacity-60"
            title="Ping Supabase database to measure latency and verify audit_logs table"
          >
            <Database className={`w-3.5 h-3.5 ${isPinging ? 'animate-bounce text-emerald-400' : 'text-emerald-400'}`} />
            <span>{isPinging ? 'Pinging DB...' : 'Test DB Ping'}</span>
          </button>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold transition-all border border-slate-750 flex items-center gap-1.5 disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleClearLogs}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 text-xs font-semibold transition-all border border-slate-750 flex items-center gap-1.5"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ping Result Banner if active */}
      {pingResult && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
            pingResult.success
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {pingResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {pingResult.success ? 'Supabase Connection Verified' : 'Supabase Ping Notice'}
              </span>
              <p className="opacity-90 mt-0.5">{pingResult.message}</p>
            </div>
          </div>
          {pingResult.latencyMs > 0 && (
            <span className="px-2 py-1 rounded bg-black/40 font-mono text-[11px] font-bold shrink-0">
              {pingResult.latencyMs} ms
            </span>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:max-w-xs">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search logs by action, item, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          {/* Action Filter */}
          <select
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Actions</option>
            <option value="delete">Deletions (DELETE)</option>
            <option value="update">Updates (UPDATE)</option>
            <option value="create">Creations (CREATE)</option>
            <option value="delivery">Delivery (FULFILL)</option>
            <option value="status_change">System / Pings</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="success">Success</option>
            <option value="warning">Warning / Partial</option>
            <option value="failed">Failed</option>
          </select>

          <span className="text-xs text-slate-500 font-mono ml-2 whitespace-nowrap">
            {filteredLogs.length} events
          </span>
        </div>
      </div>

      {/* Logs Table / List */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 space-y-2">
            <Activity className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-slate-400">No audit logs matching criteria</p>
            <p className="text-xs text-slate-500">
              Perform an action (create, update, delete a product, or test DB ping) to see records here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredLogs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

              return (
                <div key={log.id} className="p-4 sm:p-5 hover:bg-slate-850/50 transition-colors space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(log.status, log.synced_to_supabase)}
                      {getActionBadge(log.action)}
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        {log.entity}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px]">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        {' · '}
                        {new Date(log.created_at).toLocaleDateString()}
                      </span>

                      {/* Supabase Sync Badge */}
                      {log.synced_to_supabase ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Check className="w-3 h-3" />
                          <span>Synced to Supabase</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          <span>Local Store</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Details Line */}
                  <div className="flex items-start justify-between gap-4 pt-1">
                    <p className="text-xs sm:text-sm text-slate-200 font-medium">
                      {log.details}
                    </p>

                    {hasMetadata && (
                      <button
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Code className="w-3 h-3" />
                        <span>{isExpanded ? 'Hide Payload' : 'View Payload'}</span>
                      </button>
                    )}
                  </div>

                  {/* Expandable JSON Metadata */}
                  {isExpanded && hasMetadata && (
                    <div className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 overflow-x-auto">
                      <div className="text-[10px] text-slate-500 font-mono mb-1">
                        Metadata &amp; Database Trace Payload:
                      </div>
                      <pre className="text-[11px] font-mono text-emerald-400 whitespace-pre-wrap">
                        {JSON.stringify(log.metadata, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
