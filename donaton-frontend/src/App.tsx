import React, { useState } from 'react';
import { DonacionForm } from './components/DonacionForm';
import { DonacionList } from './components/DonacionList';
import PanelLogistico from './components/PanelLogistico';

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [currentView, setCurrentView] = useState<'donaciones' | 'logistica'>('donaciones');

  const handleDonacionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">Sistema Donatón</h1>
          <p className="lead text-secondary">Plataforma integral para el registro de donaciones</p>
          
          <div className="btn-group mt-3" role="group">
            <button 
              className={`btn btn-${currentView === 'donaciones' ? 'primary' : 'outline-primary'}`}
              onClick={() => setCurrentView('donaciones')}
            >
              Registro de Donaciones
            </button>
            <button 
              className={`btn btn-${currentView === 'logistica' ? 'primary' : 'outline-primary'}`}
              onClick={() => setCurrentView('logistica')}
            >
              Gestión de Despachos
            </button>
          </div>
        </header>
        <main>
          {currentView === 'donaciones' ? (
            <>
              <DonacionForm onSuccess={handleDonacionSuccess} />
              <DonacionList refreshTrigger={refreshTrigger} />
            </>
          ) : (
            <PanelLogistico />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
