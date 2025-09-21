import mongoose from 'mongoose';

const AnalysisSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    target_role: { type: String, required: true },
    match_score: { type: Number, required: true },
    skills_present: { type: [String], default: [] },
    skills_missing: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    file_url: { type: String },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Analysis', AnalysisSchema);


