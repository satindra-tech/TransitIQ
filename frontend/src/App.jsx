import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import TopHeader from './components/TopHeader';
import MainDashboardTab from './components/MainDashboardTab';
import DemandForecastTab from './components/DemandForecastTab';
import MapTab from './components/MapTab';
import AlertsCentreTab from './components/AlertsCentreTab';
import RecommendationsTab from './components/RecommendationsTab';
import BusAllocationTab from './components/BusAllocationTab';
import SimulationTab from './components/SimulationTab';
import AnalyticsReportsTab from './components/AnalyticsReportsTab';
import DataManagementTab from './components/DataManagementTab';
import SettingsTab from './components/SettingsTab';
import PassengerTab from './components/PassengerTab';
import HackathonDemoModal from './components/HackathonDemoModal';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [hour, setHour] = useState(9); // Default 09:00 AM Peak Rush
  const [dayOfWeek, setDayOfWeek] = useState(0); // Default Monday
  const [selectedRoute, setSelectedRoute] = useState('570');
  const [activeRole, setActiveRole] = useState('Transport Operator');
  const [isDarkMode, setIsDarkMode] = useState(false); // Default Clean Light Theme as per Section 10
  const [showDemoStory, setShowDemoStory] = useState(false);

  const [overviewData, setOverviewData] = useState(null);
  const [routesCatalog, setRoutesCatalog] = useState([]);
  const [loading, setLoading] = useState(true);

  // Apply dark mode class to root html element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch Route Catalog once
  useEffect(() => {
    fetch('/api/routes')
      .then(res => res.json())
      .then(data => {
        setRoutesCatalog(data || []);
      })
      .catch(err => console.error('Error fetching routes:', err));
  }, []);

  // Fetch Overview Data on hour or day change
  const fetchOverview = () => {
    setLoading(true);
    fetch(`/api/overview?hour=${hour}&day_of_week=${dayOfWeek}`)
      .then(res => res.json())
      .then(data => {
        setOverviewData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching overview:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOverview();
  }, [hour, dayOfWeek]);

  const handleSelectRoute = (rnum) => {
    setSelectedRoute(rnum);
    setCurrentTab('forecast');
  };

  const handleSimulateRoute = (rnum) => {
    setSelectedRoute(rnum);
    setCurrentTab('simulator');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* 1. Left Sidebar Navigation (Section 10) */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        alertsCount={overviewData?.critical_overcrowded_count || 0}
        activeRole={activeRole}
        onStartDemoStory={() => setShowDemoStory(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <TopHeader
          hour={hour}
          setHour={setHour}
          dayOfWeek={dayOfWeek}
          setDayOfWeek={setDayOfWeek}
          activeRole={activeRole}
          setActiveRole={setActiveRole}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          alertsCount={overviewData?.critical_overcrowded_count || 0}
          onRefresh={fetchOverview}
          loading={loading}
          onNavigateTab={setCurrentTab}
        />

        {/* Dynamic Tab Body */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {currentTab === 'dashboard' && (
            <MainDashboardTab
              data={overviewData}
              hour={hour}
              dayOfWeek={dayOfWeek}
              onSelectRoute={handleSelectRoute}
              onNavigateTab={setCurrentTab}
              onStartDemoStory={() => setShowDemoStory(true)}
            />
          )}

          {currentTab === 'forecast' && (
            <DemandForecastTab
              routes={routesCatalog}
              selectedRoute={selectedRoute}
              onSelectRoute={setSelectedRoute}
              hour={hour}
              dayOfWeek={dayOfWeek}
            />
          )}

          {currentTab === 'live-ops' && (
            <MapTab
              hour={hour}
              dayOfWeek={dayOfWeek}
              onSelectRoute={handleSelectRoute}
              onSimulateRoute={handleSimulateRoute}
              isDarkMode={isDarkMode}
            />
          )}

          {currentTab === 'alerts' && (
            <AlertsCentreTab
              hour={hour}
              dayOfWeek={dayOfWeek}
              onSimulateRoute={handleSimulateRoute}
            />
          )}

          {currentTab === 'recommendations' && (
            <RecommendationsTab
              hour={hour}
              dayOfWeek={dayOfWeek}
              onSimulateRoute={handleSimulateRoute}
            />
          )}

          {currentTab === 'bus-allocation' && (
            <BusAllocationTab
              hour={hour}
              dayOfWeek={dayOfWeek}
              onSimulateRoute={handleSimulateRoute}
            />
          )}

          {currentTab === 'simulator' && (
            <SimulationTab
              routes={routesCatalog}
              selectedRoute={selectedRoute}
              hour={hour}
              dayOfWeek={dayOfWeek}
            />
          )}

          {currentTab === 'analytics' && (
            <AnalyticsReportsTab
              hour={hour}
              dayOfWeek={dayOfWeek}
              routeEvaluations={overviewData?.route_evaluations || []}
            />
          )}

          {currentTab === 'data-mgmt' && (
            <DataManagementTab
              routes={routesCatalog}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsTab
              activeRole={activeRole}
            />
          )}

          {currentTab === 'passenger' && (
            <PassengerTab
              hour={hour}
              dayOfWeek={dayOfWeek}
            />
          )}
        </main>
      </div>

      {/* 3. Section 16: 17-Step Hackathon Walkthrough Modal */}
      <HackathonDemoModal
        isOpen={showDemoStory}
        onClose={() => setShowDemoStory(false)}
        onNavigateTab={setCurrentTab}
        onSelectRoute={setSelectedRoute}
      />
    </div>
  );
}
