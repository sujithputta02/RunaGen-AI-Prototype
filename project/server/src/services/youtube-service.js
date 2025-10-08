import fetch from 'node-fetch';
import usetube from 'usetube';

export class YouTubeService {
  constructor() {
    // Always operate in non-API mode per user request
    this.apiKey = null;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  // Extract YouTube videoId from a URL or return null
  extractVideoId(url) {
    try {
      if (!url || typeof url !== 'string') return null;
      const match = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/) || url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  // Verify a YouTube URL via oEmbed; returns normalized URL if valid else null
  async verifyYouTubeUrl(url) {
    try {
      const videoId = this.extractVideoId(url);
      if (!videoId) return null;
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const res = await fetch(oembedUrl);
      if (res && res.ok) {
        return `https://www.youtube.com/watch?v=${videoId}`;
      }
      return null;
    } catch {
      return null;
    }
  }

  // Ensure a working YouTube URL for a given query and optional candidate
  async ensureWorkingYouTubeUrl(query, candidateUrl) {
    // 1) If candidate is valid, return normalized
    const verified = await this.verifyYouTubeUrl(candidateUrl);
    if (verified) return verified;

    // 2) Try search with details
    try {
      const results = await this.searchVideosWithDetails(query, 1);
      if (results && results.length > 0) {
        const valid = await this.verifyYouTubeUrl(results[0].url);
        if (valid) return valid;
      }
    } catch {}

    // 3) Final fallback to mock, validated
    try {
      const mocks = this.getMockVideoResults(query).slice(0, 1);
      if (mocks.length > 0) {
        const valid = await this.verifyYouTubeUrl(mocks[0].url);
        if (valid) return valid;
      }
    } catch {}

    return candidateUrl || null;
  }

  // Alternative search using usetube library (no API key required)
  async searchVideosAlternative(query, maxResults = 5) {
    try {
      console.log(`YouTubeService: Searching for "${query}" using usetube library`);
      const results = await usetube.searchVideo(query, maxResults);
      
      // Check if results exist and have videos property
      if (!results || typeof results !== 'object') {
        console.log('YouTubeService: Invalid results from usetube, falling back to mock data');
        return this.getMockVideoResults(query);
      }
      
      // usetube returns { videos: [], didyoumean: "" }
      const videos = results.videos || [];
      
      if (!videos || videos.length === 0) {
        console.log('YouTubeService: No results from usetube, falling back to mock data');
        return this.getMockVideoResults(query);
      }

      return videos.map(video => ({
        videoId: video.id,
        title: video.title,
        description: video.description || `Learn ${query} with this comprehensive tutorial`,
        thumbnail: video.thumbnail || `https://img.youtube.com/vi/${video.id}/mqdefault.jpg`,
        channelTitle: video.channelTitle || 'Educational Channel',
        publishedAt: video.publishedAt || new Date().toISOString(),
        url: `https://www.youtube.com/watch?v=${video.id}`,
        duration: video.duration || 'Unknown',
        viewCount: video.viewCount || 0,
        likeCount: video.likeCount || 0
      }));
    } catch (error) {
      console.error('YouTubeService: usetube search error:', error);
      return this.getMockVideoResults(query);
    }
  }

  // Web scraping method using YouTube search page
  async searchVideosWebScraping(query, maxResults = 5) {
    try {
      console.log(`YouTubeService: Searching for "${query}" using web scraping`);
      
      // Use a proxy service to avoid CORS issues
      const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
      const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(searchUrl)}`;
      
      const response = await fetch(proxyUrl);
      if (!response.ok) {
        throw new Error(`Web scraping request failed: ${response.status}`);
      }
      
      const html = await response.text();
      const videos = this.parseYouTubeSearchHTML(html, query, maxResults);
      
      return videos.length > 0 ? videos : this.getMockVideoResults(query);
    } catch (error) {
      console.error('YouTubeService: Web scraping error:', error);
      return this.getMockVideoResults(query);
    }
  }

  // Parse YouTube search page HTML to extract video information
  parseYouTubeSearchHTML(html, query, maxResults) {
    try {
      const videos = [];
      
      // Look for video data in script tags (YouTube embeds video data in JSON-LD)
      const scriptRegex = /<script[^>]*>[\s\S]*?var ytInitialData = ([\s\S]*?);[\s\S]*?<\/script>/;
      const match = html.match(scriptRegex);
      
      if (match) {
        try {
          const data = JSON.parse(match[1]);
          const contents = data?.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
          
          for (const item of contents) {
            if (videos.length >= maxResults) break;
            
            const videoRenderer = item?.videoRenderer;
            if (videoRenderer) {
              const videoId = videoRenderer.videoId;
              const title = videoRenderer.title?.runs?.[0]?.text || 'Untitled';
              const channelTitle = videoRenderer.ownerText?.runs?.[0]?.text || 'Unknown Channel';
              const thumbnail = videoRenderer.thumbnail?.thumbnails?.[0]?.url || `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
              const viewCount = videoRenderer.viewCountText?.simpleText || '0 views';
              const publishedAt = videoRenderer.publishedTimeText?.simpleText || 'Unknown';
              
              videos.push({
                videoId: videoId,
                title: title,
                description: `Learn ${query} with this tutorial`,
                thumbnail: thumbnail,
                channelTitle: channelTitle,
                publishedAt: publishedAt,
                url: `https://www.youtube.com/watch?v=${videoId}`,
                duration: 'Unknown',
                viewCount: viewCount,
                likeCount: 0
              });
            }
          }
        } catch (parseError) {
          console.log('YouTubeService: Could not parse YouTube data, using mock data');
        }
      }
      
      return videos.length > 0 ? videos : this.getMockVideoResults(query);
    } catch (error) {
      console.error('YouTubeService: HTML parsing error:', error);
      return this.getMockVideoResults(query);
    }
  }

  // Get video details using oEmbed (no API key required)
  async getVideoDetailsOEmbed(videoId) {
    try {
      const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error(`oEmbed request failed: ${response.status}`);
      }
      
      const data = await response.json();
      return {
        videoId: videoId,
        title: data.title,
        thumbnail: data.thumbnail_url,
        authorName: data.author_name,
        authorUrl: data.author_url,
        url: `https://www.youtube.com/watch?v=${videoId}`
      };
    } catch (error) {
      console.error('YouTubeService: oEmbed error:', error);
      return null;
    }
  }

  // Search for videos using YouTube RSS feeds (no API key required)
  async searchVideosRSS(query, maxResults = 5) {
    try {
      // Popular educational channels for different topics
      const channels = {
        'python': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'javascript': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'react': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'web development': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'programming': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'machine learning': 'UCbfYPyITQ-7l4upoX8nvctg', // Two Minute Papers
        'data science': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'java': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'css': 'UC8butISFwT-Wl7EV0hUK0BQ', // freeCodeCamp
        'html': 'UC8butISFwT-Wl7EV0hUK0BQ' // freeCodeCamp
      };

      // Find matching channel based on query
      const queryLower = query.toLowerCase();
      let channelId = channels['programming']; // default
      
      for (const [keyword, id] of Object.entries(channels)) {
        if (queryLower.includes(keyword)) {
          channelId = id;
          break;
        }
      }

      const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;
      const response = await fetch(rssUrl);
      
      if (!response.ok) {
        throw new Error(`RSS request failed: ${response.status}`);
      }
      
      const xmlText = await response.text();
      const videos = this.parseRSSFeed(xmlText, query, maxResults);
      
      return videos;
    } catch (error) {
      console.error('YouTubeService: RSS search error:', error);
      return this.getMockVideoResults(query);
    }
  }

  // Parse RSS feed XML to extract video information
  parseRSSFeed(xmlText, query, maxResults) {
    try {
      const videoRegex = /<entry>[\s\S]*?<yt:videoId>(.*?)<\/yt:videoId>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<published>(.*?)<\/published>[\s\S]*?<media:group>[\s\S]*?<media:description>(.*?)<\/media:description>[\s\S]*?<media:thumbnail url="(.*?)"[\s\S]*?<\/entry>/g;
      
      const videos = [];
      let match;
      let count = 0;
      
      while ((match = videoRegex.exec(xmlText)) !== null && count < maxResults) {
        const [, videoId, title, publishedAt, description, thumbnail] = match;
        
        // Filter videos that match the query
        if (title.toLowerCase().includes(query.toLowerCase()) || 
            description.toLowerCase().includes(query.toLowerCase())) {
          videos.push({
            videoId: videoId,
            title: title,
            description: description || `Learn ${query} with this tutorial`,
            thumbnail: thumbnail,
            channelTitle: 'Educational Channel',
            publishedAt: publishedAt,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            duration: 'Unknown',
            viewCount: 0,
            likeCount: 0
          });
          count++;
        }
      }
      
      return videos.length > 0 ? videos : this.getMockVideoResults(query);
    } catch (error) {
      console.error('YouTubeService: RSS parsing error:', error);
      return this.getMockVideoResults(query);
    }
  }

  // Search for YouTube videos based on query
  async searchVideos(query, maxResults = 5) {
    // Force non-API path
    if (true) {
      console.warn('YouTube API key not configured, using alternative methods');
      // Try alternative methods in order of preference
      try {
        // First try usetube library
        const usetubeResults = await this.searchVideosAlternative(query, maxResults);
        if (usetubeResults && usetubeResults.length > 0) {
          console.log(`YouTubeService: Found ${usetubeResults.length} videos using usetube`);
          return usetubeResults;
        }
      } catch (error) {
        console.log('YouTubeService: usetube failed, trying web scraping method');
      }

      try {
        // Try web scraping method
        const webScrapingResults = await this.searchVideosWebScraping(query, maxResults);
        if (webScrapingResults && webScrapingResults.length > 0) {
          console.log(`YouTubeService: Found ${webScrapingResults.length} videos using web scraping`);
          return webScrapingResults;
        }
      } catch (error) {
        console.log('YouTubeService: Web scraping failed, trying RSS method');
      }

      try {
        // Fallback to RSS method
        const rssResults = await this.searchVideosRSS(query, maxResults);
        if (rssResults && rssResults.length > 0) {
          console.log(`YouTubeService: Found ${rssResults.length} videos using RSS`);
          return rssResults;
        }
      } catch (error) {
        console.log('YouTubeService: RSS method failed, using mock data');
      }

      // Final fallback to mock data
      return this.getMockVideoResults(query);
    }
  }

  // Get video details including duration
  async getVideoDetails(videoIds) {
    if (!this.apiKey || !videoIds.length) {
      return [];
    }

    try {
      const detailsUrl = `${this.baseUrl}/videos`;
      const params = new URLSearchParams({
        part: 'contentDetails,snippet,statistics',
        id: videoIds.join(','),
        key: this.apiKey
      });

      const response = await fetch(`${detailsUrl}?${params}`);
      
      if (!response.ok) {
        console.warn(`YouTube API details not ok (${response.status}). Skipping details enrichment.`);
        return [];
      }

      const data = await response.json();
      
      return data.items.map(item => ({
        videoId: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails.medium?.url || item.snippet.thumbnails.default?.url,
        channelTitle: item.snippet.channelTitle,
        publishedAt: item.snippet.publishedAt,
        duration: this.parseDuration(item.contentDetails.duration),
        viewCount: parseInt(item.statistics.viewCount) || 0,
        likeCount: parseInt(item.statistics.likeCount) || 0,
        url: `https://www.youtube.com/watch?v=${item.id}`
      }));
    } catch (error) {
      console.error('YouTube API details error:', error);
      return [];
    }
  }

  // Parse YouTube duration format (PT4M13S) to readable format
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 'Unknown';
    
    const hours = parseInt(match[1]) || 0;
    const minutes = parseInt(match[2]) || 0;
    const seconds = parseInt(match[3]) || 0;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Generate mock video results when API key is not available
  getMockVideoResults(query) {
    // Real YouTube video IDs for popular programming/tech tutorials
    const realVideoIds = [
      'dQw4w9WgXcQ', // Rick Roll (fallback)
      'kJQP7kiw5Fk', // Despacito (fallback)
      '9bZkp7q19f0', // PSY - GANGNAM STYLE (fallback)
      'fJ9rUzIMcZQ', // Queen - Bohemian Rhapsody (fallback)
      'L_jWHffIx5E', // Smells Like Teen Spirit (fallback)
    ];

    // Programming/tech specific video IDs
    const techVideoIds = [
      'kqtD5dpb9y8', // Python Tutorial for Beginners
      'rfscVS0vtbw', // Python Full Course
      'pQN-pnXPaVc', // JavaScript Tutorial
      'hdI2bqOjy3c', // HTML CSS JavaScript
      'zJSY8tbf_ys', // React Tutorial
      'Ke90Tje7VS0', // Angular Tutorial
      '1Rs2ND1ryYc', // Node.js Tutorial
      'Oe421EPjeBE', // Java Tutorial
      'eIrMbAQSU34', // C++ Tutorial
      'HXV3zeQKqGY', // SQL Tutorial
      't2p8mP4iL0Q', // Machine Learning
      'aircAruvnKk', // Neural Networks
      'v7v3h2UzpvM', // Data Structures
      '8hly31xKli0', // Algorithms
      't2cXX8qcjR0', // Web Development
      '1uQtoTdH-Rs', // Full Stack Development
      'FWSRVO7zQ8I', // DevOps
      'k1VdZ_5u6ZE', // Docker
      '9zKuYdLw8Fs', // Kubernetes
      'XxXyfkr5CBM'  // AWS
    ];

    // Select appropriate video IDs based on query
    let selectedVideoIds = techVideoIds;
    if (query.toLowerCase().includes('python')) {
      selectedVideoIds = ['kqtD5dpb9y8', 'rfscVS0vtbw', 'zJSY8tbf_ys'];
    } else if (query.toLowerCase().includes('javascript') || query.toLowerCase().includes('js')) {
      selectedVideoIds = ['pQN-pnXPaVc', 'hdI2bqOjy3c', 'zJSY8tbf_ys'];
    } else if (query.toLowerCase().includes('react')) {
      selectedVideoIds = ['zJSY8tbf_ys', 'pQN-pnXPaVc', 'hdI2bqOjy3c'];
    } else if (query.toLowerCase().includes('java')) {
      selectedVideoIds = ['Oe421EPjeBE', 'eIrMbAQSU34', 't2cXX8qcjR0'];
    } else if (query.toLowerCase().includes('web') || query.toLowerCase().includes('html') || query.toLowerCase().includes('css')) {
      selectedVideoIds = ['hdI2bqOjy3c', 't2cXX8qcjR0', 't2cXX8qcjR0'];
    } else if (query.toLowerCase().includes('data') || query.toLowerCase().includes('machine learning') || query.toLowerCase().includes('ai')) {
      selectedVideoIds = ['t2p8mP4iL0Q', 'aircAruvnKk', 't2cXX8qcjR0'];
    }

    const mockVideos = selectedVideoIds.slice(0, 3).map((videoId, index) => ({
      videoId: videoId,
      title: `${query} - ${index === 0 ? 'Complete Tutorial' : index === 1 ? 'Beginner Guide' : 'Advanced Techniques'}`,
      description: `Learn ${query} from ${index === 0 ? 'basics to advanced concepts' : index === 1 ? 'perfect introduction for beginners' : 'master advanced techniques and best practices'}`,
      thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
      channelTitle: index === 0 ? 'Tech Tutorials' : index === 1 ? 'Learn Tech' : 'Pro Developers',
      publishedAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      url: `https://www.youtube.com/watch?v=${videoId}`,
      duration: index === 0 ? '15:30' : index === 1 ? '8:45' : '25:12',
      viewCount: Math.floor(Math.random() * 1000000) + 100000,
      likeCount: Math.floor(Math.random() * 10000) + 1000
    }));

    return mockVideos;
  }

  // Enhanced search with video details
  async searchVideosWithDetails(query, maxResults = 3) {
    try {
      // First search for videos
      const searchResults = await this.searchVideos(query, maxResults);
      
      if (!searchResults.length) {
        return this.getMockVideoResults(query);
      }

      // If using alternative methods (no API key), return results as-is
      if (!this.apiKey) {
        console.log(`YouTubeService: Returning ${searchResults.length} videos from alternative methods`);
        return searchResults;
      }

      // Get detailed information for each video (only when using official API)
      const videoIds = searchResults.map(video => video.videoId);
      const detailedResults = await this.getVideoDetails(videoIds);
      
      // Merge search results with detailed information
      const merged = searchResults.map(searchResult => {
        const details = detailedResults.find(detail => detail.videoId === searchResult.videoId);
        return {
          ...searchResult,
          ...details,
          url: searchResult.url // Keep the URL from search results
        };
      });
      // If details couldn't be fetched, return searchResults
      return merged.length ? merged : searchResults;
    } catch (error) {
      console.error('Error in searchVideosWithDetails:', error);
      // On error, try alternatives before mock
      try {
        const alt = await this.searchVideosAlternative(query, maxResults);
        if (alt && alt.length) return alt;
      } catch {}
      try {
        const web = await this.searchVideosWebScraping(query, maxResults);
        if (web && web.length) return web;
      } catch {}
      return this.getMockVideoResults(query);
    }
  }

  // Generate YouTube links for roadmap videos
  async generateRoadmapVideoLinks(roadmapData) {
    try {
      console.log('YouTubeService: Starting roadmap video link generation');
      const enhancedRoadmap = { ...roadmapData };
      
      // Process each stage
      const stages = ['stage_1_critical_gaps', 'stage_2_important_gaps', 'stage_3_nice_to_have'];
      
      for (const stage of stages) {
        console.log(`YouTubeService: Processing stage ${stage}`);
        if (enhancedRoadmap.roadmap && enhancedRoadmap.roadmap[stage]) {
          console.log(`YouTubeService: Found ${enhancedRoadmap.roadmap[stage].length} skills in ${stage}`);
          for (const skillGap of enhancedRoadmap.roadmap[stage]) {
            if (skillGap.youtube_videos) {
              console.log(`YouTubeService: Processing ${skillGap.youtube_videos.length} videos for skill ${skillGap.skill}`);
              for (const video of skillGap.youtube_videos) {
                if (video.search_query) {
                  console.log(`YouTubeService: Searching for video with query: ${video.search_query}`);
                  try {
                    const searchResults = await this.searchVideosWithDetails(video.search_query, 1);
                    console.log(`YouTubeService: Found ${searchResults.length} results for query: ${video.search_query}`);
                    if (searchResults.length > 0) {
                      const bestMatch = searchResults[0];
                      // Ensure URL actually works; fallback to alternatives if needed
                      const ensuredUrl = await this.ensureWorkingYouTubeUrl(video.search_query, bestMatch.url);
                      video.url = ensuredUrl || bestMatch.url;
                      video.videoId = this.extractVideoId(video.url) || bestMatch.videoId;
                      video.thumbnail = bestMatch.thumbnail;
                      video.duration = bestMatch.duration;
                      video.viewCount = bestMatch.viewCount;
                      video.channelTitle = bestMatch.channelTitle;
                      video.publishedAt = bestMatch.publishedAt;
                      console.log(`YouTubeService: Enhanced video with URL: ${video.url}`);
                    }
                  } catch (error) {
                    console.error(`YouTubeService: Error fetching video for query "${video.search_query}":`, error);
                    // Keep the search_query as fallback
                  }
                }
              }
            }
          }
        }
      }
      
      console.log('YouTubeService: Roadmap video link generation completed');
      return enhancedRoadmap;
    } catch (error) {
      console.error('YouTubeService: Error generating roadmap video links:', error);
      return roadmapData; // Return original data if enhancement fails
    }
  }
}

export default YouTubeService;

