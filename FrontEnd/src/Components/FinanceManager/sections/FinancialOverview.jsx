import React, { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FiRefreshCw } from "react-icons/fi";

const FinancialOverview = () => {
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  const today = new Date();

  // Fetch incomes (all Paid payments)
  useEffect(() => {
    const fetchIncomes = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/finance/payments");
        const paidPayments = res.data.filter((p) => p.status === "Paid");
        setIncomes(paidPayments);
        setFilteredIncomes(paidPayments);
        setTotalIncome(paidPayments.reduce((acc, p) => acc + p.amount, 0));
      } catch (err) {
        console.error("Error fetching incomes:", err.message);
      }
    };
    fetchIncomes();
  }, []);

  // Reset filter
  const resetFilter = () => {
    setFilteredIncomes(incomes);
    setTotalIncome(incomes.reduce((acc, p) => acc + p.amount, 0));
    setFromDate("");
    setToDate("");
    setSelectedMonth("");
    setSelectedYear("");
  };

  // Date range filter with validation
  const handleFilterByDate = () => {
    if (!fromDate || !toDate) {
      alert("Please select both from and to dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      alert("From date cannot be later than To date.");
      return;
    }
    if (new Date(toDate) > today) {
      alert("To date cannot be in the future.");
      return;
    }

    const filtered = incomes.filter((p) => {
      const d = new Date(p.payment_date);
      return d >= new Date(fromDate) && d <= new Date(toDate);
    });

    if (filtered.length === 0) {
      alert("No records found for the selected date range.");
    }

    setFilteredIncomes(filtered);
    setTotalIncome(filtered.reduce((acc, p) => acc + p.amount, 0));
  };

  // Generic report generator
  const downloadReport = (type, data) => {
    if (!data || data.length === 0) {
      alert("No income records available to download.");
      return;
    }

    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text(`Income Report - ${type}`, 14, 15);

    const tableData = data.map((inc) => [
      inc.payment_id,
      new Date(inc.payment_date).toLocaleDateString(),
      `Rs. ${inc.amount.toLocaleString()}`,
    ]);

    autoTable(doc, {
      head: [["Payment ID", "Date", "Amount"]],
      body: tableData,
      startY: 25,
    });

    const total = data.reduce((acc, p) => acc + p.amount, 0);
    doc.setFontSize(12);
    doc.text(
      `Total Income: Rs. ${total.toLocaleString()}`,
      14,
      doc.lastAutoTable.finalY + 10
    );

    doc.save(`Income_Report_${type}.pdf`);
  };

  // Monthly report with validation
  const downloadMonthlyReport = () => {
    if (!selectedMonth) {
      alert("Please select a month.");
      return;
    }

    const [year, month] = selectedMonth.split("-");
    const selected = new Date(parseInt(year), parseInt(month) - 1);

    const currentMonth = new Date(today.getFullYear(), today.getMonth());
    const prevMonth = new Date(today.getFullYear(), today.getMonth() - 1);
    if (
      selected.getTime() !== currentMonth.getTime() &&
      selected.getTime() !== prevMonth.getTime()
    ) {
      alert("You can only select the current month or the previous month.");
      return;
    }

    const monthlyData = incomes.filter((p) => {
      const d = new Date(p.payment_date);
      return d.getMonth() + 1 === parseInt(month) && d.getFullYear() === parseInt(year);
    });

    if (monthlyData.length === 0) {
      alert("No records found for the selected month.");
      return;
    }

    downloadReport(`Monthly_${selectedMonth}`, monthlyData);
  };

  // Yearly report with validation
  const downloadYearlyReport = () => {
    if (!selectedYear) {
      alert("Please select a year.");
      return;
    }

    const yearlyData = incomes.filter((p) => {
      const d = new Date(p.payment_date);
      return d.getFullYear() === parseInt(selectedYear);
    });

    if (yearlyData.length === 0) {
      alert("No records found for the selected year.");
      return;
    }

    downloadReport(`Yearly_${selectedYear}`, yearlyData);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#007BFF" }}>Income</h2>

      {/* Date Range Filter */}
      <div style={{ marginBottom: "15px" }}>
        <label>From: </label>
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          max={today.toISOString().split("T")[0]} // ✅ prevent future dates
        />
        <label style={{ marginLeft: "10px" }}>To: </label>
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          min={fromDate || ""} // ✅ cannot pick before fromDate
          max={today.toISOString().split("T")[0]} // ✅ prevent future dates
        />
        <button
          onClick={handleFilterByDate}
          style={{
            marginLeft: "10px",
            padding: "5px 10px",
            background: "#007BFF",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Filter
        </button>

        <button
          onClick={resetFilter}
          style={{
            marginLeft: "10px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
          title="Reset Filters"
        >
          <FiRefreshCw size={20} color="#007BFF" />
        </button>
      </div>

      {/* Income Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          border: "1px solid #ddd",
          marginBottom: "20px",
        }}
      >
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Payment ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredIncomes.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "10px" }}>
                No income records found
              </td>
            </tr>
          ) : (
            filteredIncomes.map((inc) => (
              <tr key={inc.payment_id}>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {inc.payment_id}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  {new Date(inc.payment_date).toLocaleDateString()}
                </td>
                <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                  Rs. {inc.amount.toLocaleString()}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Total Income */}
      <h3>Total Income: Rs. {totalIncome.toLocaleString()}</h3>

      {/* Download Buttons */}
      <div style={{ marginTop: "20px" }}>
        {/* Monthly Report */}
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        >
          <option value="">Select Month</option>
          {[
            new Date(today.getFullYear(), today.getMonth()), // current month
            new Date(today.getFullYear(), today.getMonth() - 1), // previous month
          ].map((date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            return (
              <option key={`${year}-${month}`} value={`${year}-${month}`}>
                {date.toLocaleString("default", { month: "long" })} {year}
              </option>
            );
          })}
        </select>
        <button onClick={downloadMonthlyReport} style={{ marginRight: "20px" }}>
          Download Monthly Report
        </button>

        {/* Yearly Report */}
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          style={{ marginRight: "10px", padding: "5px" }}
        >
          <option value="">Select Year</option>
          {Array.from(
            new Set(incomes.map((p) => new Date(p.payment_date).getFullYear()))
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
        <button onClick={downloadYearlyReport}>Download Yearly Report</button>
      </div>
    </div>
  );
};

export default FinancialOverview;
