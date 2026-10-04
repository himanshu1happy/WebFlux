require("dotenv").config();

const sendTestEmail = async () => {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME,
          email: process.env.BREVO_SENDER_EMAIL,
        },
        to: [
          {
            email: "himanshubkb@gmail.com",
            name: "Test User",
          },
        ],
        subject: "WebFlux Brevo Test",
        htmlContent: `
          <html>
            <body>
              <h2>WebFlux Email Test</h2>
              <p>Congratulations! 🎉</p>
              <p>Your WebFlux backend is successfully connected to Brevo.</p>
            </body>
          </html>
        `,
      }),
    });

    const data = await response.json();

    console.log("Status:", response.status);
    console.log("Response:", data);
  } catch (error) {
    console.error("Error:", error);
  }
};

sendTestEmail();