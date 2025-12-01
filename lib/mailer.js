import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify?token=${token}`;

  const mailOptions = {
    from: `"App Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Confirmez votre adresse email",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; background:#f9f9f9;">
        <div style="max-width: 600px; margin: auto; background:white; padding: 30px; border-radius: 10px;">
          
          <h2 style="color:#333;">Bienvenue sur Rotten tomatoes</h2>

          <p style="font-size: 16px; color:#555;">
            Merci de vous être inscrit !  
            Cliquez sur le bouton ci-dessous pour vérifier votre compte :
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}"
              style="
                background: #4a90e2;
                padding: 12px 25px;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                font-size: 16px;
                font-weight: bold;
                display: inline-block;
              "
              target="_blank"
            >
              Vérifier mon compte
            </a>
          </div>

          <p style="font-size: 14px; color:#777;">
            Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :
          </p>

          <p style="font-size: 14px; color:#4a90e2; word-break:break-all;">
            ${verificationUrl}
          </p>

          <p style="font-size: 12px; color:#999; margin-top: 30px;">
            Ce lien expirera dans 24 heures pour des raisons de sécurité.
          </p>

        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
