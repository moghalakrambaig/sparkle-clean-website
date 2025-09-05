// import express from "express";
// import cors from "cors";
// import bodyParser from "body-parser";
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config();

// const app = express();
// app.use(cors());
// app.use(bodyParser.json());

const twilio1 = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH);



// ✅ Use a relative API route, not the frontend URL
// app.post("/booking", async (req, res) => {
//   const { name, phone, serviceType } = req.body;

//   try {
//     // Send SMS to admin (your phone)
//     await client.messages.create({
//       body: `New booking from ${name} for ${serviceType}. Phone: ${phone}`,
//       from: process.env.TWILIO_PHONE,
//       to: process.env.ADMIN_PHONE,
//     });

//     res.status(200).json({ message: "Booking received and SMS sent" });
//   } catch (err) {
//     console.error("Twilio error:", err);
//     res.status(500).json({ error: "SMS failed" });
//   }
// });

// app.listen(5000, () =>
//   console.log("✅ Server running on http://localhost:5000")
// );
async function SendMessage() {
  console.log("FROM:", process.env.TWILIO_PHONE);
  console.log("TO:", process.env.ADMIN_PHONE);

  const message = await twilio1.messages.create({
    body: `New booking test 🚀`,
    from: process.env.TWILIO_PHONE,
    to: process.env.ADMIN_PHONE,
  });

  console.log("Message SID:", message.sid);
}

SendMessage();
