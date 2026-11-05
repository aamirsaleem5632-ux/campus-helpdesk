import { useState, useEffect } from 'react';
import { apiClient } from '../services/api';

export default function AgentActivitySection({ isDark }) {
  const [agentStatus, setAgentStatus] = useState(null);
  const [workflows, setWorkflows] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statusRes, workflowsRes, auditRes] = await Promise.all([
        apiClient.getAgentStatus().catch(() => null),
        apiClient.getWorkflowTraces(15).catch(() => ({ workflows: [] })),
        apiClient.getAuditLogs(20).catch(() => ({ auditLogs: [] }))
      ]);

      if (statusRes) setAgentStatus(statusRes);
      if (workflowsRes?.workflows) setWorkflows(workflowsRes.workflows);
      if (auditRes?.auditLogs) setAuditLogs(auditRes.auditLogs);
    } catch (err) {
      console.error('Error fetching agent activity:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const runFetch = async () => {
      try {
        const [statusRes, workflowsRes, auditRes] = await Promise.all([
          apiClient.getAgentStatus().catch(() => null),
          apiClient.getWorkflowTraces(15).catch(() => ({ workflows: [] })),
          apiClient.getAuditLogs(20).catch(() => ({ auditLogs: [] }))
        ]);

        if (isMounted) {
          if (statusRes) setAgentStatus(statusRes);
          if (workflowsRes?.workflows) setWorkflows(workflowsRes.workflows);
          if (auditRes?.auditLogs) setAuditLogs(auditRes.auditLogs);
        }
      } catch (err) {
        console.error('Error fetching agent activity:', err);
      }
    };

    runFetch();

    let interval = null;
    if (autoRefresh) {
      interval = setInterval(runFetch, 8000); // 8-second live poll
    }
    return () => {
      isMounted = false;
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const cardBg = isDark ? '#111827' : '#ffffff';
  const innerBg = isDark ? '#0b0f19' : '#f8fafc';
  const borderColor = isDark ? '#1f2937' : '#e2e8f0';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const mutedText = isDark ? '#9ca3af' : '#6b7280';

  const defaultAgents = [
    { name: 'Manager / Orchestrator Agent', role: 'Task Planner & Synthesis', status: 'IDLE', lastLatencyMs: 0 },
    { name: 'Classification Agent', role: 'Category & Nature', status: 'IDLE', lastLatencyMs: 0 },
    { name: 'Priority Agent', role: 'Urgency & Deadlines', status: 'IDLE', lastLatencyMs: 0 },
    { name: 'Resolution Agent', role: 'Grounded KB & FAQs', status: 'IDLE', lastLatencyMs: 0 },
    { name: 'Routing Agent', role: 'Department & SLA', status: 'IDLE', lastLatencyMs: 0 },
    { name: 'Validation Agent', role: 'QA & Safety Auditor', status: 'IDLE', lastLatencyMs: 0 }
  ];

  const agentsList = agentStatus?.agents || defaultAgents;
  const metrics = agentStatus?.geminiMetrics || {
    totalRequests: 0,
    successfulRequests: 0,
    rateLimitedRequests: 0,
    lastLatencyMs: 0,
    activeModel: 'gemini-2.5-flash',
    isConfigured: false
  };

  return (
    <div style={{ marginTop: '32px' }}>
      {/* Header bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>🤖</span>
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: textColor }}>
              AI Multi-Agent Live Activity & Telemetry
            </h3>
            <span style={{
              fontSize: '11px',
              padding: '2px 8px',
              borderRadius: '999px',
              backgroundColor: metrics.isConfigured ? '#05966922' : '#d9770622',
              color: metrics.isConfigured ? '#10b981' : '#f59e0b',
              fontWeight: '600',
              border: `1px solid ${metrics.isConfigured ? '#10b98144' : '#f59e0b44'}`
            }}>
              {metrics.isConfigured ? `Gemini API: Connected (${metrics.activeModel})` : 'Gemini: Free Tier Ready (Fallback Active)'}
            </span>
          </div>
          <p style={{ fontSize: '13px', color: mutedText, margin: '4px 0 0 0' }}>
            Real-time execution states, parallel dispatch metrics, and complete workflow traces.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setAutoRefresh(!autoRefresh)}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              border: `1px solid ${borderColor}`,
              backgroundColor: autoRefresh ? '#2563eb22' : innerBg,
              color: autoRefresh ? '#3b82f6' : mutedText,
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {autoRefresh ? '● Live Polling (8s)' : '○ Polling Paused'}
          </button>
          <button
            type="button"
            onClick={fetchDashboardData}
            disabled={loading}
            style={{
              padding: '6px 12px',
              fontSize: '12px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            {loading ? 'Refreshing...' : '🔄 Refresh Now'}
          </button>
        </div>
      </div>

      {/* 6 Specialized Agents Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '14px',
        marginBottom: '24px'
      }}>
        {agentsList.map((agent) => {
          const isSuccess = agent.status === 'COMPLETED' || agent.status === 'SUCCESS';
          const isActive = agent.status === 'ACTIVE';
          const isError = agent.status === 'ERROR';

          const statusBadgeBg = isActive ? '#2563eb22' : isSuccess ? '#05966922' : isError ? '#dc262622' : '#6b728022';
          const statusBadgeColor = isActive ? '#60a5fa' : isSuccess ? '#34d399' : isError ? '#f87171' : '#9ca3af';

          return (
            <div key={agent.name} style={{
              backgroundColor: cardBg,
              border: `1px solid ${borderColor}`,
              borderRadius: '10px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: textColor }}>
                    {agent.name}
                  </h4>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: statusBadgeBg,
                    color: statusBadgeColor
                  }}>
                    {agent.status}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: mutedText, margin: 0 }}>
                  {agent.role}
                </p>
              </div>

              <div style={{
                marginTop: '14px',
                paddingTop: '10px',
                borderTop: `1px solid ${borderColor}`,
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '11px',
                color: mutedText
              }}>
                <span>Last Latency:</span>
                <strong style={{ color: textColor }}>{agent.lastLatencyMs || 0} ms</strong>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gemini API Quota & Telemetry Banner */}
      <div style={{
        backgroundColor: innerBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '16px'
      }}>
        <div>
          <div style={{ fontSize: '11px', color: mutedText, textTransform: 'uppercase', fontWeight: '600' }}>Total Invocations</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>{metrics.totalRequests || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: mutedText, textTransform: 'uppercase', fontWeight: '600' }}>Successful Generations</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#059669' }}>{metrics.successfulRequests || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: mutedText, textTransform: 'uppercase', fontWeight: '600' }}>Rate Limit Retries</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>{metrics.rateLimitedRequests || 0}</div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: mutedText, textTransform: 'uppercase', fontWeight: '600' }}>Avg Model Latency</div>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: textColor }}>{metrics.lastLatencyMs || 0} ms</div>
        </div>
      </div>

      {/* Real Workflow History Traces */}
      <div style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h4 style={{ fontSize: '16px', fontWeight: 'bold', margin: 0, color: textColor }}>
              📜 Real Multi-Agent Workflow Runs
            </h4>
            <p style={{ fontSize: '12px', color: mutedText, margin: '2px 0 0 0' }}>
              Historical traces recorded by the Manager Orchestrator with parallel dispatch durations.
            </p>
          </div>
          <span style={{ fontSize: '12px', color: mutedText }}>
            Showing {workflows.length} recent runs
          </span>
        </div>

        {workflows.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '32px',
            color: mutedText,
            fontSize: '13px'
          }}>
            No multi-agent workflow runs recorded yet. Use the <strong>"+ Submit Issue"</strong> form with <strong>"Analyze with Multi-Agent AI"</strong> to trigger real orchestrations!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {workflows.map((wf) => {
              const isSelected = selectedWorkflow?.id === wf.id;

              return (
                <div
                  key={wf.id}
                  style={{
                    backgroundColor: innerBg,
                    border: `1px solid ${isSelected ? '#2563eb' : borderColor}`,
                    borderRadius: '8px',
                    padding: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setSelectedWorkflow(isSelected ? null : wf)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '13px' }}>{wf.id}</span>
                      <strong style={{ fontSize: '14px', color: textColor }}>{wf.title}</strong>
                      <span style={{ fontSize: '11px', color: mutedText }}>({wf.requesterEmail})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        backgroundColor: '#2563eb22',
                        color: '#60a5fa'
                      }}>
                        {wf.summary?.category || 'General'}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: '600',
                        backgroundColor: wf.summary?.priority === 'Critical' || wf.summary?.priority === 'High' ? '#dc262622' : '#05966922',
                        color: wf.summary?.priority === 'Critical' || wf.summary?.priority === 'High' ? '#f87171' : '#34d399'
                      }}>
                        {wf.summary?.priority || 'Medium'}
                      </span>
                      <span style={{ fontSize: '11px', color: mutedText }}>
                        ⚡ Total: {wf.totalDurationMs}ms (Parallel: {wf.parallelDurationMs}ms)
                      </span>
                      <span style={{ fontSize: '12px', color: '#2563eb' }}>
                        {isSelected ? '▲ Collapse' : '▼ Inspect Steps'}
                      </span>
                    </div>
                  </div>

                  {/* Expanded Step-by-Step Telemetry */}
                  {isSelected && (
                    <div style={{
                      marginTop: '16px',
                      paddingTop: '14px',
                      borderTop: `1px solid ${borderColor}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: textColor }}>
                        Detailed Step Execution Trace ({wf.steps?.length || 0} Phases):
                      </div>

                      {wf.steps?.map((step, idx) => (
                        <div key={idx} style={{
                          backgroundColor: cardBg,
                          border: `1px solid ${borderColor}`,
                          borderRadius: '6px',
                          padding: '10px 14px'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 'bold', fontSize: '12px', color: '#2563eb' }}>
                                Phase {idx + 1}: {step.agent}
                              </span>
                              <span style={{ fontSize: '11px', color: mutedText }}>({step.phase})</span>
                            </div>
                            <span style={{ fontSize: '11px', color: mutedText, fontWeight: '600' }}>
                              {step.latencyMs} ms
                            </span>
                          </div>

                          <pre style={{
                            margin: 0,
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: isDark ? '#00000044' : '#f1f5f9',
                            color: textColor,
                            fontSize: '11px',
                            overflowX: 'auto',
                            fontFamily: 'monospace'
                          }}>
                            {JSON.stringify(step.output, null, 2)}
                          </pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Security & Audit Logs Section */}
      <div style={{
        backgroundColor: cardBg,
        border: `1px solid ${borderColor}`,
        borderRadius: '10px',
        padding: '20px',
        marginTop: '24px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0, color: textColor }}>
            🛡️ Security & Action Audit Trail
          </h4>
          <span style={{ fontSize: '11px', color: mutedText }}>
            Enforced student isolation & verified complaint creation logs
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {auditLogs.slice(0, 8).map((log) => (
            <div key={log.id} style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              backgroundColor: innerBg,
              borderRadius: '6px',
              fontSize: '12px',
              border: `1px solid ${borderColor}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontWeight: 'bold',
                  color: log.action.includes('CREATED') ? '#10b981' : '#3b82f6'
                }}>
                  {log.action}
                </span>
                <span style={{ color: textColor }}>Target: <strong>{log.targetId}</strong></span>
                <span style={{ color: mutedText }}>by {log.actor}</span>
              </div>
              <span style={{ fontSize: '11px', color: mutedText }}>
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
