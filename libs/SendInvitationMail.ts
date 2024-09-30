import nodemailer from "nodemailer";

// Shared SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

export async function sendInvitationEmail(
  email: string,
  name: string,
  encryptedData: string
): Promise<boolean> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const url = `${baseUrl}/signup?email=${email}&name=${name}&token=${encryptedData}`;
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: "Your Inviation email is",
      html: `
        <div style="font-family: Arial, sans-serif; text-align: center; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">You're Invited!</h2>
          <p style="color: #555;">Click the button below to accept your invitation,</p>
          <a href="${url}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #ffdd00; color: #000; text-decoration: none; font-size: 16px; border-radius: 5px; font-weight: bold;">Accept Invitation</a>
          <p style="color: #777;">If you can't click the button, copy and paste the following URL into your browser:</p>
          <p style="color: #007BFF;">${url}</p>
        </div>
      `,
    });
    return true;
  } catch (error) {
    console.error(`Failed to send invitation email to ${email}:`, error);
    return false;
  }
}
