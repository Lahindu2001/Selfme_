import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { removeAuthToken } from '../../utils/auth';
import './FinanceManager.css';
import Sidebar from './Sidebar';
import ContentHeader from './ContentHeader';
// Section Components
import Dashboard from './sections/Dashboard';
import Receipts from './sections/Receipts';
import Reports from './sections/Reports';
import Salaries from './sections/Salaries';
import Payments from './sections/Payments';
import TaxCompliance from './sections/TaxCompliance';
import Analytics from './sections/Analytics';

const FinanceManager = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const navigate = useNavigate();
  
  // Retrieve user data from localStorage
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Finance'; // Use firstName, default to 'Finance'

  const handleLogout = () => {
    removeAuthToken();
    localStorage.removeItem('authUser'); // Clear user data
    navigate('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'receipts': return <Receipts />;
      case 'reports': return <Reports />;
      case 'salaries': return <Salaries />;
      case 'payments': return <Payments />;
      case 'tax': return <TaxCompliance />;
      case 'analytics': return <Analytics />;
      default: return <div>Select a section from the menu</div>;
    }
  };

  return (
    <div className="finance-management">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="main-content">
        <ContentHeader firstName={firstName} handleLogout={handleLogout} />
        <div className="content-body">{renderContent()}</div>
      </div>
    </div>
  );
};

export default FinanceManager;