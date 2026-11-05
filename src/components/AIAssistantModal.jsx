import { useState } from 'react';
import { apiClient } from '../services/api';

export default function AIAssistantModal({
  isOpen,
  onClose,
  problemDescription,
  location,
  title,
  currentUser,
  onComplaintCreated,
  isDark
}) {
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [confirming, setConfirming] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [createdTicketInfo, setCreatedTicketInfo] = useState(null);

  if (!isOpen) return null;

  const cardBg = isDark ? '#111827' : '#ffffff';
  const innerBg = isDark ? '#0b0f19' : '#f8fafc';
  const borderColor = isDark ? '#1f2937' : '#e2e8f0';
  const textColor = isDark ? '#f3f4f6' : '#1f2937';
  const mutedText = isDark ? '#9ca3af' : '#6b7280';

  const handleStartAnalysis = async () => {
    setAnalyzing(true);
    setErrorMessage('');
    setAnalysisResult(null);
    setCreatedTicketInfo(null);

    try {
      const result = await apiClient.analyzeWithAgents({
        problemDescription,
        location,
        title,
        studentToken: currentUser?.token,
        studentEmail: currentUser?.email,
        studentId: currentUser?.studentId
      });

      setAnalysisResult(result);
    } catch (err) {
      console.error('Multi-agent analysis error:', err);
      setErrorMessage(err.message || 'Failed to complete AI multi-agent analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleConfirmAndSubmit = async () => {
    if (!analysisResult?.pendingComplaintDraft) return;

    setConfirming(true);
    setErrorMessage('');

    try {
      const res = await apiClient.confirmAndCreateComplaint({
        complaintDraft: analysisResult.pendingComplaintDraft,
        studentToken: currentUser?.token,
        studentEmail: currentUser?.email,
        studentId: currentUser?.studentId
      });

      setCreatedTicketInfo(res.complaint);
      if (onComplaintCreated) {
        onComplaintCreated(res.complaint);
      }
    } catch (err) {
      console.error('Complaint confirmation error:', err);
      setErrorMessage(err.message || 'Failed to submit official complaint.');
    } finally {
      setConfirming(false);
    }
  };

  const analysis = analysisResult?.analysis;
  const manager = analysis?.manager;
  const classification = analysis?.classification;
  const priority = analysis?.priority;
  const resolution = analysis?.resolution;
  const routing = analysis?.routing;
  const validation = analysis?.validation;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: cardBg,
        borderRadius: '14px',
        border: `1px solid ${borderColor}`,
        width: '100%',
        maxWidth: '750px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: `1px solid ${borderColor}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🤖</span>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: textColor }}>
                AI Multi-Agent Advisory & Triage
              </h3>
              <p style={{ fontSize: '12px', color: mutedText, margin: '2px 0 0 0' }}>
                Powered by 6 Specialized University Agents & Google Gemini Free Tier
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '20px',
              color: mutedText,
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Student Profile pill */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: innerBg,
            padding: '10px 14px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`,
            fontSize: '13px'
          }}>
            <div>
              <span style={{ color: mutedText }}>Student: </span>
              <strong style={{ color: textColor }}>{currentUser?.fullName}</strong> ({currentUser?.studentId})
            </div>
            <div style={{ color: mutedText, fontSize: '12px' }}>
              Location: <strong style={{ color: textColor }}>{location || 'General Campus'}</strong>
            </div>
          </div>

          {/* User query summary */}
          <div style={{
            backgroundColor: innerBg,
            padding: '14px',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: mutedText, fontWeight: '700', marginBottom: '4px' }}>
              Issue Description
            </div>
            <p style={{ margin: 0, fontSize: '14px', color: textColor, lineHeight: 1.5 }}>
              "{problemDescription}"
            </p>
          </div>

          {/* Initial State: Prompt to run */}
          {!analysisResult && !analyzing && !createdTicketInfo && (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ fontSize: '14px', color: mutedText, marginBottom: '20px' }}>
                Our 6 specialized agents will analyze your request in parallel:
                categorizing the department, evaluating urgency, retrieving verified campus knowledge base steps, and checking policies.
              </p>
              <button
                type="button"
                onClick={handleStartAnalysis}
                style={{
                  backgroundColor: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 28px',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
                }}
              >
                🚀 Run Multi-Agent Analysis
              </button>
            </div>
          )}

          {/* Loading Animation */}
          {analyzing && (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚙️</div>
              <h4 style={{ fontSize: '16px', fontWeight: 'bold', color: textColor, margin: '0 0 8px 0' }}>
                Multi-Agent Workflow Running in Parallel...
              </h4>
              <p style={{ fontSize: '13px', color: mutedText, margin: 0 }}>
                Manager Agent coordinating Classification, Priority, Resolution, and Routing specialists.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div style={{
              backgroundColor: '#dc262622',
              border: '1px solid #dc262655',
              color: '#f87171',
              padding: '12px 16px',
              borderRadius: '8px',
              fontSize: '13px'
            }}>
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Ticket Successfully Created View */}
          {createdTicketInfo && (
            <div style={{
              backgroundColor: '#05966922',
              border: '1px solid #05966955',
              borderRadius: '10px',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '36px', marginBottom: '8px' }}>🎉</div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981', margin: '0 0 6px 0' }}>
                Official Complaint Ticket Created!
              </h3>
              <p style={{ fontSize: '13px', color: mutedText, marginBottom: '16px' }}>
                Your ticket has been assigned to the <strong>{createdTicketInfo.department}</strong> team.
              </p>
              <div style={{
                display: 'inline-block',
                backgroundColor: innerBg,
                padding: '8px 20px',
                borderRadius: '8px',
                border: `1px solid ${borderColor}`,
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#2563eb',
                marginBottom: '20px'
              }}>
                {createdTicketInfo.id}
              </div>
              <div>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    border: 'none',
                    padding: '10px 24px',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Complete Analysis Output */}
          {analysisResult && !createdTicketInfo && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Agent Badges Bar */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                gap: '8px'
              }}>
                <div style={{ backgroundColor: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '10px', color: mutedText, fontWeight: '700' }}>CATEGORY</div>
                  <strong style={{ fontSize: '12px', color: '#2563eb' }}>{classification?.category}</strong>
                </div>
                <div style={{ backgroundColor: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '10px', color: mutedText, fontWeight: '700' }}>PRIORITY</div>
                  <strong style={{ fontSize: '12px', color: priority?.priority === 'High' || priority?.priority === 'Critical' ? '#dc2626' : '#059669' }}>
                    {priority?.priority} ({priority?.urgencyScore}/10)
                  </strong>
                </div>
                <div style={{ backgroundColor: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '10px', color: mutedText, fontWeight: '700' }}>DEPARTMENT</div>
                  <strong style={{ fontSize: '12px', color: textColor }}>{routing?.departmentName}</strong>
                </div>
                <div style={{ backgroundColor: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '10px', color: mutedText, fontWeight: '700' }}>RESPONSE SLA</div>
                  <strong style={{ fontSize: '12px', color: textColor }}>{routing?.slaHours} Hours</strong>
                </div>
                <div style={{ backgroundColor: innerBg, padding: '8px', borderRadius: '6px', border: `1px solid ${borderColor}` }}>
                  <div style={{ fontSize: '10px', color: mutedText, fontWeight: '700' }}>QA AUDIT</div>
                  <strong style={{ fontSize: '12px', color: validation?.isValid ? '#059669' : '#d97706' }}>
                    {validation?.status || 'APPROVED'}
                  </strong>
                </div>
              </div>

              {/* Priority Justification */}
              {priority?.reason && (
                <div style={{
                  fontSize: '12px',
                  color: mutedText,
                  backgroundColor: innerBg,
                  padding: '8px 12px',
                  borderRadius: '6px',
                  borderLeft: `3px solid ${priority?.priority === 'High' || priority?.priority === 'Critical' ? '#dc2626' : '#2563eb'}`
                }}>
                  <strong>Priority Assessment:</strong> {priority.reason}
                </div>
              )}

              {/* Resolution Agent Grounded Steps */}
              <div style={{
                backgroundColor: innerBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '16px' }}>💡</span>
                  <h4 style={{ fontSize: '14px', fontWeight: 'bold', margin: 0, color: textColor }}>
                    Verified University Troubleshooting Steps
                  </h4>
                  {resolution?.canSelfResolve && (
                    <span style={{
                      fontSize: '10px',
                      backgroundColor: '#05966922',
                      color: '#10b981',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontWeight: '700'
                    }}>
                      Self-Resolvable
                    </span>
                  )}
                </div>

                <ol style={{ margin: '0 0 12px 18px', padding: 0, fontSize: '13px', color: textColor, lineHeight: 1.6 }}>
                  {resolution?.troubleshootingSteps?.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{step}</li>
                  ))}
                </ol>

                {resolution?.safetyWarning && (
                  <div style={{
                    backgroundColor: '#dc262622',
                    color: '#f87171',
                    fontSize: '12px',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    marginBottom: '8px'
                  }}>
                    ⚠️ <strong>Safety Warning:</strong> {resolution.safetyWarning}
                  </div>
                )}

                {resolution?.officialPolicyReference && (
                  <div style={{ fontSize: '11px', color: mutedText, fontStyle: 'italic' }}>
                    Official Policy: {resolution.officialPolicyReference}
                  </div>
                )}
              </div>

              {/* Consequential Action Gateway */}
              <div style={{
                backgroundColor: isDark ? '#1e293b' : '#eff6ff',
                border: `1px solid ${isDark ? '#334155' : '#bfdbfe'}`,
                borderRadius: '8px',
                padding: '16px'
              }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: textColor, marginBottom: '6px' }}>
                  {manager?.confirmationPrompt || 'Would you like to submit an official complaint ticket?'}
                </div>
                <p style={{ fontSize: '12px', color: mutedText, margin: '0 0 14px 0' }}>
                  If the troubleshooting steps above do not solve your problem, you can confirm submission now to officially dispatch {routing?.supportTeam || routing?.departmentName}.
                </p>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={handleConfirmAndSubmit}
                    disabled={confirming}
                    style={{
                      backgroundColor: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '6px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    {confirming ? 'Creating Official Ticket...' : '✅ Confirm & Submit Official Complaint'}
                  </button>

                  <button
                    type="button"
                    onClick={onClose}
                    style={{
                      backgroundColor: 'transparent',
                      border: `1px solid ${borderColor}`,
                      color: textColor,
                      padding: '10px 16px',
                      borderRadius: '6px',
                      fontWeight: '600',
                      fontSize: '13px',
                      cursor: 'pointer'
                    }}
                  >
                    I Can Self-Resolve (Close)
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

