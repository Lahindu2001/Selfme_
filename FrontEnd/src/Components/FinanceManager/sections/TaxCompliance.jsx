import React, { useState, useEffect } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ import correctly

const TaxCompliance = () => {
  const [taxData, setTaxData] = useState([]);
  const [totalTax, setTotalTax] = useState(0);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");

  const currentYear = new Date().getFullYear();
  const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, "0");

  useEffect(() => {
    fetchTaxData();
  }, [year, month]);

  const fetchTaxData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/finance/tax-compliance", {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, month }
      });
      setTaxData(res.data.taxData || []);
      setTotalTax(res.data.totalTax || 0);
    } catch (err) {
      console.error("❌ Tax data fetch error:", err.message);
    }
  };

  const downloadReport = () => {
    if (taxData.length === 0) {
      alert("No data available to download.");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Tax Compliance Report", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text(`Year: ${year}${month ? " | Month: " + month : ""}`, 20, 30);

    const tableData = taxData.map(t => [
      t.payment_id,
      t.customer,
      `Rs. ${t.totalAmount.toLocaleString()}`,
      `Rs. ${t.taxAmount.toLocaleString()}`,
      new Date(t.payment_date).toLocaleDateString()
    ]);

    autoTable(doc, {
      head: [["Payment ID", "Customer", "Total Amount", "Tax Amount", "Date"]],
      body: tableData,
      startY: 40
    });

    doc.text(
      `Total Tax Collected: Rs. ${totalTax.toLocaleString()}`,
      20,
      doc.lastAutoTable.finalY + 10
    );

    doc.save(`Tax_Report_${year}${month ? "_" + month : ""}.pdf`);
  };

  return (
    <div className="tax-compliance-container">
      <h2>Tax Compliance</h2>

      {/* Filters */}
      <div style={{ marginBottom: "15px" }}>
        <label>Year: </label>
        <input
          type="number"
          value={year}
          max={currentYear} // ✅ Prevent future year
          onChange={(e) => setYear(e.target.value)}
          style={{ marginRight: "10px" }}
        />

        <label>Month: </label>
        <select value={month} onChange={(e) => setMonth(e.target.value)}>
          <option value="">All</option>
          {[
            "01","02","03","04","05","06",
            "07","08","09","10","11","12"
          ].map((m, index) => (
            <option
              key={m}
              value={m}
              disabled={parseInt(year) === currentYear && parseInt(m) > parseInt(currentMonth)} // ✅ disable future months
            >
              {new Date(0, index).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", border: "1px solid #ddd" }}>
        <thead>
          <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Payment ID</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Customer</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Total Amount</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Tax Amount</th>
            <th style={{ padding: "10px", border: "1px solid #ddd" }}>Date</th>
          </tr>
        </thead>
        <tbody>
          {taxData.map((row, i) => (
            <tr key={i}>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.payment_id}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>{row.customer}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>Rs. {row.totalAmount.toLocaleString()}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>Rs. {row.taxAmount.toLocaleString()}</td>
              <td style={{ padding: "10px", border: "1px solid #ddd" }}>
                {new Date(row.payment_date).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {taxData.length === 0 && (
            <tr>
              <td colSpan="5" style={{ textAlign: "center", padding: "10px" }}>No records found</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Total tax */}
      <h3 style={{ marginTop: "15px" }}>Total Tax Collected: Rs. {totalTax.toLocaleString()}</h3>

      <button
        onClick={downloadReport}
        style={{
          marginTop: "10px",
          padding: "10px 20px",
          backgroundColor: "#28a745",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}
      >
        Download Report
      </button>
    </div>
  );
};

export default TaxCompliance;
