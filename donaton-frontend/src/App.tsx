import React, { useState } from 'react';
import { DonacionForm } from './components/DonacionForm';
import { DonacionList } from './components/DonacionList';

const App: React.FC = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleDonacionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container">
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary">Sistema Donatón</h1>
          <p className="lead text-secondary">Plataforma integral para el registro de donaciones</p>
        </header>
        <main>
          <DonacionForm onSuccess={handleDonacionSuccess} />
          <DonacionList refreshTrigger={refreshTrigger} />
        </main>
      </div>
    </div>
  );
};

export default App;
