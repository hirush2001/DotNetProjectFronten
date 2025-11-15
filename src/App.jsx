import SalesOrderPage from './SalesOrderPage'
import HomePage from './HomePage';
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import InvoiceToPrint from '../components/InvoiceToPrint';

function App() {
  

  return ( 
<BrowserRouter>


      <Routes>
      
        
        <Route path="/" element={<HomePage />} />
        <Route path="/salesorder" element={<SalesOrderPage />} />
        <Route path="/salesorder/:id" element={<SalesOrderPage />} />
        <Route path="/invoice" element={<InvoiceToPrint />} />
        

        
      </Routes>
    </BrowserRouter>
  )
}

export default App
