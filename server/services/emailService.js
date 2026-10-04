const sendOtpEmail = async ({
  email,
  name,
  otp,
}) => {
  const senderName =
    process.env.BREVO_SENDER_NAME || "WebFlux";
  const brevoSenderEmail = process.env.BREVO_SENDER_EMAIL;
  const resendSenderEmail =
    process.env.RESEND_SENDER_EMAIL || brevoSenderEmail;
  const safeName = String(name || "User").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character]
  );

  const htmlContent = `
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
                Hello ${safeName},
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
        `;
  const providers = [];

  if (process.env.BREVO_API_KEY && brevoSenderEmail) {
    providers.push({
      name: "Brevo",
      url: "https://api.brevo.com/v3/smtp/email",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: {
        sender: { name: senderName, email: brevoSenderEmail },
        to: [{ email, name: safeName }],
        subject: "WebFlux Email Verification OTP",
        htmlContent,
      },
    });
  }

  if (process.env.RESEND_API_KEY && resendSenderEmail) {
    providers.push({
      name: "Resend",
      url: "https://api.resend.com/emails",
      headers: {
        authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "content-type": "application/json",
      },
      body: {
        from: `${senderName} <${resendSenderEmail}>`,
        to: [email],
        subject: "WebFlux Email Verification OTP",
        html: htmlContent,
      },
    });
  }

  if (providers.length === 0) {
    throw new Error(
      "Email delivery is not configured: set a provider API key and verified sender address"
    );
  }

  const failures = [];
  for (const provider of providers) {
    try {
      const response = await fetch(provider.url, {
        method: "POST",
        headers: provider.headers,
        body: JSON.stringify(provider.body),
      });
      const responseText = await response.text();
      let data = {};
      try {
        data = responseText ? JSON.parse(responseText) : {};
      } catch {
        data = { message: responseText };
      }

      if (!response.ok) {
        console.error(`${provider.name} email API error:`, {
          status: response.status,
          response: data,
        });
        failures.push(`${provider.name} returned HTTP ${response.status}`);
        continue;
      }

      console.log(`${provider.name} email accepted`);
      return data;
    } catch (error) {
      console.error(`${provider.name} email request failed:`, error.message);
      failures.push(`${provider.name} request failed`);
    }
  }

  throw new Error(
    `Email delivery failed (${failures.join("; ")}). Check that the provider credentials and sender address are valid.`
  );
};

module.exports = {
  sendOtpEmail,
};