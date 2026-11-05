import { ManagerAgent } from '../agents/managerAgent.js';
import { ClassificationAgent } from '../agents/classificationAgent.js';
import { PriorityAgent } from '../agents/priorityAgent.js';
import { ResolutionAgent } from '../agents/resolutionAgent.js';
import { RoutingAgent } from '../agents/routingAgent.js';
import { ValidationAgent } from '../agents/validationAgent.js';
import { db } from '../data/store.js';

export class MultiAgentOrchestrator {
  constructor() {
    this.managerAgent = new ManagerAgent();
    this.classificationAgent = new ClassificationAgent();
    this.priorityAgent = new PriorityAgent();
    this.resolutionAgent = new ResolutionAgent();
    this.routingAgent = new RoutingAgent();
    this.validationAgent = new ValidationAgent();
  }

  getAgentsStatus() {
    return [
      this.managerAgent.getStatus(),
      this.classificationAgent.getStatus(),
      this.priorityAgent.getStatus(),
      this.resolutionAgent.getStatus(),
      this.routingAgent.getStatus(),
      this.validationAgent.getStatus()
    ];
  }

  /**
   * Complete multi-agent pipeline with parallel execution for independent agents
   */
  async executeWorkflow({ problemDescription, studentProfile, location, title }) {
    const workflowStartTime = Date.now();
    const issuePayload = {
      title: title || problemDescription.substring(0, 70),
      description: problemDescription,
      location: location || 'Campus',
      student: studentProfile
    };

    const traceSteps = [];

    // Step 1: Manager Agent receives the request and formulates task plan
    const managerPlanStart = Date.now();
    const managerPlan = await this.managerAgent.run({
      action: 'INITIATE_PLAN',
      studentIssue: issuePayload
    });
    traceSteps.push({
      agent: this.managerAgent.name,
      role: this.managerAgent.role,
      phase: 'PLANNING',
      latencyMs: Date.now() - managerPlanStart,
      output: managerPlan.data
    });

    // Step 2: Parallel execution for independent specialist agents
    const parallelStart = Date.now();
    const [classificationResult, priorityResult, resolutionResult, routingResult] = await Promise.all([
      this.classificationAgent.run(issuePayload),
      this.priorityAgent.run(issuePayload),
      this.resolutionAgent.run(issuePayload),
      this.routingAgent.run(issuePayload)
    ]);
    const parallelDuration = Date.now() - parallelStart;

    traceSteps.push(
      {
        agent: this.classificationAgent.name,
        role: this.classificationAgent.role,
        phase: 'PARALLEL_EXECUTION',
        latencyMs: classificationResult.latencyMs,
        output: classificationResult.data
      },
      {
        agent: this.priorityAgent.name,
        role: this.priorityAgent.role,
        phase: 'PARALLEL_EXECUTION',
        latencyMs: priorityResult.latencyMs,
        output: priorityResult.data
      },
      {
        agent: this.resolutionAgent.name,
        role: this.resolutionAgent.role,
        phase: 'PARALLEL_EXECUTION',
        latencyMs: resolutionResult.latencyMs,
        output: resolutionResult.data
      },
      {
        agent: this.routingAgent.name,
        role: this.routingAgent.role,
        phase: 'PARALLEL_EXECUTION',
        latencyMs: routingResult.latencyMs,
        output: routingResult.data
      }
    );

    // Step 3: Validation Agent audits all specialist outputs
    const validationStart = Date.now();
    const validationResult = await this.validationAgent.run(issuePayload, {
      classification: classificationResult.data,
      priority: priorityResult.data,
      resolution: resolutionResult.data,
      routing: routingResult.data
    });

    traceSteps.push({
      agent: this.validationAgent.name,
      role: this.validationAgent.role,
      phase: 'QUALITY_VALIDATION',
      latencyMs: Date.now() - validationStart,
      output: validationResult.data
    });

    // Step 4: Manager Agent combines and synthesizes final student advisory
    const synthesisStart = Date.now();
    const synthesisResult = await this.managerAgent.synthesize({
      studentIssue: issuePayload,
      studentProfile,
      classification: classificationResult,
      priority: priorityResult,
      resolution: resolutionResult,
      routing: routingResult,
      validation: validationResult
    });

    traceSteps.push({
      agent: this.managerAgent.name,
      role: this.managerAgent.role,
      phase: 'FINAL_SYNTHESIS',
      latencyMs: Date.now() - synthesisStart,
      output: synthesisResult.data
    });

    const totalDurationMs = Date.now() - workflowStartTime;

    const fullWorkflowTrace = {
      requesterEmail: studentProfile?.email || 'student@campus.edu',
      studentId: studentProfile?.studentId || 'UNKNOWN',
      title: issuePayload.title,
      totalDurationMs,
      parallelDurationMs: parallelDuration,
      steps: traceSteps,
      summary: {
        category: classificationResult.data.category,
        priority: priorityResult.data.priority,
        department: routingResult.data.departmentName,
        canSelfResolve: resolutionResult.data.canSelfResolve,
        validationStatus: validationResult.data.status
      }
    };

    // Store real trace in database for live Agent Dashboard
    const savedTrace = db.recordWorkflowTrace(fullWorkflowTrace);

    return {
      workflowId: savedTrace.id,
      timestamp: savedTrace.timestamp,
      totalDurationMs,
      parallelExecution: {
        enabled: true,
        durationMs: parallelDuration
      },
      analysis: {
        manager: synthesisResult.data,
        classification: classificationResult.data,
        priority: priorityResult.data,
        resolution: resolutionResult.data,
        routing: routingResult.data,
        validation: validationResult.data
      },
      // Consequential Action Gate
      requiresStudentConfirmation: true,
      pendingComplaintDraft: {
        title: synthesisResult.data?.recommendedTicketDraft?.suggestedTitle || issuePayload.title,
        description: problemDescription,
        category: classificationResult.data.category,
        priority: priorityResult.data.priority,
        department: routingResult.data.departmentName,
        location: issuePayload.location,
        requesterName: studentProfile?.fullName || 'Student',
        requesterEmail: studentProfile?.email || 'student@campus.edu',
        requesterRole: studentProfile?.role || 'Undergraduate Student',
        studentId: studentProfile?.studentId || 'STU-94021',
        aiAnalysisRef: savedTrace.id
      }
    };
  }
}

export const orchestrator = new MultiAgentOrchestrator();

