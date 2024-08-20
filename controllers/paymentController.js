const { default: axios } = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User');
const { getPlanbyId } = require('./planController');


// subscription
// monthly5000,daily250,yearly individual55000 yearly corporate5000/employee



const clientId = "PEeoj83fPgqLrqeRUGmoJQsWOzffNh33lGHqnfXS";
const clientSecret = "7bRCA1sbZySE9L3c6Twkm6DfDFW9eFivKZmy9xROUoUYEBaT0luPooxmUKj2rb7L0gRU1jiw64b8wYlryHtMNlzpZHzHYcR8kpuvahDIh9M53uJ1AHhzO5QVyWgoDjhb";
const tokenUrl = "https://sandbox.sasapay.app/api/v1/auth/token/?grant_type=client_credentials";
const confirmUrl = "https://7626-197-232-60-144.ngrok-free.app/confirm";
const callbackurl = "https://4351-41-139-202-31.ngrok-free.app/api/v1/payment/c2b-callback-results";

// Convert the credentials
const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

// Request token before payment request
const getToken = async () => {
  try {
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    };

    const response = await axios.get(tokenUrl, requestOptions);
    console.log("Token obtained:", response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching token:", error);
    throw error;
  }
};

// Send a payment request
const requestPayment = async (req, res) => {
    
  try {
    const token = await getToken();
    const planType = await getPlanbyId(planid);
    console.log('plan details',myplan.name)


    const {
      MerchantCode,
      NetworkCode,
      PhoneNumber,
      TransactionDesc,
      AccountReference,
      Currency,
      Amount,
      userId,
      username,
      email,
      // planType,
      planid
    } = req.body;

    console.log("Request body:", req.body);

    // Validate your body
    const paymentDetails = {
      userId,
      username,
      email,
      // planType,
      planid
    };
    

    const jsonString = JSON.stringify(paymentDetails);
    const urlEncodedPaymentData = encodeURIComponent(jsonString);
    const CallBackURL = callbackurl;
    console.log(CallBackURL);

    const formattedCallbackUrl = `${CallBackURL}?paymentData=${urlEncodedPaymentData}`;
    const response = await axios.post(
      "https://sandbox.sasapay.app/api/v1/payments/request-payment/",
      {
        MerchantCode,
        NetworkCode,
        PhoneNumber,
        TransactionDesc,
        AccountReference,
        Currency,
        Amount,
        CallBackURL: formattedCallbackUrl,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    console.log("request sent");
    res.json(response.data);
    console.log("API response", response.data);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "An error occurred",
      error: error.response?.data || error.message,
    });
  }
};



const handleCallback = async (req, res) => {
    const callbackData = req.body;
    console.log("C2B Callback Data:", callbackData);
  
    const paymentData = req.query.paymentData;
    const jsonString = decodeURIComponent(paymentData);
    const jsonData = JSON.parse(jsonString);
    console.log("decoded data", jsonData);
  
    if (callbackData.ResultCode == 0) {
      console.log("A successful transaction");
      try {
        const transactionId = callbackData.CheckoutRequestID;
        // const planType = "daily"; // Example: you can determine this from the transaction details or request
        await updateUserPlan(jsonData.userId,jsonData.planType);
        console.log('Transaction ID', transactionId);
        res.status(200).json("ok");
      } catch (error) {
        console.error("Error updating user plan:", error);
        res.status(500).json({ message: "Error processing transaction" });
      }
    } else {
      console.log("A failed transaction");
      res.status(200).json("ok");
    }
  };
  



//choose plan and update dates
// Function to update user's plan
const updateUserPlan = async (userId, planType) => {
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        console.error(`User with ID ${userId} not found.`);
        return;
      }
  
      let newEndDate;
      const currentDate = new Date();
      console.log(currentDate)
  
      switch (planType) {
        case "monthly":
          newEndDate = new Date(currentDate.setDate(currentDate.getDate() + 31));
          break;
        case "yearly":
          newEndDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
          break;
        case "daily":
          newEndDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
          break;
        
        default:
          // Default plan: add 7 days from account creation date
          newEndDate = new Date(user.created_at);
          newEndDate.setDate(newEndDate.getDate() + 7);
          break;
      }
  
      user.plan = planType;
      user.startdate = currentDate;
      user.enddate = newEndDate;
      user.transactionStatus = "success"; // Assuming this is set to success upon payment
  
      await user.save();
  
      console.log(`User ${userId} updated with plan ${planType}.`);
    } catch (error) {
      console.error("Error updating user plan:", error);
    }
  };

module.exports = {
  getToken,
  requestPayment,
  handleCallback
};