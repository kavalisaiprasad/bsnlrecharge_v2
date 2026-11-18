import React from "react";
import { Container } from "react-bootstrap";
import "./PaymentSuccess.css";

const PaymentSuccess = () => {
  return (
    <Container className="d-flex justify-content-center align-items-center vh-100 ">
      <div className="ticket-card">

        <div className="ticket-header">
          <div className="check-circle">
            <i className="fas fa-check text-white"></i>
          </div>
          <h4 className="text-center text-white mt-2">Payment Success</h4>
        </div>

        <div className="ticket-body">
          <div className="ticket-row">
            <span className="label">Reference Number</span>
            <span className="value">000085752257</span>
          </div>

          <div className="ticket-row">
            <span className="label">Date & Time</span>
            <span className="value">22 Mar 2024, 07:43 AM</span>
          </div>

          <div className="ticket-row">
            <span className="label">Payment Method</span>
            <span className="value fw-bold">Credit Card</span>
          </div>

          <hr className="divider" />

          <div className="ticket-row">
            <span className="label">Subtotal</span>
            <span className="value">$480.00</span>
          </div>

          <div className="ticket-row">
            <span className="label">Discount</span>
            <span className="value">₹ 10.00</span>
          </div>

          <div className="ticket-row total">
            <span className="label">Total</span>
            <span className="value">₹ 470.00</span>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default PaymentSuccess;
