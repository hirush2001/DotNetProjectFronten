import SalesOrderPage from './SalesOrderPage'
import HomePage from './HomePage';
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  

  return ( 
<BrowserRouter>


      <Routes>
      
        
        <Route path="/" element={<HomePage />} />
        <Route path="/salesorder" element={<SalesOrderPage />} />
        <Route path="/salesorder/:id" element={<SalesOrderPage />} />

        
      </Routes>
    </BrowserRouter>
  )
}

export default App
