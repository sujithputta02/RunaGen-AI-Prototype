import React, { useEffect, useState } from 'react';

const API_BASE = (import.meta as any).env.VITE_API_BASE || (import.meta as any).env.VITE_API_URL || 'http://localhost:3001';

const FullAnalysisModal: React.FC<{ id: string; onClose: () => void }> = ({ id, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        if (!id) {
          setError('No analysis ID provided');
          setLoading(false);
          return;
        }
        
        console.log('Fetching analysis from:', `${API_BASE}/analysis/${id}`);
        
        const res = await fetch(`${API_BASE}/analysis/${id}`);
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Error:', res.status, errorText);
          throw new Error(`Server error: ${res.status} - ${errorText}`);
        }
        
        const json = await res.json();
        console.log('Analysis data received:', json);
        
        if (mounted) setData(json);
      } catch (e: any) {
        console.error('Full analysis load error:', e);
        setError(e?.message || 'Failed to load analysis data');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white/95 backdrop-blur-2xl rounded-2xl p-6 w-full max-w-3xl border border-white/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-gray-900">Full Analysis</h3>
          <button onClick={onClose} className="px-3 py-1 rounded-xl border border-white/40 hover:bg-white/80 transition-all duration-300 backdrop-blur-sm shadow-lg">Close</button>
        </div>
        {loading && (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <span className="ml-3 text-gray-600">Loading analysis data...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-50/80 backdrop-blur-sm rounded-xl p-4 border border-red-200/60">
            <div className="flex items-center space-x-2">
              <div className="text-red-600">⚠️</div>
              <div>
                <h4 className="font-semibold text-red-800">Error Loading Analysis</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <p className="text-red-600 text-xs mt-2">
                  Make sure the server is running and try re-analyzing your resume.
                </p>
              </div>
            </div>
          </div>
        )}
        {data && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="text-sm text-gray-600">Target role</div>
              <div className="font-medium text-slate-800">{data.target_role}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-teal-50/80 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="text-sm text-gray-600">Match score</div>
              <div className="font-bold text-lg text-teal-700">{data.match_score}</div>
            </div>
            <div className="p-4 bg-green-50/80 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="text-sm font-semibold mb-3 text-green-800">Skills present</div>
              <div className="flex flex-wrap gap-2">
                {(data.skills_present || []).map((s: string) => (
                  <span key={s} className="text-xs bg-green-100/80 text-green-700 px-3 py-1 rounded-xl backdrop-blur-sm shadow-sm">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-orange-50/80 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="text-sm font-semibold mb-3 text-orange-800">Skills missing</div>
              <div className="flex flex-wrap gap-2">
                {(data.skills_missing || []).map((s: string) => (
                  <span key={s} className="text-xs bg-orange-100/80 text-orange-700 px-3 py-1 rounded-xl backdrop-blur-sm shadow-sm">{s}</span>
                ))}
              </div>
            </div>
            <div className="p-4 bg-blue-50/80 backdrop-blur-sm rounded-xl border border-white/40">
              <div className="text-sm font-semibold mb-3 text-blue-800">Recommendations</div>
              <ul className="list-disc ml-5 space-y-2 text-gray-800">
                {(data.recommendations || []).map((r: string, i: number) => (
                  <li key={i} className="text-sm leading-relaxed">{r}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullAnalysisModal;


