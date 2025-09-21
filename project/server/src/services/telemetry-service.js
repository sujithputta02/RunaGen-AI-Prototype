import { performance } from 'perf_hooks';

export class TelemetryService {
  constructor() {
    this.metrics = new Map();
    this.counters = new Map();
    this.timers = new Map();
    this.gauges = new Map();
    this.events = [];
    this.maxEvents = 10000; // Keep last 10k events
  }

  // Track counter metrics
  incrementCounter(name, value = 1, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const current = this.counters.get(key) || 0;
    this.counters.set(key, current + value);
    
    this.recordEvent('counter_increment', {
      metric: name,
      value,
      labels,
      timestamp: Date.now()
    });
  }

  // Track gauge metrics
  setGauge(name, value, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.gauges.set(key, { value, timestamp: Date.now() });
    
    this.recordEvent('gauge_set', {
      metric: name,
      value,
      labels,
      timestamp: Date.now()
    });
  }

  // Start timing
  startTimer(name, labels = {}) {
    const key = this.getMetricKey(name, labels);
    this.timers.set(key, {
      start: performance.now(),
      labels,
      timestamp: Date.now()
    });
  }

  // End timing and record duration
  endTimer(name, labels = {}) {
    const key = this.getMetricKey(name, labels);
    const timer = this.timers.get(key);
    
    if (timer) {
      const duration = performance.now() - timer.start;
      this.recordEvent('timer_complete', {
        metric: name,
        duration,
        labels,
        timestamp: Date.now()
      });
      
      this.timers.delete(key);
      return duration;
    }
    
    return null;
  }

