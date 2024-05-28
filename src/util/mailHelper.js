import mailer from "nodemailer";
import { config } from 'dotenv';
config();

const transporter = mailer.createTransport({
    service: "gmail",
    auth:{
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    },
    secure: true
});

const sendMail  = (to, subject, html) => {
    let mailOptions = {
        to :  to,
        subject : subject,
        html: html,
        from: {
            name: "Retel",
            address: process.env.EMAIL
        },
        text : process.env.TEXT
    };
    transporter.sendMail(mailOptions, function(err, result){
        if(err) console.log(err);
            console.log(result);
    })
};

export default sendMail;