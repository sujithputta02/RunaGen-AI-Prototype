// Demo test script for hackathon presentation
import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// Mock data for demo
const DEMO_RESPONSES = {
  resumeOptimization: {
    success: true,
    ats_score: {
      overall_score: 92,
      keyword_match: 88,
      format_score: 95,
      content_quality: 90
    },
    optimized_resume: "Enhanced resume with ATS-optimized keywords...",
    improvements: [
      "Added 12 relevant keywords for better ATS compatibility",
      "Improved action verbs and quantified achievements",
      "Enhanced technical skills section"
    ]
  },
  careerTrajectory: {
    success: true,
    career_path: [
      {
        year: 1,
        role: "Senior Software Engineer",
        skills_to_develop: ["System Design", "Leadership"],
        expected_salary: "$120,000",
        probability: 85
      },
      {
        year: 3,
        role: "Tech Lead",
        skills_to_develop: ["Team Management", "Architecture"],
        expected_salary: "$150,000", 
        probability: 78
      }
    ],
    success_probability: 85
  },
  marketIntelligence: {
    success: true,
    skill_trends: {
      "JavaScript": { demand: "High", growth: "+15%" },
      "React": { demand: "Very High", growth: "+22%" },
      "TypeScript": { demand: "High", growth: "+35%" }
    },
    salary_predictions: {
      current_range: "$90,000 - $130,000",
      projected_range: "$110,000 - $150,000"
    }
  }
};

// Demo endpoints
app.post('/optimize-resume-file', (req, res) => {
  setTimeout(() => res.json(DEMO_RESPONSES.resumeOptimization), 1000);
});

app.post('/predict-career-trajectory', (req, res) => {
  setTimeout(() => res.json(DEMO_RESPONSES.careerTrajectory), 1500);
});

app.post('/analyze-market-trends', (req, res) => {
  setTimeout(() => res.json(DEMO_RESPONSES.marketIntelligence), 1200);
});

app.get('/health', (req, res) => {
  res.json({ status: 'Demo server running', timestamp: new Date() });
});

const PORT = 3002;
app.listen(PORT, () => {
  console.log(`🎪 Demo server running on http://localhost:${PORT}`);
  console.log('🚀 Ready for hackathon presentation!');
});