import React from 'react';

const icons = {
  receipt: '🧾',
  report: '📊',
  salary: '💰',
  payment: '💳',
  tax: '📋',
  analytics: '📈',
  dashboard: '🏠'
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: icons.dashboard },
  { id: 'receipts', label: 'Generate Receipts', icon: icons.receipt },
  { id: 'reports', label: 'Financial Reports', icon: icons.report },
  { id: 'salaries', label: 'Manage Salaries', icon: icons.salary },
  { id: 'payments', label: 'Payment Status', icon: icons.payment },
  { id: 'tax', label: 'Tax Compliance', icon: icons.tax },
  { id: 'analytics', label: 'Analytics Dashboard', icon: icons.analytics }
];

const Sidebar = ({ activeSection, setActiveSection }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Finance Management</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => setActiveSection(item.id)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
