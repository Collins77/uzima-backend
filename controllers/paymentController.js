const { default: axios } = require('axios');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../model/User');
const { getPlanbyId } = require('./planController');


// subscription
// monthly5000,daily250,yearly individual55000 yearly corporate5000/employee


//local
// const clientId = "wB0A457offQBTSlyGonIHPFZDC9Sg8E7qLysRirL";


//live
const clientId = "rpHZgBnYOOgELY6AaWrjhZ4pUOo8WBOkLZbWJ87f";

//local
// const clientSecret = "X8uYzrhwAQ7S3VG6V0ltwDaRqnDGXTXbfJ3Lymfu3jf6wzzOmucHkAVEQBRPn9FhEfrdqIu2994VYE6AGBsf9kVHo7Za65iZ990KdhmfQQBHejUmFg7MHsXkrt7vNU4M";


//live
const clientSecret = "1LHXslu0zjToFXOhUhxUUGEIWcRbeFUtziwdzzcm89xA95cAVBA94xpTiU8v2Op3RfP9NPqSJpMIevnuk4lRbeQenxnlLmZMBORb57hWMwMUggiTXRSO3jbHFt2ZMFEE";
const tokenUrl = "https://sandbox.sasapay.app/api/v1/auth/token/?grant_type=client_credentials";
const confirmUrl = "https://7626-197-232-60-144.ngrok-free.app/confirm";
// const callbackurl = "https://a57b-197-232-60-144.ngrok-free.app/api/payment/c2b-callback-results";
const callbackurl = "https://uzima-backe.vercel.app/api/payment/c2b-callback-results";

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
    const planType = await getPlanbyId(planid);
    console.log("The plan", planType)
    const planName=planType.name;
    console.log('plan details',planName)

    console.log("Request body:", req.body);

    // Validate your body
    const paymentDetails = {
      userId,
      username,
      email,
      planid,
      planName
    };
    

    const jsonString = JSON.stringify({paymentDetails});
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
    const username = jsonData.paymentDetails.userId;
    console.log("decoded data", jsonData);
    console.log("decoded username", username);
  
    if (callbackData.ResultCode == 0) {
      console.log("A successful transaction");
      try {
        const transactionId = callbackData.CheckoutRequestID;
        // const planType = "daily"; // Example: you can determine this from the transaction details or request
        await updateUserPlan(jsonData.paymentDetails.userId,jsonData.paymentDetails.planid,jsonData.paymentDetails.planName);
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
// const updateUserPlan = async (userId, planid,planname) => {
//   console.log("my plan type",planid);
//   console.log("my plan name",planname);
//     try {
//       const user = await User.findById(userId);
      
  
//       if (!user) {
//         console.error(`User with ID ${userId} not found.`);
//         return;
//       }
//       console.log("selected user",user);
  
//       let newEndDate;
//       const currentDate = new Date();
//       console.log(currentDate)
//       console.log("user is paying for a plan called".planname)
  
//       switch (planname) {
//         case "Daily":
//           newEndDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
//           break;
//         case "yearly":
//           newEndDate = new Date(currentDate.setFullYear(currentDate.getFullYear() + 1));
//           break;
//         case "Daily":
//           newEndDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
//           break;
        
//         default:
//           // Default plan: add 7 days from account creation date
//           newEndDate = new Date(user.created_at);
//           newEndDate.setDate(newEndDate.getDate() + 7);
//           break;
//       }
  
//       user.plan = planid;
//       user.subscriptionStartDate = currentDate;
//       user.subscriptionEndDate = newEndDate;
//       user.transactionStatus = true; // Assuming this is set to success upon payment
  
//       await user.save();
  
//       console.log(`User ${userId} updated with plan ${planname}.`);
//       console.log('userdata',user)
//     } catch (error) {
//       console.error("Error updating user plan:", error);
//     }
//   };

const updateUserPlan = async (userId, planid, planname) => {
  console.log("my plan type", planid);
  console.log("my plan name", planname);
  try {
    const user = await User.findById(userId);

    if (!user) {
      console.error(`User with ID ${userId} not found.`);
      return;
    }
    console.log("selected user", user);

    const currentDate = new Date();
    console.log(currentDate);
    console.log("user is paying for a plan called", planname);

    let newEndDate = new Date(currentDate); // Create a copy of currentDate

    switch (planname) {
      case "Daily":
        newEndDate.setDate(currentDate.getDate() + 1);
        break;
      case "yearly":
        newEndDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      case "monthly":
        newEndDate.setMonth(currentDate.getMonth() + 1);
        break;
      default:
        // Default plan: add 7 days from account creation date
        newEndDate = new Date(user.created_at);
        newEndDate.setDate(newEndDate.getDate() + 7);
        break;
    }

    user.plan = planid;
    user.subscriptionStartDate = currentDate;
    user.subscriptionEndDate = newEndDate;
    user.transactionStatus = true; // Assuming this is set to success upon payment

    await user.save();

    console.log(`User ${userId} updated with plan ${planname}.`);
    console.log("userdata", user);
  } catch (error) {
    console.error("Error updating user plan:", error);
  }
};


module.exports = {
  getToken,
  requestPayment,
  handleCallback
};