import React, { useState, useCallback } from 'react';
import { Upload, Search, AlertCircle, RefreshCw, CheckCircle, XCircle, Clock, Music } from 'lucide-react';

const SampleIdentification = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [projectName, setProjectName] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [projects, setProjects] = useState([]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
      setError('');
    }
  }, []);

  const handleFileChange = useCallback((e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
      setError('');
    }
  }, []);

  const analyzeAudio = async () => {
    if (!uploadedFile || !projectName.trim()) return;

    setIsAnalyzing(true);
    setUploadProgress(0);
    setError('');

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      // Wait for upload to complete
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock analysis results
      const mockResults = {
        projectName: projectName,
        fileName: uploadedFile.name,
        duration: '3:45',
        samples: [
          {
            id: 1,
            title: 'Amen Break',
            artist: 'The Winstons',
            album: 'Amen, My Brother',
            year: 1969,
            confidence: 95,
            startTime: '0:15',
            endTime: '0:23',
            licensingStatus: 'cleared',
            copyrightHolder: 'Color-Red Music',
            riskLevel: 'low'
          },
          {
            id: 2,
            title: 'Think (About It)',
            artist: 'Lyn Collins',
            album: 'Think (About It)',
            year: 1972,
            confidence: 87,
            startTime: '1:32',
            endTime: '1:45',
            licensingStatus: 'uncleared',
            copyrightHolder: 'Universal Music Group',
            riskLevel: 'high'
          }
        ],
        overallRisk: 'medium',
        recommendations: [
          'Clear the Lyn Collins sample before commercial release',
          'Consider alternative arrangements for high-risk samples',
          'Document all cleared samples for future reference'
        ]
      };

      setAnalysisResults(mockResults);
      
      // Add to projects list
      const newProject = {
        id: Date.now(),
        name: projectName,
        fileName: uploadedFile.name,
        createdAt: new Date().toISOString(),
        samplesCount: mockResults.samples.length,
        riskLevel: mockResults.overallRisk
      };
      
      setProjects(prev => [newProject, ...prev.slice(0, 4)]);
      
    } catch (err) {
      setError('Failed to analyze audio file. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setUploadProgress(0);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'cleared':
        return <CheckCircle className="text-green-400" size={20} />;
      case 'uncleared':
        return <XCircle className="text-red-400" size={20} />;
      case 'pending':
        return <Clock className="text-yellow-400" size={20} />;
      default:
        return <AlertCircle className="text-gray-400" size={20} />;
    }
  };

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'low':
        return 'text-green-400';
      case 'medium':
        return 'text-yellow-400';
      case 'high':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* File Upload Section */}
      <div className="glass-effect rounded-lg p-6">
        <h1 className="text-3xl font-bold text-white mb-6">Sample Identification</h1>
        <p className="text-white text-opacity-80 mb-6">
          Upload your audio file to identify samples, check licensing status, and assess potential copyright risks.
        </p>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-accent bg-accent bg-opacity-10' 
              : 'border-white border-opacity-30 hover:border-accent'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="mx-auto text-white mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            {uploadedFile ? uploadedFile.name : 'Drop your audio file here'}
          </h3>
          <p className="text-white text-opacity-70 mb-4">
            Or click to browse (MP3, WAV, FLAC supported)
          </p>
          {uploadedFile && (
            <p className="text-white text-opacity-60 text-sm mb-4">
              File size: {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          )}
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="hidden"
            id="audio-upload"
          />
          <label
            htmlFor="audio-upload"
            className="inline-block bg-accent text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors"
          >
            Browse Files
          </label>
        </div>

        {/* Project Name Input */}
        {uploadedFile && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="project-name" className="block text-white font-medium mb-2">
                Project Name
              </label>
              <input
                id="project-name"
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter a name for this project"
                className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg text-white placeholder-white placeholder-opacity-50 focus:outline-none focus:border-accent focus:bg-opacity-20"
              />
            </div>
            <button
              onClick={analyzeAudio}
              disabled={isAnalyzing || !projectName.trim()}
              className="w-full bg-accent text-white py-3 px-6 rounded-lg font-medium hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isAnalyzing ? (
                <div className="flex items-center justify-center space-x-2">
                  <RefreshCw className="animate-spin" size={16} />
                  <span>Analyzing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search size={16} />
                  <span>Analyze Audio</span>
                </div>
              )}
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="text-red-400" size={20} />
              <p className="text-red-400 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Upload Progress */}
        {isAnalyzing && uploadProgress > 0 && (
          <div className="mt-4 bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">
                {uploadProgress < 100 ? 'Uploading...' : 'Analyzing audio...'}
              </span>
              <span className="text-white text-opacity-70">{uploadProgress}%</span>
            </div>
            <div className="w-full bg-white bg-opacity-20 rounded-full h-2">
              <div 
                className="bg-accent h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            {uploadProgress >= 100 && (
              <div className="flex items-center space-x-2 mt-2 text-white text-opacity-70">
                <RefreshCw className="animate-spin" size={16} />
                <span className="text-sm">Processing audio and identifying samples...</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <div className="glass-effect rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Analysis Results</h2>
            <div className="text-white text-opacity-70 text-sm">
              Project: {analysisResults.projectName}
            </div>
          </div>
          
          {analysisResults.samples && analysisResults.samples.length > 0 ? (
            <div className="space-y-4">
              {analysisResults.samples.map((sample) => (
                <div key={sample.id} className="bg-white bg-opacity-5 rounded-lg p-4 border border-white border-opacity-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white">{sample.title}</h3>
                      <p className="text-white text-opacity-70">
                        {sample.artist} • {sample.album} ({sample.year})
                      </p>
                      <p className="text-white text-opacity-60 text-sm mt-1">
                        Sample appears at {sample.startTime} - {sample.endTime} • {sample.confidence}% confidence
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {getStatusIcon(sample.licensingStatus)}
                      <span className={`text-sm font-medium ${getRiskColor(sample.riskLevel)}`}>
                        {sample.riskLevel.toUpperCase()} RISK
                      </span>
                    </div>
                  </div>
                  <div className="text-white text-opacity-60 text-sm">
                    <p><strong>Copyright Holder:</strong> {sample.copyrightHolder}</p>
                    <p><strong>Status:</strong> {sample.licensingStatus === 'cleared' ? 'Cleared for use' : 'Requires clearance'}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Music className="mx-auto text-white text-opacity-50 mb-4" size={48} />
              <p className="text-white text-opacity-70">No samples detected in this audio file.</p>
              <p className="text-white text-opacity-50 text-sm mt-2">
                This could mean the track is original or contains unrecognized samples.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Recent Projects */}
      {projects.length > 0 && (
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Recent Projects</h2>
          <div className="space-y-3">
            {projects.map((project) => (
              <div key={project.id} className="flex items-center justify-between p-3 bg-white bg-opacity-5 rounded-lg border border-white border-opacity-10">
                <div>
                  <h3 className="text-white font-medium">{project.name}</h3>
                  <p className="text-white text-opacity-60 text-sm">{project.fileName} • {project.samplesCount} samples</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium ${getRiskColor(project.riskLevel)}`}>
                    {project.riskLevel.toUpperCase()}
                  </span>
                  <p className="text-white text-opacity-50 text-xs">
                    {new Date(project.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleIdentification;
