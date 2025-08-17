import nodemailer from "nodemailer";

export const sendEmail = async (req, res) => {
  try {
    const { recipients, summary } = req.body;

    const subjectLine = summary.split("\n")[0].slice(0, 80) || "Meeting Summary";

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.FROM_EMAIL,
      to: recipients,
      subject: subjectLine,
      text: summary,
    });

    res.json({ success: true, message: "Email sent successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Email sending failed" });
  }
};