  // Record custom events
  recordEvent(eventType, data = {}) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      data,
      timestamp: Date.now()
    };
    
    this.events.push(event);
    
    // Keep only recent events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
  }

  // Track mentor interactions
  trackMentorInteraction(userId, sessionId, intent, processingTime, confidence, success) {
    this.incrementCounter('mentor_requests_total', 1, { intent, success: success.toString() });
    this.setGauge('mentor_processing_time_ms', processingTime, { intent });
    this.setGauge('mentor_confidence_score', confidence, { intent });
    
    this.recordEvent('mentor_interaction', {
      userId,
      sessionId,
      intent,
      processingTime,
      confidence,
      success,
      timestamp: Date.now()
    });
  }

  // Track simulation completions
  trackSimulationCompletion(userId, sessionId, language, score, executionTime, success) {
    this.incrementCounter('simulations_completed_total', 1, { 
      language, 
      success: success.toString(),
      score_range: this.getScoreRange(score)
    });
    
    this.setGauge('simulation_execution_time_ms', executionTime, { language });
    this.setGauge('simulation_score', score, { language });
    
    this.recordEvent('simulation_completion', {
      userId,
      sessionId,
      language,
      score,
      executionTime,
      success,
      timestamp: Date.now()
    });
  }

  // Track badge awards
  trackBadgeAward(userId, badgeId, badgeTitle, triggerEvent) {
    this.incrementCounter('badges_awarded_total', 1, { badge_id: badgeId });
    
    this.recordEvent('badge_awarded', {
      userId,
      badgeId,
      badgeTitle,
      triggerEvent,
      timestamp: Date.now()
    });
  }

  // Track retrieval performance
  trackRetrievalPerformance(query, resultsCount, retrievalTime, rerankTime) {
    this.incrementCounter('retrieval_requests_total', 1);
    this.setGauge('retrieval_results_count', resultsCount);
    this.setGauge('retrieval_time_ms', retrievalTime);
    this.setGauge('rerank_time_ms', rerankTime);
    
    this.recordEvent('retrieval_performance', {
      query: query.substring(0, 100), // Truncate for privacy
      resultsCount,
      retrievalTime,
      rerankTime,
      timestamp: Date.now()
    });
  }

  // Track model usage
  trackModelUsage(modelName, tokensUsed, cost, latency) {
    this.incrementCounter('model_requests_total', 1, { model: modelName });
    this.incrementCounter('model_tokens_total', tokensUsed, { model: modelName });
    this.setGauge('model_cost_usd', cost, { model: modelName });
    this.setGauge('model_latency_ms', latency, { model: modelName });
    
    this.recordEvent('model_usage', {
      model: modelName,
      tokensUsed,
      cost,
      latency,
      timestamp: Date.now()
    });
  }

  // Track user engagement
  trackUserEngagement(userId, action, metadata = {}) {
    this.incrementCounter('user_actions_total', 1, { action });
    
    this.recordEvent('user_engagement', {
      userId,
      action,
      metadata,
      timestamp: Date.now()
    });
  }

  // Track errors
  trackError(errorType, errorMessage, context = {}) {
    this.incrementCounter('errors_total', 1, { error_type: errorType });
    
    this.recordEvent('error_occurred', {
      errorType,
      errorMessage: errorMessage.substring(0, 200), // Truncate for privacy
      context,
      timestamp: Date.now()
    });
  }

  // Get metrics summary
  getMetricsSummary() {
    const summary = {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      events: this.events.slice(-100), // Last 100 events
      timestamp: Date.now()
    };
    
    return summary;
  }

  // Get specific metric
  getMetric(name, labels = {}) {
    const key = this.getMetricKey(name, labels);
    return {
      counter: this.counters.get(key) || 0,
      gauge: this.gauges.get(key) || null
    };
  }

  // Get events by type
  getEventsByType(eventType, limit = 100) {
    return this.events
      .filter(event => event.type === eventType)
      .slice(-limit);
  }

  // Get user activity
  getUserActivity(userId, limit = 50) {
    return this.events
      .filter(event => event.data.userId === userId)
      .slice(-limit);
  }

  // Get performance metrics
  getPerformanceMetrics() {
    const mentorEvents = this.getEventsByType('mentor_interaction');
    const simulationEvents = this.getEventsByType('simulation_completion');
    const retrievalEvents = this.getEventsByType('retrieval_performance');
    
    return {
      mentor: {
        totalRequests: mentorEvents.length,
        avgProcessingTime: this.calculateAverage(mentorEvents, 'processingTime'),
        avgConfidence: this.calculateAverage(mentorEvents, 'confidence'),
        successRate: this.calculateSuccessRate(mentorEvents)
      },
      simulation: {
        totalCompletions: simulationEvents.length,
        avgScore: this.calculateAverage(simulationEvents, 'score'),
        avgExecutionTime: this.calculateAverage(simulationEvents, 'executionTime'),
        successRate: this.calculateSuccessRate(simulationEvents)
      },
      retrieval: {
        totalRequests: retrievalEvents.length,
        avgRetrievalTime: this.calculateAverage(retrievalEvents, 'retrievalTime'),
        avgResultsCount: this.calculateAverage(retrievalEvents, 'resultsCount')
      }
    };
  }

  // Helper methods
  getMetricKey(name, labels) {
    const labelStr = Object.entries(labels)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}=${v}`)
      .join(',');
    return `${name}{${labelStr}}`;
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getScoreRange(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 60) return 'passing';
    return 'failing';
  }

  calculateAverage(events, field) {
    if (events.length === 0) return 0;
    const sum = events.reduce((acc, event) => acc + (event.data[field] || 0), 0);
    return Math.round(sum / events.length);
  }

  calculateSuccessRate(events) {
    if (events.length === 0) return 0;
    const successful = events.filter(event => event.data.success === true).length;
    return Math.round((successful / events.length) * 100);
  }

  // Export metrics for external monitoring
  exportMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      events: this.events,
      performance: this.getPerformanceMetrics(),
      timestamp: Date.now()
    };
  }

  // Clear old data
  clearOldData(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;
    
    // Clear old events
    this.events = this.events.filter(event => event.timestamp > cutoff);
    
    // Clear old gauges
    for (const [key, gauge] of this.gauges) {
      if (gauge.timestamp < cutoff) {
        this.gauges.delete(key);
      }
    }
  }
}

export default TelemetryService;

