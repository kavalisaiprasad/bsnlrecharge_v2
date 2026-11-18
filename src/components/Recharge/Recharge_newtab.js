import React, { useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import "./Recharge.css";
const Recharge = () => {
  const [mobile, setMobile] = useState("");
  const [operatorCode, setOperatorCode] = useState("");
  const [circleCode, setCircleCode] = useState("");
  const [price, setPrice] = useState("");
  const [plan, setPlan] = useState("");
  const [des, setDes] = useState("");
  const [modalShow, setModalShow] = useState(false);
  const [plans, setPlans] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [activePlan, setActivePlan] = useState(null);
  const [Expiry_date, setExpiryDate] = useState(null);
  const [isBSNL, setIsBSNL] = useState(false);
  const [topPlans, setTopPlans] = useState([]);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [recommendedPlans, setRecommendedPlans] = useState([]);
  const [zoneCode, setZoneCode] = useState("");
  const [circle_code, setCircle_code] = useState("");
  const [validation_api_url, setValidationApiUrl] = useState("");
  const [pgUrl, setPgUrl] = useState("");
  const [planSelected, setPlanSelected] = useState(false);
  const [amount, setAmount] = useState("");
  const [captchaError, setCaptchaError] = useState("");

  // const [discountedPrice, setDiscountedPrice] = useState(null);
  const [errors, setErrors] = useState({
    captcha: "",
    plan: "",
    amount: "",
  });
  const tabOrder = [
    "Voice",
    "Data",
    "Voice & Data",
    "Topup",
    "VAS pack",
    "International Roaming"
  ];



  useEffect(() => {
    if (!/^\d{10}$/.test(mobile)) {
      resetState();
      //  setErrorMessage(""); 
      return;
    }

    //  setErrorMessage("");

    const fetchOperatorDetails = async () => {
      try {
        const response = await fetch(
          `https://bsnlrechargeapi.pyrogroup.com/bsnl-api/fetch-operator?mobile=${mobile}`
        );
        const result = await response.json();

        if (result.status === "SUCCESS") {
          setOperatorCode(result.operatorCode);
          setCircleCode(result.circleCode || "");
          setActivePlan(result.active_plan || "");
          setCircle_code(result.circle_code || "");
          setZoneCode(result.zone_code || "");
          setValidationApiUrl(result.validation_api_url || "");

          const formattedExpiryDate = result.Expiry_date
            ? new Date(result.Expiry_date).toLocaleDateString("en-GB").replace(/\//g, "-")
            : "";

          setExpiryDate(formattedExpiryDate);


          if (result.operatorCode === "BSNL") {
            setIsBSNL(true);
            setTopPlans(result.topplans || []);
            setRecommendedPlans(result["recommended plans"] || []);
            setErrorMessage("");   // clear only on valid BSNL number
          } else {
            setIsBSNL(false);
            setTopPlans([]);
            setRecommendedPlans([]);
            setErrorMessage("Invalid mobile number. Please check and try again.");
          }
        } else if (result.status === "FAILED") {
          setErrorMessage(result.message || "Invalid mobile number. Please check and try again.");
          resetState();
        }
      } catch (error) {
        setErrorMessage("Something went wrong. Please try again.");
        resetState();
      }
    };

    fetchOperatorDetails();
    setCaptcha(generateCaptcha());
  }, [mobile]);
  /* Added 140925 pyro plan change 2% discount */
  const getFormattedValidity = (validity) => {
    const v = validity.trim().toLowerCase();
    if (!isNaN(v)) {
      if (parseInt(v) === 1) return "1 day";
      return `${v} days`;
    }
    return v.includes("month") ? validity : validity;
  };

  useEffect(() => {
    if (!mobile) {
      resetState();
    }
  }, [mobile]);

  const resetState = () => {
    setOperatorCode("");
    setCircleCode("");
    setPrice("");
    setPlan("");
    setDes("");
    setIsBSNL(false);
    setTopPlans([]);
    setPlans([]);
    setModalShow(false);
    setRecommendedPlans([]);
    setCircle_code("");
    setZoneCode("");
    setValidationApiUrl("");
    setUserInput("");
    setMessage("");
    setIsCaptchaValid(false);
    setErrors({ captcha: "", plan: "", amount: "" });
    setPlanSelected(false);
    setCaptchaError("");
    setAmount("");
    setActivePlan("");
    setExpiryDate("");
    setPgUrl("");
  };

  const fetchPlans = async (operator, circle) => {
    if (!operator || !circle) return;

    try {
      const response = await fetch(
        `https://bsnlrechargeapi.pyrogroup.com/api/recharge-plansnew?operatorCode=${operator}&circleCode=${circle}`
      );

      if (!response.ok) throw new Error("Network error");   // ⬅️ Add this
      const result = await response.json();

      if (result.mobilePlans && typeof result.mobilePlans === "object") {
        let formattedPlans = Object.entries(result.mobilePlans)
          .filter(([key, value]) => Array.isArray(value) && value.length > 0)
          .map(([key, plans]) => ({
            service: serviceNameMap[key.trim()] || key.trim(), // Normalize service name
            originalKey: key.trim(),
            plans,
          }));

        // Sort by internal tab order
        formattedPlans.sort((a, b) => {
          const indexA = tabOrder.indexOf(a.service);
          const indexB = tabOrder.indexOf(b.service);
          return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
        });


        setPlans(formattedPlans);
      } else {
        setPlans([]);
      }
    } catch (error) {
      setPlans([]);
    }
  };

  const serviceNameMap = {
    "Voice Packs": "Voice",
    "Data Packs": "Data",
    "Voice & Data Packs": "Voice & Data",
    "TOPUP": "Topup",
    "VAS Packs": "VAS pack",
    "International Roaming": "International Roaming"
  };


  const openModal = async () => {
    if (operatorCode && circleCode && isCaptchaValid) {
      await fetchPlans(operatorCode, circleCode);
    }
    setTimeout(() => setModalShow(true), 300);
  };

  const setPlanDetails = (productCode, denomination, description) => {
    setPlan(productCode);
    setPrice(denomination);
    setDes(description);
    setPlanSelected(true);
    setModalShow(false);
  };

  const handleOpenConfirmModal = () => {
    if (!mobile || !price) {
      setErrorMessage("Please enter mobile number and select a plan.");
      return;
    }
    setShowConfirmModal(true);
  };

  const generateCaptcha = () => {
    const chars = "ABCDEFGHJKMNOPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz0123456789";
    let captcha = "";
    for (let i = 0; i < 6; i++) {
      captcha += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return captcha;
  };
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [userInput, setUserInput] = useState("");
  const [message, setMessage] = useState("");
  const [isCaptchaValid, setIsCaptchaValid] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value.slice(0, 6);
    setUserInput(e.target.value);
    setCaptchaError("");


    if (value.length === captcha.length) {
      if (value === captcha) {
        setMessage("✅ Captcha Matched!");
        setIsCaptchaValid(true);
      } else {
        setMessage("❌ Captcha Incorrect !");
        setIsCaptchaValid(false);
      }
    } else {
      setMessage("");
      setIsCaptchaValid(false);
    }
  };


  const handlePayment = async () => {
    const apiUrl = "https://bsnlrechargeapi.pyrogroup.com/bsnl-api/validate";
    const requestData = {
      destMsisdn: mobile,
      denomination: price,
      zone_code: zoneCode,
      circle_code: circle_code,
      url: validation_api_url,
    };
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok && result.message === "DIAMETER_SUCCESS") {
        setPgUrl(result.data.pgurl);
        setShowConfirmModal(true);
      } else if (result.message === "Validation failed") {
        const errorMessage = result.data?.status_desc || "Validation failed";
        setResultMessage(errorMessage);
        setResultType("error");
        setShowResultModal(true);
      } else {
        const errorMessage = result.error || result.message || "Something went wrong";
        setResultMessage(errorMessage);
        setResultType("error");
        setShowResultModal(true);
      }
    } catch (error) {
      setResultMessage("Recharge request failed. Please try again.");
      setResultType("error");
      setShowResultModal(true);
    }
  };


  const handleProceed = (e) => {
    if (e) e.preventDefault();   // ✅ stops page refresh on Enter key

    let newErrors = { captcha: "", plan: "", amount: "" };

    if (!isCaptchaValid) newErrors.captcha = "Please complete the CAPTCHA.";
    if (!price) newErrors.amount = "Please enter an amount.";
    if (!planSelected) newErrors.plan = "Plan not selected, proceeding without plan.";

    setErrors(newErrors);

    const firstErrorField =
      (!isCaptchaValid && document.getElementById("captchaInput")) ||
      (!price && document.getElementById("amount")) ||
      (!planSelected && document.getElementById("plan-tabs"));

    if (firstErrorField && typeof firstErrorField.focus === "function") {
      firstErrorField.focus();
    }

    if (isCaptchaValid && price) {
      handlePayment();
    }
  };

  const handleSelectPlanClick = () => {
    if (!isCaptchaValid) {
      setCaptchaError("Please enter the correct CAPTCHA");
    } else if (isCaptchaValid) {
      setModalShow(true);
      openModal();
    } else {
      setCaptchaError("");
      setPlanSelected(true);
      setModalShow(true);
    }
  };
 

  const handleAmountChange = async (e) => {
    const enteredAmount = e.target.value;
    setPrice(enteredAmount);

    if (!userInput) {
      setCaptchaError("Please enter CAPTCHA");
    } else {
      setCaptchaError("");
    }

    if (operatorCode && circleCode) {
      try {
        const response = await fetch(
          `https://bsnlrechargeapi.pyrogroup.com/api/recharge-plansnew?operatorCode=${operatorCode}&circleCode=${circleCode}`
        );
        if (!response.ok) throw new Error("Network error");   // ✅ add this check

        const result = await response.json();


        if (result.mobilePlans && typeof result.mobilePlans === "object") {
          const allPlans = Object.values(result.mobilePlans).flat();


          const selectedPlan = allPlans.find(
            (plan) => parseInt(plan.price) === parseInt(enteredAmount)
          );

          if (selectedPlan) {


            setDes(selectedPlan.description || "No description available");
          } else {
            setDes("");
          }
        } else {
          setDes("");
        }
      } catch (error) {
        setDes("");
      }
    }
  };

  const sortedPlans = [...plans].sort((a, b) =>
    a.service === "POPULAR PACK" ? -1 : b.service === "POPULAR PACK" ? 1 : 0
  );




  return (
    <>
      <div className="main" id="main">
        <div className="container">
          <div className="row">
            <div className="col-md-6 offset-md-3 d-flex align-items-center justify-content-center">
              <div className="my-form w-100 m-1 p-3">
                <h1 style={{ color: '#B24C00', fontSize: '28px', marginBottom: '30px' }}>Mobile Recharge</h1>

                <form onSubmit={handleProceed}>
                  {/* 🔴 Global form error message at the top of the form */}
                  {resultMessage && (
                    <div
                      role="alert"
                      className={`alert ${resultType === "error" ? "alert-danger" : "alert-success"}`}
                      tabIndex="-1" // lets you shift focus here if needed
                    >  {resultMessage}
                    </div>
                  )}
                  {/* Mobile Number */}
                  <div className="form-group mt-3 mb-3">
                    <label htmlFor="mobileNumber" style={{ fontWeight: 'bold', color: '#B24C00', marginBottom: '5px', fontSize: '16px' }}>Mobile Number *</label>
                    <p id="prepaidMobileHelp"> (Enter your 10-digit prepaid mobile number)</p>
                    <input
                      id="mobileNumber"
                      className="form-control"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      maxLength={10}
                      placeholder="Enter Mobile no."
                      aria-describedby={errorMessage ? "prepaidMobileHelp mobileNumberError" : "prepaidMobileHelp"}
                    />
                    {errorMessage && (
                      <p id="mobileNumberError" role="alert" className="text-danger mt-2">
                        {errorMessage} Please enter a valid 10-digit BSNL Prepaid number.
                      </p>
                    )}
                  </div>

                  {/* Circle Name */}
                  <div className="form-group mt-3 mb-3">
                    <label htmlFor="circleName" style={{ fontWeight: 'bold', color: '#B24C00', marginBottom: '5px', fontSize: '16px' }} >Circle Name</label>
                    <input
                      id="circleName"
                      className="form-control circle-input"
                      type="text"
                      value={circleCode}
                      readOnly
                      aria-describedby={circleCode ? "circleHelp" : "circleNameError"}
                    />
                    {errorMessage && errorMessage.includes("Circle") ? (
                      <p id="circleNameError" role="alert" className="text-danger mt-2">
                        Circle could not be fetched. Please re-enter a valid BSNL number.
                      </p>
                    ) : (
                      <small id="circleHelp" className="form-text text-muted">
                        Auto-fetched based on your mobile number
                      </small>
                    )}
                  </div>

                  {/* Captcha */}
                  <div className="form-group mt-3 mb-3">
                    <div className="row">
                      <label htmlFor="captchaInput" className="form-label" style={{ fontWeight: 'bold', color: '#B24C00', marginBottom: '5px', fontSize: '16px' }}>Captcha *</label>
                      <input
                        id="captchaInput"
                        type="text"
                        className="form-controls col-5"
                        value={userInput}
                        onChange={handleInputChange}
                        maxLength={6}
                        placeholder="Enter the code"
                        aria-describedby="captchaStatus"
                      />


                      <div className="col-6 captchcss" >
                        <div className="captchinner" aria-hidden="true" >
                          {captcha}
                        </div>
                        <button
                          className="refreshbtn captchbtn"
                          type="button"
                          onClick={() => {
                            setCaptcha(generateCaptcha());
                            setUserInput("");
                            setMessage("");                        // clear old status
                            setIsCaptchaValid(false);
                            setCaptchaError("");                    // clear old error
                          }}
                          aria-label="Refresh CAPTCHA"
                        >
                          <i className="fa-solid fa-arrows-rotate" aria-hidden="true"></i>
                          <span className="visually-hidden">Refresh CAPTCHA</span>
                        </button>
                      </div>
                    </div>


                    {/* 🔴 Single live region for both error + success */}
                    {(captchaError || message) && (
                      <p
                        id="captchaStatus"
                        role="alert"
                        aria-live="polite"
                        className={captchaError ? "captchaerror" : message.includes("✅") ? "success-message" : "error-message"}
                      >
                        {captchaError || message}
                      </p>
                    )}
                  </div>



                  {/* Amount */}
                  <div className="form-group mt-2">
                    <label htmlFor="amount" style={{ fontWeight: 'bold', color: '#B24C00', marginBottom: '5px', fontSize: '16px' }}>Amount</label>
                    <input
                      id="amount"
                      className="form-control"
                      type="text"
                      value={price}
                      onChange={handleAmountChange}
                      aria-describedby={errors.amount ? "amountError" : undefined}
                      placeholder="Enter amount" />
                    {errors.amount && (
                      <p id="amountError" role="alert" className="text-danger mt-2">
                        {errors.amount}
                      </p>
                    )}




                    {operatorCode === "BSNL" && (
                      <div className="row saiprasad">
                        <div className="col-6 mt-3">
                          <p>Active plan: <b className="text-secondary">{activePlan}</b></p>
                        </div>
                        <div className="col-6 mt-3 text-end">
                          <p>Expiry date: <b className="text-secondary">{Expiry_date}</b></p>
                        </div>
                      </div>
                    )}

                    {mobile.length === 10 && isCaptchaValid && activePlan !== 0 && Expiry_date !== 0 && (
                      <span>
                        {/*a onClick={openModal} style={{color:'#1473F1', fontWeight: '600',fontSize:'15px'}} >Browse Plans</a> */}
                        <button type="button" onClick={openModal} className="btn btn-link p-0 browse-plans-btn"
                          style={{ color: '#1473F1', fontWeight: '600', fontSize: '15px', textDecoration: 'none' }}> Browse Plans
                        </button>
                      </span>
                    )}

                  </div>

                  <div>
                    {mobile.length === 10 && isCaptchaValid && activePlan !== 0 && Expiry_date !== "" && topPlans.length > 0 && (
                      <h2 className="text-center mb-4 ownfont" >
                        Recommended Plans
                      </h2>
                    )}

                    <div className="row">
                      {mobile.length === 10 && isBSNL && isCaptchaValid && topPlans.length > 0 && activePlan !== 0 && Expiry_date !== "" &&
                        topPlans.map((plan, index) => (
                          <div
                            className="recharge-card"
                            onClick={() => setPlanDetails(plan.rech_type_desc, plan.amount, plan.description)}
                            key={index}
                          >
                            <div className="pill-tag">{plan.rech_type_desc}</div>
                            <div className="plan-details row mt-2">
                              <div className="col-5">
                                <h2>₹ {plan.amount}</h2>
                              </div>
                              <p className="col-4">{plan.rech_type}</p>
                              <p className="col-3">
                                {(() => {
                                  const v = plan.validity?.toLowerCase().trim();
                                  if (!v) return "N/A";
                                  if (v.includes("one month")) return "1 Month";
                                  if (v.match(/^\d+days$/)) return `${parseInt(v)} Days`;
                                  return plan.validity;
                                })()}
                              </p>
                            </div>
                            <p className="text-muted own-text">{plan.short_desc}</p>
                          </div>
                        ))
                      }
                    </div>
                  </div>


                  <div className="text-center">
                    {!isCaptchaValid && errors?.captcha && (
                      <p className="text-red-500">{errors.captcha}</p>
                    )}

                    {isCaptchaValid && price ? (
                      <Button className="btn btn-warning custom-select-btn" onClick={handleProceed}
                        style={{ backgroundColor: '#FF7F00', borderRadius: '7px', marginTop: '18px', height: '40px', padding: '0 16px', width: 'auto', fontSize: '16px' }}>
                        Recharge&nbsp;
                    <strong>₹{price}</strong>

                      </Button>
                    ) : (
                      <Button className="btn btn-warning  custom-select-btn" onClick={handleSelectPlanClick}
                        style={{ backgroundColor: '#FF7F00', borderRadius: '7px', marginTop: '18px', height: '40px', padding: '0 16px', width: 'auto', fontSize: '16px' }}>
                        Select Plan
                      </Button>
                    )}
                  </div>

                </form>

                <Modal show={showResultModal} onHide={() => setShowResultModal(false)}>
                  <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: "1.5rem", fontWeight: "bold", color: '#1473F1' }}>Recharge Status</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p>{resultMessage}</p>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowResultModal(false)}
                      style={{
                        backgroundColor: '#343a40', borderColor: '#343a40', color: '#ffffff',
                      }}
                      onFocus={(e) => {
                        e.target.style.outline = '2px solid black';
                        e.target.style.outlineOffset = '2px';
                        e.target.style.boxShadow = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.outlineOffset = '0';
                      }} >Close</Button>
                  </Modal.Footer>
                </Modal>



                <Modal show={showConfirmModal} onHide={() => { setShowConfirmModal(false) }} >
                  <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: "1.5rem", fontWeight: "bold", color: '#1473F1' }} >Confirm Recharge</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <p><strong>Mobile Number:</strong> {mobile}</p>
                    <p><strong>Amount:</strong> ₹ {price}</p>
                 {/* <strong>₹{price}</strong> */}

                    <p><strong>Description:</strong> {des}</p>
                  </Modal.Body>
                  <Modal.Footer>
                    {/* Cancel button */}
                    <Button variant="secondary" onClick={() => { setShowConfirmModal(false) }}
                      style={{ backgroundColor: '#343a40', borderColor: '#343a40', color: '#ffffff' }}
                      onFocus={(e) => {
                        e.target.style.outline = '2px solid black';
                        e.target.style.outlineOffset = '2px';
                        e.target.style.boxShadow = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = 'none';
                        e.target.style.outlineOffset = '0';
                      }} >
                      Cancel
                    </Button>

                    {/* Confirm button (opens link in new tab) */}
                    <Button
                      variant="primary"
                      // className="own-texts own-saitext btn"  
                      as="a"
                      href={pgUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => { setShowConfirmModal(false) }}
                      style={{ backgroundColor: '#c34100', borderColor: '#c34100', color: '#ffffff', textDecoration: "none" }}

                      onFocus={(e) => {
                        e.target.style.outline = '2px solid black';
                        e.target.style.outlineOffset = '2px';
                        e.target.style.boxShadow = 'none';
                      }}
                      onBlur={(e) => {
                        e.target.style.outline = "none";
                        e.target.style.outlineOffset = "0";
                        e.target.style.boxShadow = "none";
                      }}
                    >
                      Confirm
                    </Button>
                  </Modal.Footer>
                </Modal>



                <Modal show={modalShow} className="smodal" onHide={() => setModalShow(false)} aria-labelledby="select-plan-title" >
                  <Modal.Header closeButton>
                    <Modal.Title as="h2" id="select-plan-title" className="text-center" style={{ fontSize: "1.5rem", fontWeight: "bold", color: '#1473f1', }}>Select a Plan</Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <Tabs                                // Compute default active tab (Voice > first category > none)
                      defaultActiveKey={
                        sortedPlans.some((category) => category.service === "Voice")
                          ? "Voice"
                          : sortedPlans.length > 0
                            ? sortedPlans[0].service
                            : ""
                      }
                      id="plan-tabs"
                      className="mb-3 nav-tabs vertical-tabs"
                      justify
                    >
                      {sortedPlans.map((category, index) => (
                        <Tab eventKey={category.service} title={category.service} key={index} className="tab-content-buttonsa">
                          {category.plans
                            .sort((a, b) => parseFloat(b.price) - parseFloat(a.price)) // Descending price sort
                            .map((inner, index2) => {
                              // const discounted = getDiscountedPrice(inner.price);

                              return (
                                <div className="plan-type p-2 border-bottom recharge-cardstab" key={index2}>
                                  <div className="row align-items-center">
                                    <div className="col-10 saiprasad-col-10">
                                      <div className="d-flex align-items-center">
                                        <div className="price-box">
                                          <span className="price">₹ {inner.price}</span>
                                        </div>
                                        <div className="ms-3 w-100 ias-plain-text-las">
                                          <div className="title">
                                            <strong>{inner.productName}</strong>
                                          </div>
                                          <div className="description descs">{inner.description}</div>
                                          <div className="validity text-secondary">
                                            Validity:{" "}
                                            {inner.validityDesc
                                              ? /^\d+$/.test(inner.validityDesc.trim())
                                                ? parseInt(inner.validityDesc.trim(), 10) === 1
                                                  ? "1 day"
                                                  : `${inner.validityDesc.trim()} days`
                                                : inner.validityDesc
                                              : "N/A"}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="col-2 text-center saiprasad-col-2">
                                      <Button
                                        className="recharge-plantab"
                                        onClick={() =>
                                          setPlanDetails(inner.productCode, inner.price, inner.description)
                                        }
                                      >
                                        {/* {discounted ? (
                                          <span>
                                            <s>₹{inner.price}</s> → <strong>₹{discounted}</strong>
                                          </span>
                                        ) : (
                                          <strong>₹{inner.price}</strong>
                                        )} */}
                                         <strong>₹{inner.price}</strong>

                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </Tab>
                      ))}
                    </Tabs>

                  </Modal.Body>
                </Modal>



              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Recharge;