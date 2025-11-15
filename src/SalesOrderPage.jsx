import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';
import { FaCheck, FaPlus, FaPrint } from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';
import InvoiceToPrint from '../components/InvoiceToPrint';

const API_BASE_URL = 'http://localhost:5011/api';

const blankRow = {
  itemCode: '',
  description: '',
  note: '',
  quantity: 1,
  price: 0,
  tax: 0,
  exclAmount: 0,
  taxAmount: 0,
  inclAmount: 0,
};

const SalesOrderPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [clients, setClients] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [headerData, setHeaderData] = useState({
    invoiceNo: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
  });

  const [customerData, setCustomerData] = useState({
    customerId: '',
    customerName: '',
    address1: '',
    address2: '',
    state: '',
    postCode: '',
  });

  const [itemLines, setItemLines] = useState([blankRow]);

  const [totals, setTotals] = useState({
    totalExcl: 0,
    totalTax: 0,
    totalIncl: 0,
  });

  const componentToPrintRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    documentTitle: headerData.invoiceNo || "invoice",
    onAfterPrint: () => toast.success("Invoice printed successfully!")
  });
  

  const orderDataForPrint = {
    headerData,
    customerData,
    itemLines,
    totals,
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [clientsRes, itemsRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/clients`),
          axios.get(`${API_BASE_URL}/items`),
        ]);
        setClients(clientsRes.data);
        setItems(itemsRes.data);

        if (id) {
          toast.loading('Loading existing order...');
          const orderRes = await axios.get(`${API_BASE_URL}/salesorder/${id}`);
          const order = orderRes.data;

          setHeaderData({
            invoiceNo: order.invoiceNo,
            invoiceDate: new Date(order.invoiceDate).toISOString().split('T')[0],
            referenceNo: order.referenceNo,
          });
          
          setCustomerData({
            customerId: '',
            customerName: order.customerName,
            address1: order.address1,
            address2: order.address2,
            state: order.state,
            postCode: order.postCode,
          });

          const loadedItems = order.orderItems.map(item => ({
            ...item,
            exclAmount: item.exclAmount,
            taxAmount: item.taxAmount,
            inclAmount: item.inclAmount,
          }));
          setItemLines(loadedItems);
          
          toast.dismiss();
          toast.success('Order loaded!');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    let totalEx = 0, totalTax = 0, totalInc = 0;
    itemLines.forEach(line => {
      totalEx += line.exclAmount;
      totalTax += line.taxAmount;
      totalInc += line.inclAmount;
    });
    setTotals({ totalExcl: totalEx, totalTax: totalTax, totalIncl: totalInc });
  }, [itemLines]);


  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeaderData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerChange = (e) => {
    const selectedClientId = e.target.value;
    const selectedClient = clients.find(c => c.id.toString() === selectedClientId);

    if (selectedClient) {
      setCustomerData({
        customerId: selectedClient.id,
        customerName: selectedClient.customerName,
        address1: selectedClient.address1 || '',
        address2: selectedClient.address2 || '',
        state: selectedClient.state || '',
        postCode: selectedClient.postCode || '',
      });
    } else {
      setCustomerData({
        customerId: '', customerName: '', address1: '', address2: '', state: '', postCode: '',
      });
    }
  };

  const handleItemLineChange = (index, e) => {
    const { name, value } = e.target;
    const newLines = [...itemLines];
    let line = { ...newLines[index], [name]: value };

    const selectedItem = items.find(i => i.itemCode === line.itemCode || i.description === line.description);
    if ((name === "itemCode" || name === "description") && selectedItem) {
      line.itemCode = selectedItem.itemCode;
      line.description = selectedItem.description;
      line.price = selectedItem.price;
    }

    const qty = parseFloat(line.quantity) || 0;
    const price = parseFloat(line.price) || 0;
    const taxRate = parseFloat(line.tax) || 0;

    line.exclAmount = qty * price;
    line.taxAmount = (line.exclAmount * taxRate) / 100;
    line.inclAmount = line.exclAmount + line.taxAmount;

    newLines[index] = line;
    setItemLines(newLines);
  };

  const handleAddItemLine = () => {
    setItemLines([...itemLines, blankRow]);
  };

  const handleSaveOrder = async () => {
    const finalOrder = {
      ...headerData,
      ...customerData,
      orderItems: itemLines.map(line => ({
        itemCode: line.itemCode,
        description: line.description,
        note: line.note,
        quantity: parseInt(line.quantity) || 0,
        price: parseFloat(line.price) || 0,
        tax: parseFloat(line.tax) || 0,
      })),
    };
    delete finalOrder.customerId;

    try {
      if (id) {
        await axios.put(`${API_BASE_URL}/salesorder/${id}`, {
          ...finalOrder,
          id: id // ensure the Id is included in the payload
        });
        toast.success("Order Updated Successfully!");
        navigate('/');
      } else {
        await axios.post(`${API_BASE_URL}/salesorder`, finalOrder);
        toast.success('Order Saved Successfully!');
        navigate('/');
      }
      
    } catch (error) {
      console.error("Error saving order:", error);
      toast.error("Failed to save order.");
    }
    
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading data...</p>;
  }

  return ( 
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <Toaster position="top-right" />
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">
          {id ? `Edit Sales Order (ID: ${id})` : 'New Sales Order'}
        </h1>
        <div className="flex gap-2">
          {id && (
            <button 
              onClick={handlePrint}
              className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150"
            >
              <FaPrint className="mr-2" />
              Print
            </button>
          )}
          <button 
            onClick={handleSaveOrder}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition duration-150"
          >
            <FaCheck className="mr-2" />
            {id ? 'Update Order' : 'Save Order'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Customer Name</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-lg bg-white"
              onChange={handleCustomerChange}
              value={customerData.customerId}
            >
              <option value="">Select a customer...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.customerName}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Address 1</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly value={customerData.address1} />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Address 2</label>
            <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly value={customerData.address2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">State</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly value={customerData.state} />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Post Code</label>
              <input type="text" className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly value={customerData.postCode} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Invoice No.</label>
            <input type="text" name="invoiceNo" className="w-full p-3 border border-gray-300 rounded-lg" 
              value={headerData.invoiceNo}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Invoice Date</label>
            <input type="date" name="invoiceDate" className="w-full p-3 border border-gray-300 rounded-lg" 
              value={headerData.invoiceDate}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Reference no</label>
            <textarea name="referenceNo" className="w-full p-3 border border-gray-300 rounded-lg" rows="5"
              value={headerData.referenceNo}
              onChange={handleHeaderChange}
            ></textarea>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-100">
             <tr>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Item Code</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Description</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Note</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Qty</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tax (%)</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Excl Amount</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Tax Amount</th>
              <th className="p-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Incl Amount</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {itemLines.map((line, index) => (
              <tr key={index}>
                <td className="p-2 w-48">
                  <select name="itemCode" value={line.itemCode} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg">
                    <option value="">Select code...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.itemCode}>{item.itemCode}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 w-48">
                  <select name="description" value={line.description} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg">
                    <option value="">Select description...</option>
                    {items.map(item => (
                      <option key={item.id} value={item.description}>{item.description}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 w-48">
                  <input type="text" name="note" value={line.note} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg" />
                </td>
                <td className="p-2 w-20">
                  <input type="number" name="quantity" value={line.quantity} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg" />
                </td>
                <td className="p-2 w-24">
                  <input type="number" name="price" value={line.price} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg" />
                </td>
                <td className="p-2 w-20">
                  <input type="number" name="tax" value={line.tax} onChange={(e) => handleItemLineChange(index, e)} className="w-full p-2 border-gray-300 rounded-lg" />
                </td>
                <td className="p-2 w-32">
                  <input type="text" value={line.exclAmount.toFixed(2)} readOnly className="w-full p-2 border-gray-300 rounded-lg bg-gray-100" />
                </td>
                <td className="p-2 w-32">
                  <input type="text" value={line.taxAmount.toFixed(2)} readOnly className="w-full p-2 border-gray-300 rounded-lg bg-gray-100" />
                </td>
                <td className="p-2 w-32">
                  <input type="text" value={line.inclAmount.toFixed(2)} readOnly className="w-full p-2 border-gray-300 rounded-lg bg-gray-100" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button 
          onClick={handleAddItemLine}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg flex items-center transition duration-150"
        >
          <FaPlus className="mr-2" />
          Add Item
        </button>
      </div>

      <div className="flex justify-end mt-6">
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-md">
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 font-bold">Total Excl</span>
            <input type="text" value={totals.totalExcl.toFixed(2)} readOnly className="w-1/2 p-2 text-right border border-gray-300 rounded-lg bg-gray-100" />
          </div>
          <div className="flex justify-between items-center mb-3">
            <span className="text-gray-700 font-bold">Total Tax</span>
            <input type="text" value={totals.totalTax.toFixed(2)} readOnly className="w-1/2 p-2 text-right border border-gray-300 rounded-lg bg-gray-100" />
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-700 font-bold text-lg">Total Incl</span>
            <input type="text" value={totals.totalIncl.toFixed(2)} readOnly className="w-1/2 p-2 text-right border border-gray-300 rounded-lg bg-gray-100 font-bold text-lg" />
          </div>
        </div>
      </div>

      <div className="absolute -left-[9999px] top-0">
  <InvoiceToPrint ref={componentToPrintRef} orderData={orderDataForPrint} />
</div>




    </div>
  );
};

export default SalesOrderPage;