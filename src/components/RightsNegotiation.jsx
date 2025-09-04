import React, { useState } from 'react';
import { MessageSquare, FileText, User, Clock, CheckCircle, XCircle } from 'lucide-react';

export function RightsNegotiation({ samples }) {
  const [selectedSample, setSelectedSample] = useState(null);
  const [negotiationTemplate, setNegotiationTemplate] = useState('standard');
  const [customTerms, setCustomTerms] = useState('');
  const [negotiations, setNegotiations] = useState([
    {
      id: '1',
      sampleName: 'Break My Soul - Beyoncé',
      rightsHolder: 'Parkwood Entertainment',
      status: 'pending',
      lastMessage: 'Initial terms sent',
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      messages: [
        {
          id: '1',
          sender: 'user',
          message: 'Hello, I would like to license a sample from "Break My Soul" for my upcoming track.',
          timestamp: new Date(Date.now() - 172800000).toISOString()
        },
        {
          id: '2',
          sender: 'rightsHolder',
          message: 'Thank you for reaching out. We can discuss licensing terms. What type of release is this for?',
          timestamp: new Date(Date.now() - 86400000).toISOString()
        }
      ]
    }
  ]);

  const templates = {
    standard: `Dear [Rights Holder],

I am writing to request permission to use a sample from "[Song Title]" in my upcoming musical work. 

Details:
- Sample duration: [Duration]
- Intended use: [Commercial/Non-commercial]
- Distribution: [Platforms]
- Territory: [Geographic scope]

I am prepared to negotiate fair licensing terms and provide appropriate credit. Please let me know your requirements and fees.

Best regards,
[Your Name]`,
    
    commercial: `Dear [Rights Holder],

I am seeking to license a sample from "[Song Title]" for commercial release.

Project Details:
- Artist/Label: [Your details]
- Release type: [Single/Album/EP]
- Expected release date: [Date]
- Distribution channels: [Streaming, physical, etc.]
- Territory: Worldwide

I understand this requires mechanical and synchronization rights. Please provide your standard licensing terms and fees.

Thank you for your consideration.

[Your Name]`,
    
    nonCommercial: `Dear [Rights Holder],

I would like to request permission to use a sample from "[Song Title]" for a non-commercial project.

This is for [educational/artistic/promotional] purposes with no commercial distribution planned. I will provide full attribution and credit.

Please let me know if this use would be acceptable and if any fees apply.

Respectfully,
[Your Name]`
  };

  const startNegotiation = () => {
    if (!selectedSample) return;

    const newNegotiation = {
      id: Date.now().toString(),
      sampleName: selectedSample.identifiedSampleName,
      rightsHolder: selectedSample.copyrightHolder,
      status: 'pending',
      lastMessage: 'Initial terms sent',
      updatedAt: new Date().toISOString(),
      messages: [
        {
          id: '1',
          sender: 'user',
          message: templates[negotiationTemplate].replace('[Song Title]', selectedSample.identifiedSampleName),
          timestamp: new Date().toISOString()
        }
      ]
    };

    setNegotiations(prev => [newNegotiation, ...prev]);
    setSelectedSample(null);
    setCustomTerms('');
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="text-green-500" size={16} />;
      case 'rejected':
        return <XCircle className="text-red-500" size={16} />;
      case 'pending':
        return <Clock className="text-yellow-500" size={16} />;
      default:
        return <Clock className="text-gray-500" size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Rights Negotiation & Licensing Portal</h1>
        <p className="text-xl text-white text-opacity-80">
          Manage and track your sample licensing negotiations
        </p>
      </div>

      {/* Start New Negotiation */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Start New Negotiation</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Select Sample</label>
            <select
              value={selectedSample?.sampleId || ''}
              onChange={(e) => {
                const sample = samples.find(s => s.sampleId === e.target.value);
                setSelectedSample(sample);
              }}
              className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white"
            >
              <option value="">Choose a sample...</option>
              {samples.map((sample) => (
                <option key={sample.sampleId} value={sample.sampleId} className="text-black">
                  {sample.identifiedSampleName} - {sample.copyrightHolder}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Template</label>
            <select
              value={negotiationTemplate}
              onChange={(e) => setNegotiationTemplate(e.target.value)}
              className="w-full bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white"
            >
              <option value="standard" className="text-black">Standard License Request</option>
              <option value="commercial" className="text-black">Commercial Use</option>
              <option value="nonCommercial" className="text-black">Non-Commercial Use</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-white text-sm font-medium mb-2">Message Template</label>
          <textarea
            value={templates[negotiationTemplate]}
            readOnly
            className="w-full h-32 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white text-sm"
          />
        </div>

        <div className="mt-4">
          <label className="block text-white text-sm font-medium mb-2">Additional Terms (Optional)</label>
          <textarea
            value={customTerms}
            onChange={(e) => setCustomTerms(e.target.value)}
            placeholder="Add any specific terms or conditions..."
            className="w-full h-20 bg-white bg-opacity-10 border border-white border-opacity-30 rounded-lg px-3 py-2 text-white placeholder-white placeholder-opacity-50"
          />
        </div>

        <button
          onClick={startNegotiation}
          disabled={!selectedSample}
          className="mt-4 bg-accent text-white px-6 py-2 rounded-lg font-medium hover:bg-opacity-90 transition-colors disabled:opacity-50"
        >
          Start Negotiation
        </button>
      </div>

      {/* Active Negotiations */}
      <div className="glass-effect rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-white mb-4">Active Negotiations</h2>
        
        {negotiations.length === 0 ? (
          <p className="text-white text-opacity-70">No active negotiations. Start one above!</p>
        ) : (
          <div className="space-y-4">
            {negotiations.map((negotiation) => (
              <div key={negotiation.id} className="bg-white bg-opacity-10 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{negotiation.sampleName}</h3>
                    <p className="text-white text-opacity-70">{negotiation.rightsHolder}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(negotiation.status)}
                    <span className="text-white text-sm capitalize">{negotiation.status}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-white text-opacity-70">
                    <MessageSquare size={16} />
                    <span>{negotiation.lastMessage}</span>
                  </div>
                  <span className="text-white text-opacity-70">
                    {new Date(negotiation.updatedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="mt-3 flex space-x-2">
                  <button className="bg-accent text-white px-3 py-1 rounded text-sm hover:bg-opacity-90 transition-colors">
                    View Messages
                  </button>
                  <button className="border border-white border-opacity-30 text-white px-3 py-1 rounded text-sm hover:bg-white hover:bg-opacity-10 transition-colors">
                    Download Agreement
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Licensing Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">{negotiations.length}</div>
          <div className="text-white text-opacity-70">Active Negotiations</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {negotiations.filter(n => n.status === 'approved').length}
          </div>
          <div className="text-white text-opacity-70">Approved Licenses</div>
        </div>
        <div className="glass-effect rounded-lg p-4 text-center">
          <div className="text-3xl font-bold text-white">
            {negotiations.filter(n => n.status === 'pending').length}
          </div>
          <div className="text-white text-opacity-70">Pending Responses</div>
        </div>
      </div>
    </div>
  );
}