import React, { useState, useCallback } from 'react';
import HomePage      from './pages/HomePage.jsx';
import CalcPage      from './pages/CalcPage.jsx';
import InversePage   from './pages/InversePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import Navbar        from './components/Navbar.jsx';
import { useAppState } from './hooks/useAppState.js';

export default function App() {
  const [view, setView] = useState('home'); // 'home' | 'app'
  const [tab,  setTab]  = useState('calc'); // 'calc' | 'inverse' | 'dash'

  const {
    times, customs, monthlyData,
    setDeviceTime, setCustomTime,
    addCustomDevice, resetAll,
    applySuggestions,
    addMonthEntry, removeMonthEntry,
    autoSaveCalc,
  } = useAppState();

  const goToApp = () => { setView('app'); setTab('calc'); };
  const goHome  = () => setView('home');

  const handleApplySuggestions = useCallback((suggestions) => {
    applySuggestions(suggestions);
    setTab('calc');
  }, [applySuggestions]);

  if (view === 'home') {
    return <HomePage onStart={goToApp} />;
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar page={tab} onTabChange={setTab} onHome={goHome} />

      <div style={{ flex: 1 }}>
        <div style={{ display: tab === 'calc' ? 'block' : 'none' }}>
          <CalcPage
            times={times}
            customs={customs}
            setDeviceTime={setDeviceTime}
            setCustomTime={setCustomTime}
            addCustomDevice={addCustomDevice}
            resetAll={resetAll}
            monthlyData={monthlyData}
            addMonthEntry={addMonthEntry}
          />
        </div>

        <div style={{ display: tab === 'inverse' ? 'block' : 'none' }}>
          <InversePage applySuggestions={handleApplySuggestions} />
        </div>

        <div style={{ display: tab === 'dash' ? 'block' : 'none' }}>
          <DashboardPage
            active={tab === 'dash'}
            monthlyData={monthlyData}
            addMonthEntry={addMonthEntry}
            removeMonthEntry={removeMonthEntry}
            times={times}
            customs={customs}
          />
        </div>
      </div>
    </div>
  );
}
