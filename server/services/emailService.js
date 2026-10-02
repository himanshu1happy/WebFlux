const sendOtpEmail = async ({
  email,
  name,
  otp,
}) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName =
    process.env.BREVO_SENDER_NAME || "WebFlux";

  if (!apiKey) {
    throw new Error("BREVO_API_KEY is not configured");
  }

  if (!senderEmail) {
    throw new Error(
      "BREVO_SENDER_EMAIL is not configured"
    );
  }

  const response = await fetch(
    "https://api.brevo.com/v3/smtp/email",
    {
      method: "POST",

      headers: {
        accept: "application/json",
        "api-key": apiKey,
        "content-type": "application/json",
      },

      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },

        to: [
          {
            email,
            name,
          },
        ],

        subject: "WebFlux Email Verification OTP",

        htmlContent: `
          <div style="font-family: Arial, sans-serif; background:#f5f7f8; padding:30px;">
            <div style="max-width:600px; margin:auto; background:white; padding:30px; border:1px solid #d9e0e5; border-radius:8px;">

              <h2 style="color:#164a63; margin-bottom:8px;">
                WebFlux
              </h2>

              <p style="color:#64748b;">
                Legal Metrology Digital Platform
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:20px 0;" />

              <p style="color:#334155;">
                Hello ${name || "User"},
              </p>

              <p style="color:#475569;">
                Use the following OTP to verify your email address:
              </p>

              <div style="
                font-size:32px;
                font-weight:bold;
                letter-spacing:8px;
                color:#164a63;
                background:#f1f5f9;
                padding:18px;
                text-align:center;
                border-radius:6px;
                margin:25px 0;
              ">
                ${otp}
              </div>

              <p style="color:#64748b; font-size:14px;">
                This OTP is valid for 10 minutes.
              </p>

              <p style="color:#64748b; font-size:14px;">
                If you did not request this verification,
                you can safely ignore this email.
              </p>

              <hr style="border:none; border-top:1px solid #e2e8f0; margin:25px 0;" />

              <p style="color:#94a3b8; font-size:12px;">
                WebFlux Legal Metrology Digital Platform
              </p>

            </div>
          </div>
        `,
      }),
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
  console.error("Brevo API error:", data);

  throw new Error(
    data.message || "Failed to send verification email"
  );
}

console.log("✅ Brevo email accepted:", data);

return data;
};

module.exports = {
  sendOtpEmail,
};