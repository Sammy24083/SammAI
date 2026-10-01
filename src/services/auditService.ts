import { supabase, isLiveSupabaseConfigured, localStore } from '../lib/supabase';
import { AuditLog } from '../types';

export const auditService = {
  /**
   * Log an administrative or operational event
   */
  async logAction(entry: {
    action: 'create' | 'update' | 'delete' | 'delivery' | 'status_change';
    entity: 'product' | 'order' | 'discount' | 'settings' | 'storage';
    entity_id?: string;
    details: string;
    metadata?: Record<string, any>;
    performed_by?: string;
    status?: 'success' | 'failed' | 'warning';
  }): Promise<AuditLog> {
    const newLog: AuditLog = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      action: entry.action,
      entity: entry.entity,
      entity_id: entry.entity_id,
      details: entry.details,
      metadata: entry.metadata || {},
      performed_by: entry.performed_by || 'Admin',
      status: entry.status || 'success',
      synced_to_supabase: false,
      created_at: new Date().toISOString(),
    };

    // 1. Try to record in Supabase
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.from('audit_logs').insert([
          {
            action: newLog.action,
            entity: newLog.entity,
            entity_id: newLog.entity_id,
            details: newLog.details,
            metadata: newLog.metadata,
            performed_by: newLog.performed_by,
            status: newLog.status,
            synced_to_supabase: true,
          }
        ]);

        if (!error) {
          newLog.synced_to_supabase = true;
        } else {
          console.warn('Could not insert into audit_logs table (run audit_logs_setup.sql if not created):', error.message);
        }
      } catch (err: any) {
        console.warn('Supabase audit logging exception:', err.message);
      }
    }

    // 2. Always persist locally so the Admin UI sees it immediately
    const existing = localStore.getAuditLogs();
    const updated = [newLog, ...existing].slice(0, 200); // keep last 200 logs
    localStore.setAuditLogs(updated);

    return newLog;
  },

  /**
   * Retrieve all audit logs from Supabase with fallback to local store
   */
  async getLogs(): Promise<AuditLog[]> {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('audit_logs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);

        if (!error && data && data.length > 0) {
          const mapped: AuditLog[] = data.map((d: any) => ({
            id: d.id,
            action: d.action,
            entity: d.entity,
            entity_id: d.entity_id,
            details: d.details,
            metadata: d.metadata || {},
            performed_by: d.performed_by || 'Admin',
            status: d.status || 'success',
            synced_to_supabase: true,
            created_at: d.created_at,
          }));

          localStore.setAuditLogs(mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('Failed to fetch from Supabase audit_logs:', err);
      }
    }

    return localStore.getAuditLogs();
  },

  /**
   * Ping database and log connection test
   */
  async pingDatabase(): Promise<{
    success: boolean;
    latencyMs: number;
    message: string;
    log: AuditLog;
  }> {
    const startTime = performance.now();
    let isSuccess = false;
    let message = '';

    if (isLiveSupabaseConfigured && supabase) {
      try {
        // Query server time or health
        const { error } = await supabase.from('audit_logs').select('count', { count: 'exact', head: true });
        const latency = Math.round(performance.now() - startTime);

        if (!error) {
          isSuccess = true;
          message = `Connected to Supabase PostgreSQL in ${latency}ms. Table 'audit_logs' verified.`;
        } else {
          isSuccess = false;
          message = `Connected to Supabase, but query returned: ${error.message}`;
        }
      } catch (err: any) {
        const latency = Math.round(performance.now() - startTime);
        isSuccess = false;
        message = `Supabase network/CORS error (${latency}ms): ${err.message}`;
      }
    } else {
      message = 'Supabase client is not configured; using offline storage.';
    }

    const latency = Math.round(performance.now() - startTime);
    const log = await this.logAction({
      action: 'status_change',
      entity: 'settings',
      details: isSuccess
        ? `Database ping successful (${latency}ms latency)`
        : `Database ping check: ${message}`,
      status: isSuccess ? 'success' : 'warning',
      metadata: { latency_ms: latency, is_live: isLiveSupabaseConfigured },
    });

    return {
      success: isSuccess,
      latencyMs: latency,
      message,
      log,
    };
  },

  /**
   * Clear logs
   */
  async clearLogs(): Promise<void> {
    if (isLiveSupabaseConfigured && supabase) {
      try {
        await supabase.from('audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (e) {
        // ignore
      }
    }
    localStore.setAuditLogs([]);
  },
};
