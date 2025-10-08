// Frontend/Payment.jsx (updated to remove local invoiceId append since backend handles it, and show payment_id in success)
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import Navbar from "../Nav/Navbar";
import Footer from "../Footer/Footer";

function Payment() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slipFile, setSlipFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  // Mock companyInfo (replace with actual definition)
  const companyInfo = {
    name: "Your Company",
    address: ["123 Main St", "City, Country"],
    phone: "123-456-7890",
    email: "contact@company.com",
    website: "www.company.com",
  };

  useEffect(() => {
    console.log("💳 Payment component mounted");
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      console.log("🔄 Fetching cart...");
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token found");
        setError("Please login to proceed with payment");
        setLoading(false);
        return;
      }
      const res = await axios.get("http://localhost:5000/api/cart", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      console.log("✅ Cart fetch response:", {
        status: res.status,
        dataLength: res.data.length,
        sampleData: res.data[0] || "No items",
      });
      const items = Array.isArray(res.data) ? res.data : [];
      setCartItems(items);
    } catch (err) {
      console.error("💥 Cart fetch error:", err);
      let errorMessage = "Failed to load cart items.";
      if (err.response) {
        errorMessage = err.response.data?.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server.";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
      console.log("🏁 Cart fetch complete");
    }
  };

  const totalAmount = cartItems.reduce((sum, item) => sum + (Number(item.subtotal) || 0), 0);
  const taxAmount = Math.round(totalAmount * 0.085);
  const grandTotal = totalAmount + taxAmount;

  const handleFileChange = (e) => {
    console.log("📁 File selected:", e.target.files[0]?.name);
    setSlipFile(e.target.files[0]);
  };

  const handleSubmitPayment = async () => {
    if (!slipFile) {
      console.log("❌ No slip uploaded");
      setError("Please upload bank transfer slip");
      return;
    }
    if (!cartItems.length) {
      console.log("❌ Empty cart");
      setError("Cart is empty. Add items before making a payment.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("❌ No token for payment submission");
        setError("Session expired. Please login again.");
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 1500);
        return;
      }
      const formData = new FormData();
      formData.append("amount", grandTotal);
      formData.append("payment_method", "Bank Transfer");
      formData.append("payment_date", new Date().toISOString());
      formData.append("status", "Pending");
      formData.append("slip", slipFile);
      console.log("📤 Submitting payment...");
      const response = await axios.post("http://localhost:5000/api/payments", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 10000,
      });
      console.log("✅ Payment submitted:", response.data);
      alert(`Payment submitted successfully! Your Payment ID is: ${response.data.payment.payment_id}. Waiting for admin review.`);
      navigate("/?view=dashboard");
    } catch (err) {
      console.error("💥 Payment submission error:", err);
      let errorMessage = "Failed to submit payment.";
      if (err.response) {
        errorMessage = err.response.data.message || `Server error (${err.response.status})`;
      } else if (err.request) {
        errorMessage = "Cannot connect to server.";
      }
      setError(errorMessage);
    } finally {
      setSubmitting(false);
      console.log("🏁 Payment submission complete");
    }
  };

  // ------------------- LOGO CONVERSION -------------------
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

  // ------------------- OFFICIAL PDF GENERATION -------------------
  const generatePDF = async (data, title) => {
    if (!data.length) return alert('No items to download!');
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

      const addFooter = (pageNum, totalPages) => {
        doc.setFont('times', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(50, 50, 50);
        doc.setLineWidth(0.3);
        doc.setDrawColor(150, 150, 150);
        doc.line(15, pageHeight - 20, pageWidth - 15, pageHeight - 20);
        const footerText = `Generated by ${companyInfo.name} Invoice System`;
        doc.text(footerText, pageWidth / 2, pageHeight - 15, { align: 'center' });
        doc.text(`Page ${pageNum} of ${totalPages}`, pageWidth - 15, pageHeight - 10, { align: 'right' });
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

      let totalPages = 1;
      let tempY = 60;
      let lastRecordIdxPerPage = [];
      let currentPageRecords = [];
      data.forEach((_, idx) => {
        const itemHeight = 10; // Each item takes 10px
        if (tempY + itemHeight > pageHeight - 40) {
          totalPages++;
          lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);
          currentPageRecords = [];
          tempY = 60;
        }
        currentPageRecords.push(idx);
        tempY += itemHeight;
      });
      lastRecordIdxPerPage.push(currentPageRecords[currentPageRecords.length - 1] || -1);

      let currentPage = 1;
      let y = 60;
      addLetterhead();
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(0, 0, 0);
      doc.text(title, pageWidth / 2, 45, { align: 'center' });
      doc.setFontSize(12);
      doc.text(`Invoice ID: ${Date.now()}`, 15, 50); // Use timestamp as placeholder since backend generates
      doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 15, 55);

      data.forEach((item, index) => {
        if (y + 10 > pageHeight - 40) {
          addSignatureField();
          addFooter(currentPage, totalPages);
          doc.addPage();
          currentPage++;
          addLetterhead();
          y = 60;
        }
        doc.setFont('times', 'normal');
        doc.setFontSize(10);
        doc.text(
          `${index + 1}. ${item.itemId?.item_name || "Product"} - Qty: ${item.quantity || 1} - Rs. ${item.subtotal?.toLocaleString() || 0}`,
          15,
          y
        );
        y += 10;
      });

      y += 10;
      doc.setFont('times', 'bold');
      doc.text(`Subtotal: Rs. ${totalAmount.toLocaleString()}`, 15, y);
      y += 10;
      doc.text(`Tax (8.5%): Rs. ${taxAmount.toLocaleString()}`, 15, y);
      y += 10;
      doc.text(`Grand Total: Rs. ${grandTotal.toLocaleString()}`, 15, y);

      addSignatureField();
      addFooter(currentPage, totalPages);

      const timestamp = new Date().toISOString().split('T')[0];
      const fileName = `${companyInfo.name}_${title.replace(/\s+/g, '_')}_${timestamp}.pdf`;
      doc.save(fileName);
      console.log("✅ Invoice PDF generated");
      alert(`Invoice "${fileName}" downloaded successfully!`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  // ------------------- DOWNLOAD FUNCTION -------------------
  const handleDownloadInvoice = () => generatePDF(cartItems, 'Invoice');

  console.log("📊 Rendering Payment - cartItems:", cartItems.length, "loading:", loading, "error:", error);
  return (
    <div>
      <Navbar />
      <div style={{ minHeight: "100vh", backgroundColor: "#f5f5f5", padding: "20px 0", marginTop: "60px" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto", backgroundColor: "white", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", padding: "20px" }}>
          <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>💳 Payment</h1>
          {loading && <div style={{ textAlign: "center" }}>Loading cart...</div>}
          {error && <div style={{ color: "red", textAlign: "center", marginBottom: "20px" }}>{error}</div>}
          {!loading && (
            <>
              <h2 style={{ marginBottom: "20px", color: "#333" }}>Cart Summary</h2>
              {cartItems.length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#007BFF", color: "white" }}>
                      <th style={{ padding: "15px", textAlign: "left" }}>Item</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Quantity</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Unit Price</th>
                      <th style={{ padding: "15px", textAlign: "center" }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={item._id || `item-${index}`} style={{ backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white" }}>
                        <td style={{ padding: "15px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            {item.itemId?.item_image ? (
                              <img
                                src={`http://localhost:5000${item.itemId.item_image}`}
                                alt={item.itemId?.item_name || "Product"}
                                style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "4px" }}
                                onError={(e) => {
                                  e.target.src = "https://via.placeholder.com/50x50/007BFF/FFFFFF?text=?";
                                  console.log("🖼️ Image load error for item:", item.itemId?.item_name);
                                }}
                              />
                            ) : (
                              <div style={{ width: "50px", height: "50px", backgroundColor: "#e9ecef", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                No Image
                              </div>
                            )}
                            <span>{item.itemId?.item_name || "Product"}</span>
                          </div>
                        </td>
                        <td style={{ padding: "15px", textAlign: "center" }}>{item.quantity || 1}</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>Rs. {(item.unit_price || 0).toLocaleString()}</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>Rs. {(item.subtotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p style={{ textAlign: "center", color: "#6c757d" }}>Your cart is empty.</p>
              )}
              <div style={{ textAlign: "right", marginBottom: "20px" }}>
                <p>Subtotal: Rs. {totalAmount.toLocaleString()}</p>
                <p>Tax (8.5%): Rs. {taxAmount.toLocaleString()}</p>
                <strong>Grand Total: Rs. {grandTotal.toLocaleString()}</strong>
              </div>
              <h2 style={{ marginBottom: "20px", color: "#333" }}>Submit Payment</h2>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "10px" }}>Payment Method: Bank Transfer</label>
                <label style={{ display: "block", marginBottom: "10px" }}>Upload Bank Transfer Slip:</label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  accept="application/pdf,image/jpeg,image/png"
                  style={{ marginLeft: "10px" }}
                />
              </div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                <button
                  onClick={handleSubmitPayment}
                  disabled={submitting || !cartItems.length}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: (submitting || !cartItems.length) ? "#6c757d" : "#28a745",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: (submitting || !cartItems.length) ? "not-allowed" : "pointer",
                    fontSize: "16px",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Payment"}
                </button>
                <button
                  onClick={handleDownloadInvoice}
                  disabled={!cartItems.length}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: !cartItems.length ? "#6c757d" : "#007BFF",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: !cartItems.length ? "not-allowed" : "pointer",
                    fontSize: "16px",
                  }}
                >
                  Download Invoice
                </button>
                <button
                  onClick={() => navigate("/?view=cart")}
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#6c757d",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                    fontSize: "16px",
                  }}
                >
                  ← Back to Cart
                </button>
              </div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Payment;