const { Complaint } = require('../models/complaint')
const nodemailer = require('nodemailer')
require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

/**
 * @route GET /staff/dashboard
 * @description View Staff Dashboard
 * @type RequestHandler
 */

const verifie = [
  { JZRM5981: 'mohatadhruv@gmail.com' },
  { JZRM5982: 'dhirajmohata86@gmial.com' },
  { JZRM5983: 'mohatadhruv@gmail.com' },
  { JZRM5984: 'mohatadhruv@gmail.com' },
  { JZRM5985: 'mohatadhruv@gmail.com' },
  { JZRM5986: 'dhirajmohata86@gmial.com' },
  { JZRM5987: 'mohatadhruv@gmail.com' },
  { JZRM5988: 'dhirajmohata86@gmial.com' },
  { JZRM5989: 'mohatadhruv@gmail.com' },
  { JZRM5990: 'dhirajmohata86@gmial.com' }
]

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'turbogeek641@gmail.com',
    pass: 'vcle vjly tzln yznv'
  }
})

exports.staffDashboard = async (req, res) => {
  try {
    const complaints = await Complaint.find({ forwardTo: req.user._id })
    res.render('staff/dashboard.ejs', {
      staff: req.user,
      complaints
    })
  } catch (err) {
    console.log(err)
  }
}


// Access your API key as an environment variable
const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const generationConfig = {
    maxOutputTokens: 90000,
    temperature: 0.9,
    topP: 0.1,
    topK: 16,
  };
// Converts local file information to a GoogleGenerativeAI.Part object.
function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType
    },
  };
}

async function run(complain1 , complain2) {
  // For text-and-image input (multimodal), use the gemini-pro-vision model
  const model = genAI.getGenerativeModel({ model: "gemini-pro" ,generationConfig});
  console.log(complain1, complain2);
  complain1 = complain1.toLowerCase();
  complain2 = complain2.toLowerCase();
  const prompt = `

 Analyze and quantify the similarity in meaning between the following statements: ${complain1} and ${complain2}. Express the degree of similarity as a percentage based on their intended messages.
`;

  const result = await model.generateContent([prompt]);
  const response = await result.response;
  const text = response.text();
  return text;
}

exports.aicomplains = async (req, res) => {
  try {
    const complaints = await Complaint.find();
    let temp = [];
    let complaint = req.body.complaint;
    for(let i=0; i<complaints.length; i++){
      let text = await run(complaint, complaints[i].description)
      const percentage = parseFloat(text.match(/\d+(\.\d+)?/)[0]);

      if (percentage && percentage > 85) {
        console.log("Percentage:", percentage);
        temp.push(complaints[i]);
      }
    }
    res.json(temp);
  } catch (err) {
    console.log(err)
  }
}

/**
 * @route GET /staff/complaints
 * @description View Complaints from Staff Page
 * @type RequestHandler
 */
exports.viewComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ forwardTo: req.user._id })

    if (req.session.role === 'staff') {
      return res.render('staff/complaints.ejs', {
        staff: req.user,
        complaints
      })
    }
  } catch (err) {
    console.log(err)
  }
}

/**
 * @route POST /complaints/feedback
 * @description Post feedback to complaints by Staff
 * @type RequestHandler
 */
exports.complaintFeedback = async (req, res) => {
  try {
    await Complaint.updateOne(
      { _id: req.body.complaintId },
      { $set: { feedback: req.body.feedback, status: 'done' } }
    )

    const complaints = await Complaint.find({ _id: req.body.complaintId })

    var ml
    console.log(complaints.citizenship)
    for (const obj of verifie) {
      for (const key in obj) {
        if (key === complaints.citizenship) {
          ml = obj[key]
          break
        }
      }
    }

    const mailOptions = {
      from: 'turbogeek641@gmail.com',
      to: 'pandeyjee2310@gmail.com',
      subject: 'Hello, you have sussesfully submited your complain',
      text: req.body.feedback
    }

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('Error sending email: ' + error)
      } else {
        console.log('Email sent: ' + info.response)
      }
    })

    await req.flash('success_msg', 'Complaint replied successfully')
    res.redirect('/staff/dashboard')
  } catch (err) {
    console.log(err)
  }
}
