import React from 'react';
import { Youtube, ExternalLink, Clock, Eye } from 'lucide-react';

interface YouTubeVideoCardProps {
  video: {
    title: string;
    topic: string;
    search_query: string;
    url?: string;
    videoId?: string;
    thumbnail?: string;
    duration?: string;
    viewCount?: number;
    channelTitle?: string;
    publishedAt?: string;
  };
  compact?: boolean;
}

const YouTubeVideoCard: React.FC<YouTubeVideoCardProps> = ({ video, compact = false }) => {
  const formatViewCount = (count: number | string) => {
    if (typeof count === 'string') return count;
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  if (compact) {
    return (
      <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div className="flex-shrink-0">
            {video.thumbnail ? (
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-12 h-8 object-cover rounded"
              />
            ) : (
              <div className="w-12 h-8 bg-red-500 rounded flex items-center justify-center">
                <Youtube className="h-4 w-4 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 truncate">{video.title}</h4>
            <p className="text-xs text-gray-600 truncate">{video.topic}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          {video.duration && (
            <span className="text-xs text-gray-500 flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {video.duration}
            </span>
          )}
          {video.url ? (
            <a
              href={video.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-xs font-medium"
            >
              <ExternalLink className="h-3 w-3" />
              <span>Watch</span>
            </a>
          ) : (
            <span className="text-xs text-gray-400">No link</span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-white/40 hover:shadow-xl transition-all duration-300">
      <div className="relative">
        {video.thumbnail ? (
          <img 
            src={video.thumbnail} 
            alt={video.title}
            className="w-full h-48 object-cover rounded-t-xl"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-red-500 to-red-600 rounded-t-xl flex items-center justify-center">
            <Youtube className="h-16 w-16 text-white" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
          {video.duration || 'Unknown'}
        </div>
      </div>
      
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-2 line-clamp-2">{video.title}</h4>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{video.topic}</p>
        
        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
          <div className="flex items-center space-x-3">
            {video.channelTitle && (
              <span className="truncate">{video.channelTitle}</span>
            )}
            {video.viewCount && (
              <span className="flex items-center">
                <Eye className="h-3 w-3 mr-1" />
                {formatViewCount(video.viewCount)}
              </span>
            )}
          </div>
        </div>
        
        {video.url ? (
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Youtube className="h-4 w-4" />
            <span>Watch on YouTube</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <div className="w-full bg-gray-300 text-gray-600 font-medium py-2 px-4 rounded-lg flex items-center justify-center space-x-2">
            <Youtube className="h-4 w-4" />
            <span>Video not available</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default YouTubeVideoCard;
