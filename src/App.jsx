import React, { useState } from 'react';
import { Dashboard } from './components/Dashboard';
import { SampleIdentification } from './components/SampleIdentification';
import { RightsNegotiation } from './components/RightsNegotiation';
import { UnclearedDetection } from './components/UnclearedDetection';
import { DMCAToolkit } from './components/DMCAToolkit';
import { Sidebar } from './components/Sidebar';

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [samples, setSamples] = useState([]);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard projects={projects} samples={samples} />;
      case 'sample-id':
        return <SampleIdentification onProjectCreate={setProjects} projects={projects} />;
      case 'rights':
        return <RightsNegotiation samples={samples} />;
      case 'detection':
        return <UnclearedDetection onSamplesUpdate={setSamples} />;
      case 'dmca':
        return <DMCAToolkit />;
      default:
        return <Dashboard projects={projects} samples={samples} />;
    }
  };

  return (
    <div className="min-h-screen gradient-bg">
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-screen-xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;