var express = require("express");
var router = express.Router();
var nodemailer = require("nodemailer");
var cors = require("cors");
const creds = require("./config");

var transport = {
  host: "smtp.ethereal.email", // Don’t forget to replace with the SMTP host of your provider
  port: 587,
  auth: {
    user: "pasquale.willms1@ethereal.email",
    pass: "XM1g3zwBpJ8VxKfAgj",
  },
};

var transporter = nodemailer.createTransport(transport);

transporter.verify((error, success) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take messages");
  }
});

router.post("/send", (req, res, next) => {
  var pName = req.body.pName;
  var pEmail = req.body.pEmail;
  var cName = req.body.cName;
  var course = req.body.course;
  // var message = req.body.message;
  var content = `Dear ${pName} \n ${cName}'s class ${course} has been successfully booked. `;

  var mail = {
    from: pName,
    to: pEmail, // Change to email address that you want to receive messages on
    subject: "New Message from Contact Form",
    text: content,
  };

  transporter.sendMail(mail, (err, data) => {
    if (err) {
      res.json({
        status: "fail",
      });
    } else {
      res.json({
        status: "success",
      });
    }
  });
});

const app = express();
app.use(cors());
app.use(express.json());
app.use("/", router);
app.listen(3002);
