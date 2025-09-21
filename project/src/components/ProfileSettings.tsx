import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Building, Target, MapPin, Monitor, 
  Brain, Award, FileText, CheckCircle, AlertCircle,
  Save, RefreshCw, Eye, Edit3, Star, Zap, TrendingUp,
  Globe, Home, Briefcase, GraduationCap, Heart, Settings,
  Camera, Trash2, Shield, Bell, Lock, Upload
} from 'lucide-react';

interface BasicInfo {
  name: string;
  email: string;
  university?: string;
  currentCompany?: string;
  careerGoal: string;
  careerGoalReason: string;
}

interface CareerPreferences {
  preferredIndustries: string[];
  preferredLocations: string[];
  workMode: 'remote' | 'on-site' | 'hybrid';
  targetRoles: string[];
}

interface PersonalityResult {
  personalityType: string;
  suggestedCareerTracks: string[];
  lastQuizDate: string;
}

interface ResumeIntegration {
  lastUploadDate?: string;
  skillsPresent: string[];
  skillsMissing: string[];
  matchScore: number;
  overallScore: number;
  uploads: { id: string; fileName: string; uploadedAt: string }[];
}

interface ProfileSettingsProps {
  onSave?: (profileData: any) => void;
  onClose?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSave, onClose }) => {
  const [activeSection, setActiveSection] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state
  const [basicInfo, setBasicInfo] = useState<BasicInfo>({
    name: "Alex Johnson",
    email: "alex.johnson@example.com",
    university: "Stanford University",
    careerGoal: "I want to be a Data Analyst",
    careerGoalReason: "I'm passionate about turning data into actionable insights that drive business decisions and help companies grow."
  });

  const [careerPreferences, setCareerPreferences] = useState<CareerPreferences>({
    preferredIndustries: ['Technology', 'Finance'],
    preferredLocations: ['San Francisco', 'Remote'],
    workMode: 'hybrid',
    targetRoles: ['Data Analyst']
  });

  const [personalityResult, setPersonalityResult] = useState<PersonalityResult>({
    personalityType: "Analytical Explorer",
    suggestedCareerTracks: ['Data Analyst', 'Business Analyst', 'Research Scientist'],
    lastQuizDate: "2024-01-15"
  });

  const [resumeIntegration, setResumeIntegration] = useState<ResumeIntegration>({
    lastUploadDate: "2024-01-10",
    skillsPresent: ['Python', 'SQL', 'Excel', 'Communication'],
    skillsMissing: ['Tableau', 'Power BI', 'Statistics'],
    matchScore: 75,
    overallScore: 72,
    uploads: [
      { id: 'u1', fileName: 'Alex_Resume_v3.pdf', uploadedAt: '2024-01-10' },
      { id: 'u0', fileName: 'Alex_Resume_v2.pdf', uploadedAt: '2023-11-02' }
    ]
  });

  const [isStudent, setIsStudent] = useState(true);
  const [manualSkills, setManualSkills] = useState<string[]>(['Critical Thinking']);
  const [newSkill, setNewSkill] = useState('');
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [notifications, setNotifications] = useState({
    productUpdates: true,
    reminders: true,
    mentorMessages: true
  });
  const [xp, setXp] = useState(2840);
  const [xpToNext, setXpToNext] = useState(1160);
  const [badgesSummary] = useState({ earned: 3, total: 6 });

  // Available options
  const industries = [
    'Technology', 'Finance', 'Healthcare', 'Education', 'Marketing',
    'Consulting', 'Manufacturing', 'Retail', 'Government', 'Non-profit'
  ];

  const locations = [
    'San Francisco', 'New York', 'Seattle', 'Austin', 'Boston',
    'Chicago', 'Los Angeles', 'Denver', 'Remote', 'Hybrid'
  ];

  const workModes = [
    { value: 'remote', label: 'Remote', icon: Home },
    { value: 'on-site', label: 'On-site', icon: Building },
    { value: 'hybrid', label: 'Hybrid', icon: Monitor }
  ];

  const personalityTypes = [
    'Analytical Explorer', 'Creative Innovator', 'Logical Problem Solver',
    'Strategic Thinker', 'Collaborative Leader', 'Detail-Oriented Perfectionist'
  ];

  const careerTracks = [
    'Data Analyst', 'Software Engineer', 'Product Manager', 'UX Designer',
    'Marketing Manager', 'Business Analyst', 'Data Scientist', 'Project Manager'
  ];

  const targetRoleOptions = careerTracks;

  useEffect(() => {
    // Track changes to enable save button
    setHasChanges(true);
  }, [basicInfo, careerPreferences, personalityResult]);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const profileData = {
      basicInfo,
      careerPreferences,
      personalityResult,
      resumeIntegration,
      isStudent,
      manualSkills,
      profilePhoto,
      isPublic,
      notifications,
      xp,
      xpToNext
    };

    onSave?.(profileData);
    setHasChanges(false);
    setIsSaving(false);
    
    // Show success message
    alert('Profile settings saved successfully! 🎉');
  };

  const handleIndustryToggle = (industry: string) => {
    setCareerPreferences(prev => ({
      ...prev,
      preferredIndustries: prev.preferredIndustries.includes(industry)
        ? prev.preferredIndustries.filter(i => i !== industry)
        : [...prev.preferredIndustries, industry]
    }));
  };

  const handleLocationToggle = (location: string) => {
    setCareerPreferences(prev => ({
      ...prev,
      preferredLocations: prev.preferredLocations.includes(location)
        ? prev.preferredLocations.filter(l => l !== location)
        : [...prev.preferredLocations, location]
    }));
  };

  const handleRoleToggle = (role: string) => {
    setCareerPreferences(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handleAddSkill = () => {
    const val = newSkill.trim();
    if (!val) return;
    if (!manualSkills.includes(val)) setManualSkills(prev => [...prev, val]);
    setNewSkill('');
  };

  const handleRemoveSkill = (skill: string) => {
    setManualSkills(prev => prev.filter(s => s !== skill));
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfilePhoto(reader.result as string);
    reader.readAsDataURL(file);
  };

  const renderBasicInfo = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <User className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
      </div>

      {/* Photo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Profile Photo</label>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {profilePhoto ? (
              <img src={profilePhoto} alt="profile" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-gray-500" />
            )}
          </div>
          <label className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg cursor-pointer">
            <Upload className="h-4 w-4" />
            <span>Upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
          </label>
          {profilePhoto && (
            <button onClick={() => setProfilePhoto(null)} className="px-3 py-2 text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 inline mr-1" /> Remove
            </button>
          )}
        </div>
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <User className="h-4 w-4 inline mr-1" />
          Full Name
        </label>
        <input
          type="text"
          value={basicInfo.name}
          onChange={(e) => setBasicInfo(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          placeholder="Enter your full name"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Mail className="h-4 w-4 inline mr-1" />
          Email / Contact Info
        </label>
        <input
          type="email"
          value={basicInfo.email}
          onChange={(e) => setBasicInfo(prev => ({ ...prev, email: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          placeholder="your.email@example.com"
        />
      </div>

      {/* Student/Professional Toggle */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">Current Status</label>
        <div className="flex space-x-4">
          <button
            onClick={() => setIsStudent(true)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
              isStudent 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-300 text-gray-600 hover:border-purple-300'
            }`}
          >
            <GraduationCap className="h-5 w-5" />
            <span>Student</span>
          </button>
          <button
            onClick={() => setIsStudent(false)}
            className={`flex items-center space-x-2 px-4 py-3 rounded-lg border-2 transition-all duration-300 ${
              !isStudent 
                ? 'border-purple-500 bg-purple-50 text-purple-700' 
                : 'border-gray-300 text-gray-600 hover:border-purple-300'
            }`}
          >
            <Briefcase className="h-5 w-5" />
            <span>Professional</span>
          </button>
        </div>
      </div>

      {/* University or Company */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {isStudent ? (
            <>
              <GraduationCap className="h-4 w-4 inline mr-1" />
              University
            </>
          ) : (
            <>
              <Building className="h-4 w-4 inline mr-1" />
              Current Company
            </>
          )}
        </label>
        <input
          type="text"
          value={isStudent ? basicInfo.university || '' : basicInfo.currentCompany || ''}
          onChange={(e) => setBasicInfo(prev => ({ 
            ...prev, 
            [isStudent ? 'university' : 'currentCompany']: e.target.value 
          }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          placeholder={isStudent ? "Your university name" : "Your current company"}
        />
      </div>

      {/* Career Goal */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Target className="h-4 w-4 inline mr-1" />
          Career Goal
        </label>
        <input
          type="text"
          value={basicInfo.careerGoal}
          onChange={(e) => setBasicInfo(prev => ({ ...prev, careerGoal: e.target.value }))}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
          placeholder="I want to be a..."
        />
        <p className="text-sm text-gray-600 mt-2">
          💡 This helps the AI mentor understand your aspirations and tailor recommendations accordingly.
        </p>
      </div>

      {/* Career Goal Reason */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Heart className="h-4 w-4 inline mr-1" />
          Why this career goal?
        </label>
        <textarea
          value={basicInfo.careerGoalReason}
          onChange={(e) => setBasicInfo(prev => ({ ...prev, careerGoalReason: e.target.value }))}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 resize-none"
          placeholder="Tell us what drives your passion for this career..."
        />
        <p className="text-sm text-gray-600 mt-2">
          💡 This context helps create more personalized roadmaps and simulations.
        </p>
      </div>
    </div>
  );

  const renderCareerPreferences = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-900">Career Preferences</h3>
      </div>

      {/* Preferred Industries */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Building className="h-4 w-4 inline mr-1" />
          Preferred Industries
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {industries.map((industry) => (
            <button
              key={industry}
              onClick={() => handleIndustryToggle(industry)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                careerPreferences.preferredIndustries.includes(industry)
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-600 hover:border-blue-300'
              }`}
            >
              {industry}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          💡 Select industries that align with your interests and career goals.
        </p>
      </div>

      {/* Preferred Locations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <MapPin className="h-4 w-4 inline mr-1" />
          Preferred Locations
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => handleLocationToggle(location)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                careerPreferences.preferredLocations.includes(location)
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-600 hover:border-green-300'
              }`}
            >
              {location}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          💡 This helps filter job matches and roadmaps to realistic opportunities.
        </p>
      </div>

      {/* Work Mode */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Monitor className="h-4 w-4 inline mr-1" />
          Work Mode Preference
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <button
                key={mode.value}
                onClick={() => setCareerPreferences(prev => ({ ...prev, workMode: mode.value as any }))}
                className={`flex items-center space-x-3 p-4 rounded-lg border-2 transition-all duration-300 ${
                  careerPreferences.workMode === mode.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-300 text-gray-600 hover:border-purple-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      {/* Target Roles */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Target className="h-4 w-4 inline mr-1" />
          Target Roles
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {targetRoleOptions.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleToggle(role)}
              className={`p-3 rounded-lg border-2 transition-all duration-300 text-left ${
                careerPreferences.targetRoles.includes(role)
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-300 text-gray-600 hover:border-purple-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPersonalityQuiz = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Brain className="h-6 w-6 text-purple-600" />
        <h3 className="text-xl font-semibold text-gray-900">Personality Quiz Results</h3>
      </div>

      {/* Current Personality Type */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-gray-900">Your Personality Type</h4>
          <span className="text-sm text-gray-600">Last updated: {personalityResult.lastQuizDate}</span>
        </div>
        
        <div className="flex items-center space-x-4 mb-4">
          <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full">
            <Brain className="h-6 w-6 text-white" />
          </div>
          <div>
            <h5 className="text-xl font-bold text-gray-900">{personalityResult.personalityType}</h5>
            <p className="text-gray-600">Your unique career personality profile</p>
          </div>
        </div>

        <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
          <RefreshCw className="h-4 w-4 mr-2 inline" />
          Retake Quiz
        </button>
      </div>

      {/* Suggested Career Tracks */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-yellow-600" />
          Suggested Career Tracks
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {personalityResult.suggestedCareerTracks.map((track, index) => (
            <div key={track} className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg hover:border-purple-300 transition-colors">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h5 className="font-semibold text-gray-900">{track}</h5>
                <p className="text-sm text-gray-600">Match score: {85 - index * 5}%</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-3">
          💡 These career tracks are recommended based on your personality assessment results.
        </p>
      </div>
    </div>
  );

  const renderResumeIntegration = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <FileText className="h-6 w-6 text-green-600" />
        <h3 className="text-xl font-semibold text-gray-900">Resume Integration</h3>
      </div>

      {resumeIntegration.lastUploadDate ? (
        <>
          {/* Resume Analysis Summary */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-6 border border-green-100">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-gray-900">Last Resume Analysis</h4>
              <span className="text-sm text-gray-600">Uploaded: {resumeIntegration.lastUploadDate}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold text-gray-900">{resumeIntegration.overallScore}/100</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Career Match</p>
                <p className="text-2xl font-bold text-gray-900">{resumeIntegration.matchScore}%</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Skills Found</p>
                <p className="text-2xl font-bold text-gray-900">{resumeIntegration.skillsPresent.length}</p>
              </div>
            </div>

            <button className="bg-gradient-to-r from-green-500 to-blue-500 text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-300">
              <Eye className="h-4 w-4 mr-2 inline" />
              Go to Resume Analysis
            </button>
          </div>

        {/* Resume uploads history */}
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Resumes</h4>
          <div className="space-y-2">
            {resumeIntegration.uploads.map(u => (
              <div key={u.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                <span className="text-sm text-gray-800">{u.fileName}</span>
                <span className="text-xs text-gray-500">{u.uploadedAt}</span>
              </div>
            ))}
          </div>
        </div>

          {/* Skills Present */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Skills Present ✅
            </h4>
            <div className="flex flex-wrap gap-2">
              {resumeIntegration.skillsPresent.map((skill) => (
                <span key={skill} className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Skills Missing */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-orange-600" />
              Missing Skills ❌
            </h4>
            <div className="flex flex-wrap gap-2">
              {resumeIntegration.skillsMissing.map((skill) => (
                <span key={skill} className="px-3 py-2 bg-orange-100 text-orange-700 rounded-lg text-sm font-medium">
                  {skill}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-3">
              💡 Focus on these skills to improve your career match score.
            </p>
          </div>
          
          {/* Manual Skills */}
          <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">Your Manual Skills</h4>
            <div className="flex flex-wrap gap-2 mb-3">
              {manualSkills.map((s) => (
                <span key={s} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {s}
                  <button onClick={() => handleRemoveSkill(s)} className="ml-2 text-purple-600 hover:text-purple-800">×</button>
                </span>
              ))}
            </div>
            <div className="flex items-center space-x-2">
              <input 
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <button onClick={handleAddSkill} className="px-4 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-lg">Add</button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-900 mb-2">No Resume Uploaded</h4>
          <p className="text-gray-600 mb-4">Upload your resume to get personalized insights and career matching.</p>
          <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg hover:shadow-lg transition-all duration-300">
            Upload Resume
          </button>
        </div>
      )}
    </div>
  );

  const renderProgressAndBadges = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Award className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-semibold text-gray-900">Progress & Badges</h3>
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">XP Level</span>
          <span className="text-sm text-gray-600">{xp}/{xp + xpToNext}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full" style={{ width: `${(xp/(xp+xpToNext))*100}%` }} />
        </div>
        <p className="text-sm text-gray-600 mt-2">Badges earned: {badgesSummary.earned}/{badgesSummary.total}</p>
      </div>
      <div className="text-sm text-gray-600">Upcoming milestone: Reach level 13 to unlock “Career Simulator Pro”.</div>
    </div>
  );

  const renderPrivacySettings = () => (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-indigo-600" />
        <h3 className="text-xl font-semibold text-gray-900">Privacy & Settings</h3>
      </div>
      <div className="bg-white rounded-xl p-6 border border-gray-200 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Public Profile</p>
            <p className="text-sm text-gray-600">Make your profile visible in the peer hub</p>
          </div>
          <button onClick={() => setIsPublic(v => !v)} className={`px-4 py-2 rounded-lg border ${isPublic ? 'bg-green-50 border-green-300 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-700'}`}>
            {isPublic ? 'Public' : 'Private'}
          </button>
        </div>
        <div>
          <p className="font-medium text-gray-900 mb-2">Notifications</p>
          <div className="space-y-2">
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={notifications.productUpdates} onChange={(e)=>setNotifications({...notifications, productUpdates: e.target.checked})} />
              <span>Product updates</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={notifications.reminders} onChange={(e)=>setNotifications({...notifications, reminders: e.target.checked})} />
              <span>Reminders & nudges</span>
            </label>
            <label className="flex items-center space-x-3">
              <input type="checkbox" checked={notifications.mentorMessages} onChange={(e)=>setNotifications({...notifications, mentorMessages: e.target.checked})} />
              <span>AI mentor messages</span>
            </label>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-200">
          <button className="px-4 py-2 mr-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100">Reset progress</button>
          <button className="px-4 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50">Delete account</button>
        </div>
      </div>
    </div>
  );

  const sections = [
    { id: 'basic', label: 'Personal Info', icon: User },
    { id: 'career', label: 'Career Preferences', icon: Target },
    { id: 'resume', label: 'Skills & Resume', icon: FileText },
    { id: 'personality', label: 'Personality Quiz', icon: Brain },
    { id: 'progress', label: 'Progress & Badges', icon: Award },
    { id: 'privacy', label: 'Privacy & Settings', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Settings className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-all duration-300 ${
                      activeSection === section.id
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeSection === 'basic' && renderBasicInfo()}
            {activeSection === 'career' && renderCareerPreferences()}
            {activeSection === 'resume' && renderResumeIntegration()}
            {activeSection === 'personality' && renderPersonalityQuiz()}
            {activeSection === 'progress' && renderProgressAndBadges()}
            {activeSection === 'privacy' && renderPrivacySettings()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-2">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-orange-600">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">You have unsaved changes</span>
              </div>
            )}
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                isSaving || !hasChanges
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-lg'
              }`}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  <span>Save & Sync</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
