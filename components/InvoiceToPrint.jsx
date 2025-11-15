
import React, { forwardRef } from "react";

const InvoiceToPrint = forwardRef((props, ref) => {
  const { orderData } = props;
  const { headerData, customerData, itemLines, totals } = orderData;

  return (
    <div ref={ref} style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1 style={{ textAlign: "center" }}>Sales Invoice</h1>

      {/* Header Section */}
      <div style={{ marginTop: "20px" }}>
        <p><strong>Invoice No:</strong> {headerData.invoiceNo}</p>
        <p><strong>Date:</strong> {headerData.invoiceDate}</p>
        <p><strong>Reference:</strong> {headerData.referenceNo}</p>
      </div>

      {/* Customer Details */}
      <div style={{ marginTop: "20px" }}>
        <h3>Customer Details</h3>
        <p><strong>Name:</strong> {customerData.customerName}</p>
        <p><strong>Address 1:</strong> {customerData.address1}</p>
        <p><strong>Address 2:</strong> {customerData.address2}</p>
        <p><strong>State:</strong> {customerData.state}</p>
        <p><strong>Post Code:</strong> {customerData.postCode}</p>
      </div>

      {/* Items Table */}
      <table
        style={{
          width: "100%",
          marginTop: "20px",
          borderCollapse: "collapse",
        }}
      >
        <thead>
          <tr>
            <th style={th}>Item Code</th>
            <th style={th}>Description</th>
            <th style={th}>Qty</th>
            <th style={th}>Price</th>
            <th style={th}>Tax %</th>
            <th style={th}>Excl</th>
            <th style={th}>Incl</th>
          </tr>
        </thead>
        <tbody>
          {itemLines.map((line, i) => (
            <tr key={i}>
              <td style={td}>{line.itemCode}</td>
              <td style={td}>{line.description}</td>
              <td style={td}>{line.quantity}</td>
              <td style={td}>{line.price.toFixed(2)}</td>
              <td style={td}>{line.tax.toFixed(2)}</td>
              <td style={td}>{line.exclAmount.toFixed(2)}</td>
              <td style={td}>{line.inclAmount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ marginTop: "30px", textAlign: "right" }}>
        <p><strong>Total Excl:</strong> {totals.totalExcl.toFixed(2)}</p>
        <p><strong>Total Tax:</strong> {totals.totalTax.toFixed(2)}</p>
        <p><strong>Total Incl:</strong> {totals.totalIncl.toFixed(2)}</p>
      </div>
    </div>
  );
});

const th = {
  border: "1px solid black",
  padding: "8px",
  background: "#f0f0f0",
};

const td = {
  border: "1px solid black",
  padding: "8px",
};

export default InvoiceToPrint;
