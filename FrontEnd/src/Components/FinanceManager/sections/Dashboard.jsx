import React from 'react';

const Dashboard = () => {
  return (
    <div className="content-section">
      <h2>Finance Dashboard</h2>
      <div className="dashboard-cards">
        <div className="card">
          <h3>Total Revenue</h3>
          <p className="amount">$125,430</p>
          <span className="trend positive">+12.5%</span>
        </div>
        <div className="card">
          <h3>Monthly Expenses</h3>
          <p className="amount">$45,230</p>
          <span className="trend negative">-5.2%</span>
        </div>
        <div className="card">
          <h3>Net Profit</h3>
          <p className="amount">$80,200</p>
          <span className="trend positive">+18.3%</span>
        </div>
        <div className="card">
          <h3>Pending Payments</h3>
          <p className="amount">$15,670</p>
          <span className="trend neutral">0%</span>
        </div>
      </div>
      <div className="recent-activities">
        <h3>Recent Activities</h3>
        <ul>
          <li>Payment received from Client ABC - $5,000</li>
          <li>Salary payment processed for John Doe - $3,500</li>
          <li>Tax filing submitted for Q3 2024</li>
          <li>Invoice generated for Project XYZ - $8,200</li>
        </ul>
      </div>
    </div>
  );
};

export default Dashboard;
