// src/lib/email.js
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendPasswordResetEmail({ to, name, resetUrl }) {
  try {
    const result = await resend.emails.send({
      from:    'Komor-IA <noreply@komor-ia.com>',
      to,
      subject: 'Réinitialisation de votre mot de passe — Komor-IA',
      html: `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#0f172a;padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:600;letter-spacing:-0.5px;">Komor-IA</h1>
            <p style="margin:4px 0 0;color:#94a3b8;font-size:13px;">AI Platform</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#0f172a;font-size:20px;font-weight:600;">
              Réinitialisation de mot de passe
            </h2>
            <p style="margin:0 0 12px;color:#475569;font-size:15px;line-height:1.6;">
              Bonjour ${name || 'Utilisateur'},
            </p>
            <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.6;">
              Vous avez demandé la réinitialisation de votre mot de passe.
              Cliquez sur le bouton ci-dessous pour en choisir un nouveau.
              Ce lien est valable <strong>1 heure</strong>.
            </p>
            <!-- Bouton -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
              <tr>
                <td style="background:#0f172a;border-radius:10px;">
                  <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">
                    Réinitialiser mon mot de passe →
                  </a>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 8px;color:#94a3b8;font-size:13px;line-height:1.6;">
              Si vous n'avez pas fait cette demande, ignorez cet email —
              votre mot de passe ne sera pas modifié.
            </p>
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              Lien valable jusqu'à : <strong>${new Date(Date.now() + 3600000).toLocaleString('fr-FR')}</strong>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f8fafc;padding:20px 40px;border-top:1px solid #e2e8f0;text-align:center;">
            <p style="margin:0;color:#94a3b8;font-size:12px;">
              © ${new Date().getFullYear()} Komor-IA · Moroni, Comores<br/>
              <a href="https://www.komor-ia.com" style="color:#64748b;text-decoration:none;">www.komor-ia.com</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
    })

    console.log('✅ Email envoyé:', JSON.stringify(result))
    return result
  } catch (error) {
    console.error('❌ Erreur Resend:', error)
    throw error
  }
}