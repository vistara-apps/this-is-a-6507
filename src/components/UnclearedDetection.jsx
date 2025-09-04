import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Upload, Search, FileText } from 'lucide-react';

export function UnclearedDetection({ onSamplesUpdate }) {
  const [uploadedTrack, setUploadedTrack] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState(null);
  const [riskLevel, setRiskLevel] = useState(null);

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setUploadedTrack(file);
      setScanResults(null);
      setRiskLevel(null);
    }
  };

  const scanForSamples = async () => {
    if (!uploadedTrack) return;

    setIsScanning(true);

    // Simulate scanning process
    setTimeout(() => {
      const mockResults = {
        trackName: uploadedTrack.name,
        totalSamples: 3,
        clearedSamples: 1,
        unclearedSamples: 2,
        samples: [
          {
            id: '1',
            name: 'Amen Break - The Winstons',
            timestamp: '0:32',
            duration: '4.2s',
            status: 'uncleared',
            riskLevel: 'high',
            confidence: 92,
            rightsHolder: 'Color-Red Music',
            notes: 'Famous break beat - high likelihood of detection'
          },
          {
            id: '2',
            name: 'Billie Jean - Michael Jackson',
            timestamp: '1:45',
            duration: '2.1s',
            status: 'uncleared',
            riskLevel: 'very-high',
            confidence: 98,
            rightsHolder: 'Sony Music Entertainment',
            notes: 'Major label, strictly enforced'
          },
          {
            id: '3',
            name: 'Think Break - Lyn Collins',
            timestamp: '2:15',
            duration: '1.8s',
            status: 'cleared',
            riskLevel: 'low',
            confidence: 85,
            rightsHolder: 'Warner Music Group',
            notes: 'Previously licensed'
          }
        ]
      };

      setScanResults(mockResults);
      
      // Calculate overall risk
      const highRiskCount = mockResults.samples.filter(s => s.riskLevel === 'very-high' || s.riskLevel === 'high').length;
      if (highRiskCount >= 2) {
        setRiskLevel('very-high');
      } else if (highRiskCount === 1) {
        setRiskLevel('high');
      } else {
        setRiskLevel('low');
      }

      // Update samples in parent component
      const newSamples = mockResults.samples.map(sample => ({
        sampleId: sample.id,
        projectId: 'detection-' + Date.now(),
        identifiedSampleName: sample.name,
        copyrightHolder: sample.rightsHolder,
        licensingStatus: sample.status === 'cleared' ? 'cleared' : 'uncleared',
        negotiationDetails: null
      }));
      
      onSamplesUpdate(prev => [...prev, ...newSamples]);
      setIsScanning(false);
    }, 4000);
  };

  const getRiskBadge = (risk) => {
    const styles = {
      'very-high': 'bg-red-500 text-white',
      'high': 'bg-orange-500 text-white',
      'medium': 'bg-yellow-500 text-black',
      'low': 'bg-green-500 text-white'
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${styles[risk]}`}>
        {risk.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getStatusIcon = (status) => {
    if (status === 'cleared') {
      return <CheckCircle className="text-green-500" size={20} />;
    }
    return <AlertTriangle className="text-red-500" size={20} />;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Uncleared Sample Detection</h1>
        <p className="text-xl text-white text-opacity-80">
          Scan your tracks to identify potential legal risks before release
        </p>
      </div>

      {/* Upload Section */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Upload Track for Scanning</h2>
        
        <div className="border-2 border-dashed border-white border-opacity-30 rounded-lg p-8 text-center hover:border-accent transition-colors">
          <Upload className="mx-auto text-white mb-4" size={48} />
          <h3 className="text-xl font-semibold text-white mb-2">
            {uploadedTrack ? uploadedTrack.name : 'Upload your finished track'}
          </h3>
          <p className="text-white text-opacity-70 mb-4">
            We'll scan for uncleared samples and assess legal risk
          </p>
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileUpload}
            className="hidden"
            id="track-upload"
          />
          <label
            htmlFor="track-upload"
            className="inline-block bg-accent text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-opacity-90 transition-colors"
          >
            Choose File
          </label>
        </div>

        {uploadedTrack && (
          <div className="mt-4 flex items-center justify-between bg-white bg-opacity-10 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <FileText className="text-white" size={24} />
              <div>
                <p className="text-white font-medium">{uploadedTrack.name}</p>
                <p className="text-white text-opacity-70 text-sm">
                  {(uploadedTrack.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={scanForSamples}
              disabled={isScanning}
              className="bg-accent text-white px-4 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {isScanning ? (
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Scanning...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search size={16} />
                  <span>Scan Track</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      {scanResults && (
        <div className="glass-effect rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold text-white">Risk Assessment</h2>
            {getRiskBadge(riskLevel)}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-white">{scanResults.totalSamples}</div>
              <div className="text-white text-opacity-70">Total Samples</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-green-400">{scanResults.clearedSamples}</div>
              <div className="text-white text-opacity-70">Cleared</div>
            </div>
            <div className="bg-white bg-opacity-10 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-red-400">{scanResults.unclearedSamples}</div>
              <div className="text-white text-opacity-70">Uncleared</div>
            </div>
          </div>

          {riskLevel === 'very-high' && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="text-red-400" size={20} />
                <span className="text-red-400 font-semibold">High Risk Warning</span>
              </div>
              <p className="text-white text-opacity-90 mt-2">
                This track contains multiple uncleared samples with high detection likelihood. 
                We strongly recommend securing licenses before release to avoid DMCA takedowns.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detected Samples */}
      {scanResults && (
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Detected Samples</h2>
          
          <div className="space-y-4">
            {scanResults.samples.map((sample) => (
              <div key={sample.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(sample.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-white">{sample.name}</h3>
                      <p className="text-white text-opacity-70">{sample.rightsHolder}</p>
                    </div>
                  </div>
                  {getRiskBadge(sample.riskLevel)}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm mb-3">
                  <div>
                    <span className="text-white text-opacity-70">Timestamp</span>
                    <p className="text-white font-medium">{sample.timestamp}</p>
                  </div>
                  <div>
                    <span className="text-white text-opacity-70">Duration</span>
                    <p className="text-white font-medium">{sample.duration}</p>
                  </div>
                  <div>
                    <span className="text-white text-opacity-70">Confidence</span>
                    <p className="text-white font-medium">{sample.confidence}%</p>
                  </div>
                  <div>
                    <span className="text-white text-opacity-70">Status</span>
                    <p className="text-white font-medium capitalize">{sample.status}</p>
                  </div>
                </div>

                <div className="bg-white bg-opacity-5 rounded p-3 mb-3">
                  <p className="text-white text-opacity-80 text-sm">{sample.notes}</p>
                </div>

                {sample.status === 'uncleared' && (
                  <div className="flex space-x-2">
                    <button className="bg-accent text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors">
                      Start Licensing
                    </button>
                    <button className="border border-white border-opacity-30 text-white px-3 py-1 rounded text-sm hover:bg-white hover:bg-opacity-10 transition-colors">
                      Find Alternatives
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {scanResults && riskLevel !== 'low' && (
        <div className="glass-effect rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Recommendations</h2>
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <p className="text-white text-opacity-80">
                Contact rights holders immediately to negotiate licensing terms
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <p className="text-white text-opacity-80">
                Consider using our DMCA Response Toolkit to prepare for potential takedowns
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
              <p className="text-white text-opacity-80">
                Delay release until sample clearances are secured
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}