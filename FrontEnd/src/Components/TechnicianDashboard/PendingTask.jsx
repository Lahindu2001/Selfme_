import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import jsPDF from 'jspdf';
import TechnicianLayout from './TechnicianLayout';
import './PendingTasks.css';

function PendingTasks() {
  const navigate = useNavigate();
  const authUser = JSON.parse(localStorage.getItem('authUser') || '{}');
  const firstName = authUser.firstName || 'Technician';
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusUpdates, setStatusUpdates] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  // Company Information
  const companyInfo = {
    name: 'SelfMe',
    tagline: 'FUTURE OF SUN - SOLAR POWER',
    address: ['No/346, Madalanda, Dompe,', 'Colombo, Sri Lanka'],
    phone: '+94 717 882 883',
    email: 'Selfmepvtltd@gmail.com',
    website: 'www.selfme.com',
  };

  // Fetch pending tasks on component mount
  useEffect(() => {
    console.log('PendingTasks mounted, fetching pending tasks...');
    fetchPendingTasks();
  }, []);

  const fetchPendingTasks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found');
        return;
      }
      const res = await axios.get('http://localhost:5000/api/tech/paidtasks/pending', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      const taskData = Array.isArray(res.data) ? res.data : [];
      setTasks(taskData);
      // Initialize statusUpdates with current statusofmy values
      const initialStatusUpdates = taskData.reduce((acc, task) => ({
        ...acc,
        [task.paymentId]: task.statusofmy || 'pending',
      }), {});
      setStatusUpdates(initialStatusUpdates);
      console.log('✅ Pending tasks fetched:', taskData.length, taskData);
    } catch (err) {
      console.error('💥 Pending tasks fetch error:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
      console.log('Fetch pending tasks complete, isLoading:', false);
    }
  };

  const handleStatusChange = (paymentId, value) => {
    setStatusUpdates((prev) => ({
      ...prev,
      [paymentId]: value,
    }));
  };

  const handleUpdateStatus = async (paymentId) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('⚠️ No token found for updating statusofmy');
        return;
      }
      const statusofmy = statusUpdates[paymentId];
      await axios.put(
        `http://localhost:5000/api/tech/paidtasks/${paymentId}/statusofmy`,
        { statusofmy },
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );
      console.log(`✅ Updated statusofmy to ${statusofmy} for paymentId: ${paymentId}`);
      // Refresh tasks to remove updated tasks (e.g., if changed to Completed)
      await fetchPendingTasks();
    } catch (err) {
      console.error('❌ Error updating statusofmy:', err.response?.data, err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Logo Conversion
  const getLogoAsBase64 = () => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        const base64 = canvas.toDataURL('image/png');
        resolve(base64);
      };
      img.onerror = () => {
        console.warn('Could not load logo, proceeding without it');
        resolve(null);
      };
      img.src = '/newLogo.png';
    });
  };

  // PDF Generation
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No tasks to download!');
    try {
      const logoBase64 = await getLogoAsBase64();
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const addLetterhead = () => {
        if (logoBase64) {
          doc.addImage(logoBase64, 'PNG', 15, 10, 20, 20);
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text(companyInfo.name, pageWidth / 2, 20, { align: 'center' });
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(companyInfo.address.join(', '), pageWidth / 2, 28, { align: 'center' });
        doc.text(`Phone: ${companyInfo.phone} | Email: ${companyInfo.email} | Website: ${companyInfo.website}`, pageWidth / 2, 34, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(15, 40, pageWidth - 15, 40);
      };

      const addFooter = (pageNum, totalPages, lastRecordIdx) => {
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
        const footerText = `Generated by ${companyInfo.name} Task Management System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        const recordText = lastRecordIdx >= 0 ? `Task #${String(lastRecordIdx + 1).padStart(3, '0')}` : '';
        doc.text(`Page ${pageNum} of ${totalPages} | ${recordText}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
        const genDate = new Date().toLocaleDateString('en-GB');
        const genTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        doc.text(`Generated on ${genDate} at ${genTime}`, 15, pageHeight - 10);
      };

      const addSignatureField = () => {
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text('Authorized Signature: __________________', pageWidth - 85, pageHeight - 30);
      };

      const fields = ['paymentId', 'userId', 'customer', 'amount', 'paymentDate', 'status', 'statusofmy'];
      let totalPages = 1;
      let tempY = 50;
      let lastRecordIdxPerPage = [];
      let currentPageRecords = [];

      data.forEach((_, idx) => {
        let itemHeight = fields.length * 10 + 20;
        if (tempY + itemHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 50;
        }
        currentPageRecords.push(idx);
        tempY += itemHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);

      let currentPage = 1;
      let y = 50;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });

      data.forEach((task, idx) => {
        let itemHeight = fields.length * 10 + 20;
        if (y + itemHeight > pageHeight - 40) {
          addSignatureField();
          addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 50;
        }
        doc.setFont('times', 'bold');
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text(`Task #${String(idx + 1).padStart(3, '0')}`, 15, y);
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        y += 10;
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.rect(15, y, pageWidth - 30, fields.length * 10 + 5, 'S');
        y += 5;
        fields.forEach((field) => {
          let label = field.replace(/([A-Z])/g, ' $1').trim().replace(/\b\w/g, (l) => l.toUpperCase());
          let value = task[field] || 'N/A';
          if (field === 'paymentDate') {
            value = value ? new Date(value).toLocaleDateString('en-GB') : 'N/A';
          } else if (field === 'amount') {
            value = `Rs. ${value.toLocaleString() || '0'}`;
          }
          if (typeof value === 'string' && value.length > 50) {
            value = value.substring(0, 47) + '...';
          }
          doc.setFont('times', 'bold');
          doc.text(`${label}:`, 20, y);
          doc.setFont('times', 'normal');
          doc.text(String(value), 60, y);
          y += 10;
        });
        y += 5;
        if (idx < data.length - 1) {
          doc.setLineWidth(0.2);
          doc.setDrawColor(200, 200, 200);
          doc.line(15, y, pageWidth - 15, y);
          y += 5;
        }
      });
      addSignatureField();
      addFooter(currentPage, totalPages, lastRecordIdxPerPage[currentPage - 1]);
      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      alert(`Official report "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // Download Functions
  const handleDownloadAll = () => generatePDF(tasks, 'Pending Tasks Report');
  const handleDownloadSingle = (task) => generatePDF([task], `Task Report - ${task.paymentId || 'Unnamed'}`);

  // Filtered Tasks
  const filteredTasks = tasks.filter(
    (task) =>
      (task.paymentId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (task.userId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (task.customer?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (String(task.amount) || '').includes(searchTerm)
  );

  const handleLogout = () => {
    localStorage.removeItem('authUser');
    navigate('/login');
  };

  return (
    <TechnicianLayout firstName={firstName} handleLogout={handleLogout}>
      <div id="pendingTasks" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Pending Tasks</h2>

        {isLoading && <p className="loading" style={{ textAlign: 'center' }}>Loading tasks...</p>}

        <div id="search-bar">
          <input
            type="text"
            placeholder="Search by Payment ID, User ID, Customer, or Amount..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '4px', fontSize: '14px', marginBottom: '20px' }}
          />
        </div>

        <div id="download-options">
          <h3 id="download-options-title">Official Report Generation</h3>
          <div id="download-buttons">
            <button id="download-all-btn" onClick={handleDownloadAll}>
              Download Directory ({tasks.length} tasks)
            </button>
            <p id="download-note">
              Reports include official letterhead with {companyInfo.name} branding and contact details.
            </p>
          </div>
        </div>

        <div className="pending-tasks-list" style={{ marginBottom: '40px' }}>
          <h3 style={{ marginBottom: '10px' }}>My Pending Tasks</h3>
          <div id="table-header">
            <span id="table-task-count">Total Tasks: {tasks.length}</span>
            <span id="filtered-count">
              {searchTerm && `(Showing ${filteredTasks.length} filtered results)`}
            </span>
          </div>
          {filteredTasks.length === 0 && !isLoading ? (
            <p style={{ textAlign: 'center', color: '#666' }}>
              No pending tasks found matching your search criteria.
            </p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
              <thead>
                <tr style={{ backgroundColor: '#28a745', color: 'white' }}>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>User ID</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Customer</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Amount</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Payment Date</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Status of My</th>
                  <th style={{ padding: '10px', border: '1px solid #ddd' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr
                    key={task.paymentId}
                    style={{
                      backgroundColor: 'white',
                      border: '1px solid #ddd',
                    }}
                  >
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.paymentId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.userId || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.customer || 'Unknown'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      Rs. {task.amount?.toLocaleString() || '0'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      {task.paymentDate ? new Date(task.paymentDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>{task.status || 'N/A'}</td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <select
                        value={statusUpdates[task.paymentId] || task.statusofmy || 'pending'}
                        onChange={(e) => handleStatusChange(task.paymentId, e.target.value)}
                        style={{
                          padding: '5px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                          fontSize: '14px',
                        }}
                      >
                        <option value="pending">Pending</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                    <td style={{ padding: '10px', border: '1px solid #ddd' }}>
                      <button
                        onClick={() => handleUpdateStatus(task.paymentId)}
                        disabled={isLoading || statusUpdates[task.paymentId] === task.statusofmy}
                        style={{
                          padding: '5px 10px',
                          backgroundColor: isLoading || statusUpdates[task.paymentId] === task.statusofmy ? '#6c757d' : '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: isLoading || statusUpdates[task.paymentId] === task.statusofmy ? 'not-allowed' : 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s',
                          marginRight: '5px',
                        }}
                        onMouseOver={(e) =>
                          !(isLoading || statusUpdates[task.paymentId] === task.statusofmy) &&
                          (e.target.style.backgroundColor = '#218838')
                        }
                        onMouseOut={(e) =>
                          !(isLoading || statusUpdates[task.paymentId] === task.statusofmy) &&
                          (e.target.style.backgroundColor = '#28a745')
                        }
                      >
                        Update
                      </button>
                      <button
                        className="action-btn download-btn"
                        onClick={() => handleDownloadSingle(task)}
                        title="Download Task Report"
                      >
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {filteredTasks.length === 0 && searchTerm && (
            <div id="no-tasks-message">
              <button id="clear-search-btn" onClick={() => setSearchTerm('')}>
                Clear Search
              </button>
            </div>
          )}
        </div>
      </div>
    </TechnicianLayout>
  );
}

export default PendingTasks;