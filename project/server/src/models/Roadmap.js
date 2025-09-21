import mongoose from 'mongoose';

const RoadmapSchema = new mongoose.Schema(
  {
    userId: { type: String, index: true },
    analysisId: { type: String, index: true },
    role: { type: String, required: true },
    roadmap: {
      stage_1_critical_gaps: [{
        skill: { type: String, required: true },
        gap_level: { type: String, required: true },
        timeline: { type: String, required: true },
        priority: { type: String, required: true },
        youtube_videos: [{
          title: { type: String, required: true },
          topic: { type: String, required: true },
          search_query: { type: String, required: true }
        }],
        exam_preparation: {
          certifications: [{ type: String }],
          practice_tests: [{ type: String }],
          study_materials: [{ type: String }]
        },
        projects: [{
          name: { type: String, required: true },
          description: { type: String, required: true },
          skills_developed: [{ type: String }],
          timeline: { type: String, required: true }
        }],
        learning_platforms: [{ type: String }]
      }],
      stage_2_important_gaps: [{
        skill: { type: String, required: true },
        gap_level: { type: String, required: true },
        timeline: { type: String, required: true },
        priority: { type: String, required: true },
        youtube_videos: [{
          title: { type: String, required: true },
          topic: { type: String, required: true },
          search_query: { type: String, required: true }
        }],
        exam_preparation: {
          certifications: [{ type: String }],
          practice_tests: [{ type: String }],
          study_materials: [{ type: String }]
        },
        projects: [{
          name: { type: String, required: true },
          description: { type: String, required: true },
          skills_developed: [{ type: String }],
          timeline: { type: String, required: true }
        }],
        learning_platforms: [{ type: String }]
      }],
      stage_3_nice_to_have: [{
        skill: { type: String, required: true },
        gap_level: { type: String, required: true },
        timeline: { type: String, required: true },
        priority: { type: String, required: true },
        youtube_videos: [{
          title: { type: String, required: true },
          topic: { type: String, required: true },
          search_query: { type: String, required: true }
        }],
        exam_preparation: {
          certifications: [{ type: String }],
          practice_tests: [{ type: String }],
          study_materials: [{ type: String }]
        },
        projects: [{
          name: { type: String, required: true },
          description: { type: String, required: true },
          skills_developed: [{ type: String }],
          timeline: { type: String, required: true }
        }],
        learning_platforms: [{ type: String }]
      }],
      learning_resources: {
        courses: [{ type: String }],
        platforms: [{ type: String }],
        books: [{ type: String }],
        communities: [{ type: String }]
      }
    },
    estimated_timeline: { type: String, required: true },
    success_metrics: [{ type: String }],
    model_used: { type: String, default: 'gemini-2.5-flash' },
    generated_at: { type: Date, default: Date.now }
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

export default mongoose.model('Roadmap', RoadmapSchema);
