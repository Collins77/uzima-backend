const nodemailer = require('nodemailer');

// const transporter = nodemailer.createTransport({
//     service: 'Gmail', // or any other email service
//     auth: {
//         user: process.env.EMAIL_USER,
//         pass: process.env.EMAIL_PASS
//     }
// });

const transporter = nodemailer.createTransport({
    // host: 'smtp.titan.email',
    host:'mail.uzima.ai',
    port: 465,
    secure: true,
    
    auth: {
        user: 'noreply@uzima.ai',
        pass: 'Uzima@2024'
    }
});

const sendEmail = (to, subject, text) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to,
        subject,
        text
    };
    return transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
