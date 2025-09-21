import mongoose from 'mongoose';

const SimulationSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    analysisId: { type: String, index: true },
    role: { type: String, required: true },
    simulation: {
      scenarios: [{
        id: { type: String, required: true },
        title: { type: String, required: true },
        description: { type: String, required: true },
        difficulty: { type: String, required: true },
        duration: { type: String, required: true },
        skills_tested: [{ type: String }],
        outcomes: [{ type: String }]
      }],
      interview_simulations: [{
        company: { type: String, required: true },
        role: { type: String, required: true },
        questions: [{
          question: { type: String, required: true },
          type: { type: String, required: true },
          expected_answer: { type: String, required: true },
          tips: [{ type: String }]
        }],
        difficulty: { type: String, required: true }
      }],
      skill_challenges: [{
        skill: { type: String, required: true },
        challenge_type: { type: String, required: true },
        description: { type: String, required: true },
        time_limit: { type: String, required: true },
        evaluation_criteria: [{ type: String }]
      }],
      projects: [{
        name: { type: String, required: true },
        description: { type: String, required: true },
        technologies: [{ type: String }],
        timeline: { type: String, required: true },
        deliverables: [{ type: String }]
      }],
      networking_opportunities: [{
        event: { type: String, required: true },
        type: { type: String, required: true },
        description: { type: String, required: true },
        networking_tips: [{ type: String }]
      }],
      salary_negotiation: {
        scenarios: [{
          situation: { type: String, required: true },
          current_salary: { type: String, required: true },
          target_salary: { type: String, required: true },
          negotiation_tips: [{ type: String }]
        }]
      }
    },
    estimated_duration: { type: String, required: true },
    learning_objectives: [{ type: String }],
    model_used: { type: String, default: 'gemini-2.5-flash' },
    started_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
    progress: {
      completed_scenarios: [{ type: String }],
      completed_interviews: [{ type: String }],
      completed_challenges: [{ type: String }],
      completed_projects: [{ type: String }],
      overall_progress: { type: Number, default: 0, min: 0, max: 100 }
    }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Simulation', SimulationSchema);
