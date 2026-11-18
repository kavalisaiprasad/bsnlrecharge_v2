import React from "react";
import { HelmetProvider } from "react-helmet-async";
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Route, Routes } from "react-router-dom";
import Menu from "./components/Menu/Menu";
import Recharge from "./components/Recharge/Recharge";



import PaymentSuccess from "./components/PaymentSuccess/PaymentSuccess";
function App() {
 


  return (
    <HelmetProvider>
      <Menu   />
      <Routes>
        <Route path="/" exact element={<Recharge  />} />

      
        <Route path="/PaymentSuccess" exact element={<PaymentSuccess />} />
      </Routes>


    </HelmetProvider>
  );
}

export default App;
