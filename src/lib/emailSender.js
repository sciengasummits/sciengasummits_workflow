import nodemailer from 'nodemailer';

/**
 * Per-conference email sender.
 * Each conference has its own Gmail account + App Password so OTPs
 * arrive from the matching address (e.g. food@sciengasummits.com).
 *
 * Falls back to the legacy SMTP_USER / SMTP_PASS if a conference-specific
 * password has not been set yet.
 */
export class RealEmailSender {
    constructor() {
        // Legacy / fallback credentials
        this._defaultUser = process.env.SMTP_USER || 'liutex@sciengasummits.com';
        this._defaultPass = (process.env.SMTP_PASS || '').replace(/\s/g, '');

        // Per-conference credential map  { conferenceId → { user, pass } }
        this._accounts = {
            liutex: {
                user: process.env.LIUTEX_SMTP_USER || this._defaultUser,
                pass: (process.env.LIUTEX_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            foodagri: {
                user: process.env.FOODAGRI_SMTP_USER || this._defaultUser,
                pass: (process.env.FOODAGRI_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            fluid: {
                user: process.env.FLUID_SMTP_USER || this._defaultUser,
                pass: (process.env.FLUID_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            renewable: {
                user: process.env.RENEWABLE_SMTP_USER || this._defaultUser,
                pass: (process.env.RENEWABLE_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            cyber: {
                user: process.env.CYBER_SMTP_USER || this._defaultUser,
                pass: (process.env.CYBER_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            powereng: {
                user: process.env.POWERENG_SMTP_USER || this._defaultUser,
                pass: (process.env.POWERENG_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            iqce2027: {
                user: process.env.IQCE2027_SMTP_USER || process.env.IQCES_SMTP_USER || this._defaultUser,
                pass: (process.env.IQCE2027_SMTP_PASS || process.env.IQCES_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            icogwh: {
                user: process.env.ICOGWH_SMTP_USER || this._defaultUser,
                pass: (process.env.ICOGWH_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            icemmae2027: {
                user: process.env.ICEMMAE_SMTP_USER || this._defaultUser,
                pass: (process.env.ICEMMAE_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            polymat: {
                user: process.env.POLYMAT_SMTP_USER || this._defaultUser,
                pass: (process.env.POLYMAT_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            advancenano: {
                user: process.env.ADVANCENANO_SMTP_USER || 'advancenanosummit@sciengasummits.com',
                pass: process.env.ADVANCENANO_SMTP_PASS || 'REPLACE_WITH_APP_PASSWORD',
            },
            opticphoton: {
                user: process.env.OPTIC_SMTP_USER || 'opticphotosummit@sciengasummits.com',
                pass: process.env.OPTIC_SMTP_PASS || 'REPLACE_WITH_APP_PASSWORD',
            },
            cropscieng: {
                user: process.env.CROPSCIENG_SMTP_USER || 'cropsciengasummits@sciengasummits.com',
                pass: process.env.CROPSCIENG_SMTP_PASS || 'REPLACE_WITH_APP_PASSWORD',
            },
            cleaneng: {
                user: process.env.CLEANENG_SMTP_USER || 'cleanengtech@sciengasummits.com',
                pass: process.env.CLEANENG_SMTP_PASS || 'REPLACE_WITH_APP_PASSWORD',
            },
            astrospace: {
                user: process.env.ASTRO_SMTP_USER || this._defaultUser,
                pass: (process.env.ASTRO_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
            condensedphys: {
                user: process.env.CONDENSEDPHYS_SMTP_USER || this._defaultUser,
                pass: (process.env.CONDENSEDPHYS_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
        };

        // Build one transporter per conference account
        this._transporters = {};
        for (const [confId, creds] of Object.entries(this._accounts)) {
            // If the password is a placeholder or empty, fall back to liutex at send time
            if (!creds.pass || creds.pass.startsWith('REPLACE_WITH')) {
                console.warn(`⚠️   No valid SMTP password for "${confId}" — will fall back to liutex sender`);
                continue;
            }

            this._transporters[confId] = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: creds.user, pass: creds.pass },
                tls: { rejectUnauthorized: false },
            });
        }

        // Always build a default/fallback transporter (liutex)
        this._defaultTransporter = this._transporters['liutex'] || nodemailer.createTransport({
            service: 'gmail',
            auth: { user: this._defaultUser, pass: this._defaultPass },
            tls: { rejectUnauthorized: false },
        });

        // Backward-compat: keep .user / .pass / .transporter so nothing else breaks
        this.user = this._defaultUser;
        this.pass = this._defaultPass;
        this.transporter = this._defaultTransporter;
    }

    /**
     * Send an email using the conference-specific sender when available.
     * @param {string} to            - Recipient address
     * @param {string} subject       - Email subject
     * @param {string} htmlContent   - HTML body
     * @param {string} otp           - OTP value (also sent as plain-text)
     * @param {string} [conferenceId] - Optional: 'liutex' | 'foodagri' | 'fluid' | 'renewable'
     */
    async sendEmail(to, subject, htmlContent, otp, conferenceId) {
        // Pick the right transporter
        const transporter = (conferenceId && this._transporters[conferenceId])
            ? this._transporters[conferenceId]
            : this._defaultTransporter;

        const fromUser = (conferenceId && this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user
            : this.user;

        try {
            console.log(`📧 Attempting Gmail send → from: ${fromUser}  to: ${to}`);

            const info = await transporter.sendMail({
                from: `"Conference Management System" <${fromUser}>`,
                to,
                subject,
                html: htmlContent,
                text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
            });

            console.log(`✅ Email sent! Message ID: ${info.messageId}`);
            console.log(`📧 OTP delivered: ${otp}`);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error(`❌ Nodemailer Gmail error:`, error.message);
            return { success: false, error: error.message };
        }
    }

    /**
     * Send a registration confirmation / payment success notification to the
     * conference admin inbox (liutex@sciengasummits.com).
     *
     * @param {object} reg  - Mongoose Registration document (plain object or doc)
     * @param {object} [paymentIds] - { razorpay_order_id, razorpay_payment_id }
     */
    async sendRegistrationConfirmation(reg, paymentIds = {}) {
        const adminEmail = process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com';
        const conferenceId = 'liutex';

        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user
            : this.user;

        // —— Derive display values —————————————————————————————————
        const registrantName  = reg.name  || 'N/A';
        const registrantEmail = reg.email || 'N/A';
        const phone           = reg.phone || 'N/A';
        const country         = reg.country || 'N/A';
        const affiliation     = reg.affiliation || reg.company || 'N/A';
        const address         = reg.address || 'N/A';
        const category        = reg.category || reg.registrationCategory || 'N/A';
        const sponsorship     = reg.sponsorship || '—';
        const accommodation   = reg.accommodation || '—';
        const accompanying    = reg.accompanyingPerson ? 'Yes' : 'No';
        const totalAmount     = reg.totalAmount || reg.amount || 0;
        const coupon          = reg.coupon || '—';
        const paymentId       = paymentIds.razorpay_payment_id || reg.paymentId || reg.razorpayPaymentId || 'N/A';
        const orderId         = paymentIds.razorpay_order_id  || reg.orderId  || reg.razorpayOrderId  || 'N/A';
        const registrationId  = reg._id ? String(reg._id) : 'N/A';
        const submittedAt     = reg.createdAt
            ? new Date(reg.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' })
            : new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata', dateStyle: 'full', timeStyle: 'short' });

        const descriptionRows = (reg.description || '')
            .split('\n')
            .filter(Boolean)
            .map(line => `<tr><td colspan="2" style="padding:4px 12px;color:#374151;font-size:13px;">• ${line}</td></tr>`)
            .join('');

        // —— HTML template ——————————————————————————————————————
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>New Registration – LIUTEX Summit 2026</title>
</head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#1e3a8a 0%,#2563eb 100%);padding:32px 36px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:0.5px;">
              ✅ New Registration Confirmed
            </h1>
            <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px;">
              LIUTEX Vortex Summit 2026 · Payment Successful
            </p>
          </td>
        </tr>

        <!-- Success Banner -->
        <tr>
          <td style="background:#ecfdf5;border-bottom:2px solid #6ee7b7;padding:16px 36px;text-align:center;">
            <p style="margin:0;color:#065f46;font-size:15px;font-weight:600;">
              🎉 Payment verified &amp; registration is now <strong>PAID</strong>
            </p>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:28px 36px;">

            <!-- Registrant Details -->
            <h2 style="margin:0 0 14px;font-size:15px;color:#1e3a8a;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #dbeafe;padding-bottom:6px;">
              👤 Registrant Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;width:40%;">Full Name</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${registrantName}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Email</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;"><a href="mailto:${registrantEmail}" style="color:#2563eb;">${registrantEmail}</a></td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Phone</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${phone}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Country</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${country}</td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Affiliation</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${affiliation}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Address</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${address}</td>
              </tr>
            </table>

            <!-- Registration Details -->
            <h2 style="margin:0 0 14px;font-size:15px;color:#1e3a8a;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #dbeafe;padding-bottom:6px;">
              📋 Registration Details
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;width:40%;">Category</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;font-weight:600;">${category}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Sponsorship</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${sponsorship}</td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Accommodation</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${accommodation}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Accompanying Person</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${accompanying}</td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Discount Coupon</td>
                <td style="padding:8px 12px;color:#111827;font-size:14px;">${coupon}</td>
              </tr>
              ${descriptionRows ? `
              <tr>
                <td colspan="2" style="padding:4px 12px;font-weight:600;color:#6b7280;font-size:13px;">Breakdown</td>
              </tr>
              ${descriptionRows}` : ''}
            </table>

            <!-- Payment Summary -->
            <h2 style="margin:0 0 14px;font-size:15px;color:#1e3a8a;text-transform:uppercase;letter-spacing:0.8px;border-bottom:2px solid #dbeafe;padding-bottom:6px;">
              💳 Payment Summary
            </h2>
            <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;margin-bottom:24px;">
              <tr style="background:#f0fdf4;">
                <td style="padding:12px;font-weight:700;color:#065f46;font-size:15px;width:40%;">Total Amount Paid</td>
                <td style="padding:12px;color:#065f46;font-size:18px;font-weight:800;">$${totalAmount} USD</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Payment Status</td>
                <td style="padding:8px 12px;"><span style="background:#d1fae5;color:#065f46;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">✅ PAID</span></td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Razorpay Payment ID</td>
                <td style="padding:8px 12px;color:#111827;font-size:13px;font-family:monospace;">${paymentId}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Razorpay Order ID</td>
                <td style="padding:8px 12px;color:#111827;font-size:13px;font-family:monospace;">${orderId}</td>
              </tr>
              <tr style="background:#f8faff;">
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Registration ID</td>
                <td style="padding:8px 12px;color:#111827;font-size:13px;font-family:monospace;">${registrationId}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:600;color:#6b7280;font-size:13px;">Submitted At</td>
                <td style="padding:8px 12px;color:#111827;font-size:13px;">${submittedAt} IST</td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f8faff;border-top:1px solid #e5e7eb;padding:20px 36px;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">
              This is an automated notification from the LIUTEX Vortex Summit 2026 registration system.<br/>
              © 2026 SciEnga Summits · <a href="mailto:liutex@sciengasummits.com" style="color:#2563eb;">liutex@sciengasummits.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

        const subject = `🎉 New Registration: ${registrantName} · $${totalAmount} USD · LIUTEX Summit 2026`;

        try {
            const info = await transporter.sendMail({
                from: `"LIUTEX Summit 2026" <${fromUser}>`,
                to: adminEmail,
                subject,
                html,
                text: `New Registration Confirmed\n\nName: ${registrantName}\nEmail: ${registrantEmail}\nPhone: ${phone}\nCountry: ${country}\nCategory: ${category}\nTotal Amount: $${totalAmount} USD\nPayment ID: ${paymentId}\nOrder ID: ${orderId}\nRegistration ID: ${registrationId}`,
            });
            console.log(`✅ Registration confirmation email sent to ${adminEmail} — MsgID: ${info.messageId}`);
            return { success: true, messageId: info.messageId };
        } catch (err) {
            console.error(`❌ Failed to send registration confirmation email:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Send a "Program Schedule Requested" details to the admin.
     * @param {object} payload - { name, email, number, conferenceId }
     */
    async sendProgramRequestToAdmin({ name, email, number, conferenceId = 'liutex' }) {
        const adminEmail = conferenceId === 'liutex' ? (process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com') : this.user;
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this.user;
            
        const subject = `📢 Program Schedule Requested by ${name} - ${conferenceId.toUpperCase()}`;
        const html = `
            <div style="font-family: Arial, sans-serif; background: #f3f4f6; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; padding: 30px; border-radius: 8px;">
                    <h2 style="color: #1e3a8a;">New Program Schedule Request</h2>
                    <p>A user has requested to be notified when the program schedule is released.</p>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${name}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Contact Number:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${number}</td></tr>
                        <tr><td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Conference:</td><td style="padding: 10px; border-bottom: 1px solid #eee;">${conferenceId}</td></tr>
                    </table>
                </div>
            </div>`;
            
        try {
            const info = await transporter.sendMail({
                from: `"System Notification" <${fromUser}>`,
                to: adminEmail,
                subject,
                html,
            });
            console.log(`✅ Admin program request email sent — MsgID: ${info.messageId}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ Admin program request email error:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Send a "Success" confirmation email to the user for program request.
     * @param {object} payload - { name, email, conferenceId }
     */
    async sendProgramRequestToUser({ name, email, conferenceId = 'liutex' }) {
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this.user;
            
        const subject = `Program Schedule Request Received - ${conferenceId.toUpperCase()} Summit 2026`;
        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #1e3a8a;">Hello ${name},</h2>
                <p>Thank you for requesting updates on our Program Schedule.</p>
                <p>We have securely recorded your information and will notify you exactly when the detailed program schedule is released.</p>
                <br />
                <p>Best Regards,</p>
                <p>The ${conferenceId.toUpperCase()} Summit Organizing Committee</p>
            </div>`;
            
        try {
            const info = await transporter.sendMail({
                from: `"Conference Team" <${fromUser}>`,
                to: email,
                subject,
                html,
            });
            console.log(`✅ User program request email sent to ${email} — MsgID: ${info.messageId}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ User program request email error:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Send a "Subscribe" notification to the admin.
     */
    async sendSubscribeToAdmin({ name, email, phone, conferenceId = 'liutex' }) {
        const adminEmail = conferenceId === 'liutex' ? (process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com') : this.user;
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId]) ? this._accounts[conferenceId].user : this.user;

        const subject = `🔔 New Subscription Request - ${conferenceId.toUpperCase()}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h3>New Subscription Request</h3>
                <p>A user has subscribed to the newsletter/updates.</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Number:</strong> ${phone}</li>
                    <li><strong>Conference:</strong> ${conferenceId}</li>
                </ul>
            </div>`;
        try {
            await transporter.sendMail({ from: `"System" <${fromUser}>`, to: adminEmail, subject, html });
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    }

    /**
     * Send a "Brochure Access" notification to the admin.
     */
    async sendBrochureToAdmin({ name, email, number, conferenceId = 'liutex' }) {
        const adminEmail = conferenceId === 'liutex' ? (process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com') : this.user;
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId]) ? this._accounts[conferenceId].user : this.user;

        const subject = `📄 Brochure Downloaded by ${name} - ${conferenceId.toUpperCase()}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h3>Brochure Access Request</h3>
                <p>A user has filled the form to access the brochure.</p>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Number:</strong> ${number}</li>
                    <li><strong>Conference:</strong> ${conferenceId}</li>
                </ul>
            </div>`;
        try {
            await transporter.sendMail({ from: `"System" <${fromUser}>`, to: adminEmail, subject, html });
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    }

    /**
     * Send a "Contact Us" message to the admin.
     */
    async sendContactToAdmin({ name, email, subject, message, conferenceId = 'liutex' }) {
        const adminEmail = conferenceId === 'liutex' ? (process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com') : this.user;
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId]) ? this._accounts[conferenceId].user : this.user;

        const emailSubject = `✉️ New Contact Message: ${subject} - ${conferenceId.toUpperCase()}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h3>New Contact Us Message</h3>
                <ul>
                    <li><strong>Name:</strong> ${name}</li>
                    <li><strong>Email:</strong> ${email}</li>
                    <li><strong>Subject:</strong> ${subject}</li>
                </ul>
                <div style="margin-top:20px; padding:15px; background:#f9fafb; border-left:4px solid #3b82f6;">
                    <strong>Message:</strong><br/>
                    ${message.replace(/\n/g, '<br/>')}
                </div>
            </div>`;
        try {
            await transporter.sendMail({ from: `"System" <${fromUser}>`, to: adminEmail, subject: emailSubject, html });
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    }

    /**
     * Resolve the admin email for a given conference.
     * Checks env vars in priority order, then falls back to the SMTP user.
     */
    _getAdminEmail(conferenceId) {
        const envMap = {
            liutex:      process.env.LIUTEX_EMAIL,
            foodagri:    process.env.FOODAGRI_EMAIL,
            fluid:       process.env.FLUID_EMAIL,
            renewable:   process.env.RENEWABLE_EMAIL,
            cyber:       process.env.CYBER_EMAIL,
            powereng:    process.env.POWERENG_EMAIL,
            iqce2027:    process.env.IQCE2027_EMAIL || process.env.IQCES_EMAIL,
            icogwh:      process.env.ICOGWH_EMAIL,
            icemmae2027: process.env.ICEMMAE_EMAIL,
            polymat:     process.env.POLYMAT_EMAIL,
            advancenano: process.env.ADVANCENANO_EMAIL,
            opticphoton: process.env.OPTIC_EMAIL,
            cropscieng:  process.env.CROPSCIENG_EMAIL,
            cleaneng:    process.env.CLEANENG_EMAIL,
            astrospace:  process.env.ASTRO_EMAIL,
            condensedphys: process.env.CONDENSEDPHYS_EMAIL,
        };
        return envMap[conferenceId]
            || (this._accounts[conferenceId] && this._accounts[conferenceId].user)
            || this._defaultUser;
    }

    /**
     * Send an "Abstract Submitted" notification to the admin (full details).
     */
    async sendAbstractToAdmin(abstractData, conferenceId = 'liutex') {
        const adminEmail = this._getAdminEmail(conferenceId);
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this._defaultUser;

        const submittedAt = new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true 
        });
        const confName = conferenceId.toUpperCase();

        const CONFERENCE_URLS = {
            liutex:      'https://liutexsummit2026.sciengasummits.com',
            foodagri:    'https://foodagrisummit.sciengasummits.com',
            fluid:       'https://fluidsummit.sciengasummits.com',
            renewable:   'https://renewablesummit.sciengasummits.com',
            cyber:       'https://cyberquantumsummit.com',
            powereng:    'https://powerenergysummit.com',
            iqce2027:    'https://iqce2027.sciengasummits.com',
            icogwh:      'https://icogwh2027.sciengasummits.com',
            icemmae2027: 'https://icemmae2027.sciengasummits.com',
            advancenano: 'https://advancenanosummit2026.sciengasummits.com',
            opticphoton: 'https://opticphotonsummit2026.com',
            cropscieng:  'https://cropsciengsummit2026.sciengasummits.com',
            cleaneng:    'https://cleanengtechsummit2026.sciengasummits.com',
        };

        let absoluteFileUrl = abstractData.fileUrl;
        if (absoluteFileUrl && !absoluteFileUrl.startsWith('http')) {
            const baseUrl = process.env.NODE_ENV === 'development' 
                ? (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5050')
                : (process.env.FRONTEND_URL || CONFERENCE_URLS[conferenceId] || CONFERENCE_URLS.liutex);
            absoluteFileUrl = `${baseUrl.replace(/\/$/, '')}${absoluteFileUrl.startsWith('/') ? '' : '/'}${absoluteFileUrl}`;
        }

        // Robust field extraction
        const safeName = (abstractData.name && String(abstractData.name) !== 'undefined') ? abstractData.name : '—';
        const safeEmail = (abstractData.email && String(abstractData.email) !== 'undefined') ? abstractData.email : '—';
        const safePhone = (abstractData.phone && String(abstractData.phone) !== 'undefined') ? abstractData.phone : '—';
        const safeOrg = (abstractData.organization && String(abstractData.organization) !== 'undefined') ? abstractData.organization : (abstractData.affiliation && String(abstractData.affiliation) !== 'undefined') ? abstractData.affiliation : '—';
        const safeTitle = (abstractData.title && String(abstractData.title) !== 'undefined') ? abstractData.title : '—';
        const safeTopic = (abstractData.topic && String(abstractData.topic) !== 'undefined') ? abstractData.topic : '—';
        const safeCategory = (abstractData.interest && String(abstractData.interest) !== 'undefined') ? abstractData.interest : (abstractData.category && String(abstractData.category) !== 'undefined') ? abstractData.category : '—';

        const subject = `📄 New Abstract Submitted: ${safeName} — ${confName}`;
        
        const html = `<!DOCTYPE html><html><body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff; padding: 20px; color: #000;">
<div style="max-width: 700px; margin: 0 auto;">
  <div style="text-align: center; padding-bottom: 20px;">
    <h2 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">Abstract Submission Confirmation for ${confName}</h2>
    <p style="margin: 10px 0 0; color: #555; font-size: 14px;">Abstract Received for ${confName} conference. Please find the details below</p>
  </div>
  <div style="background-color: #ececec; padding: 30px; border-radius: 4px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; color: #000;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 160px; vertical-align: top;">Name:</td><td style="padding: 8px 0; vertical-align: top;">${safeName}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Abstract Date:</td><td style="padding: 8px 0; vertical-align: top;">${submittedAt}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Email:</td><td style="padding: 8px 0; vertical-align: top;"><a href="mailto:${safeEmail}" style="color: #007bff; text-decoration: underline;">${safeEmail}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Mobile Number:</td><td style="padding: 8px 0; vertical-align: top;">${safePhone}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Organization:</td><td style="padding: 8px 0; vertical-align: top;">${safeOrg}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Country:</td><td style="padding: 8px 0; vertical-align: top;">${abstractData.country || '—'}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Address:</td><td style="padding: 8px 0; vertical-align: top;">${abstractData.address || '—'}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Abstract Title:</td><td style="padding: 8px 0; vertical-align: top;">${safeTitle}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Session:</td><td style="padding: 8px 0; vertical-align: top;">${safeTopic}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Category:</td><td style="padding: 8px 0; vertical-align: top; text-transform: capitalize;">${safeCategory}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Download Abstract:</td><td style="padding: 8px 0; vertical-align: top;">
        ${absoluteFileUrl ? `<a href="${absoluteFileUrl}" style="color: #007bff; text-decoration: underline;" target="_blank">Click Here</a>` : 'Not Provided'}
      </td></tr>
    </table>
  </div>
  <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#9ca3af;font-size:12px;letter-spacing:0.5px;">© 2026 SCIENGASUMMITS. All rights reserved.</p></div>
</div></body></html>`;

        const text = `New Abstract Submitted\n\nName: ${safeName}\nEmail: ${safeEmail}\nPhone: ${safePhone}\nTitle: ${safeTitle}\nOrganization: ${safeOrg}\nCategory: ${safeCategory}\nFile: ${absoluteFileUrl || 'Not Provided'}`;

        try {
            await transporter.sendMail({ from: `"${confName} System" <${fromUser}>`, to: adminEmail, subject, html, text });
            console.log(`✅ Abstract admin email sent to ${adminEmail}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ Abstract admin email error:`, err.message);
            return { success: false, error: err.message };
        }
    }


    /**
     * Send a submission confirmation to the abstract author.
     */
    async sendAbstractConfirmationToUser(abstractData, conferenceId = 'liutex') {
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this._defaultUser;

        const safeName = (abstractData.name && String(abstractData.name) !== 'undefined') ? abstractData.name : 'Author';
        const safeTitle = (abstractData.title && String(abstractData.title) !== 'undefined') ? abstractData.title : '—';
        const confName = conferenceId.toUpperCase();

        const subject = `✅ Abstract Received – ${confName}`;
        const html = `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;background:#f3f4f6;padding:24px;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">
  <div style="background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:28px 32px;">
    <h1 style="margin:0;color:#fff;font-size:20px;">✅ Abstract Received</h1>
    <p style="margin:6px 0 0;color:#bfdbfe;font-size:13px;">${confName}</p>
  </div>
  <div style="padding:28px 32px;">
    <p style="color:#374151;">Dear <strong>${safeName}</strong>,</p>
    <p style="color:#374151;">Thank you for submitting your abstract. We have successfully received it and will review it shortly.</p>
    <div style="background:#f8faff;border:1px solid #dbeafe;border-radius:8px;padding:16px 20px;margin:20px 0;">
      <p style="margin:0 0 6px;font-size:13px;color:#6b7280;">Submitted Title:</p>
      <p style="margin:0;font-size:15px;font-weight:700;color:#1e3a8a;">${safeTitle}</p>
    </div>
    <p style="color:#374151;">You will be notified once your abstract has been reviewed.</p>
    <p style="color:#374151;">Best Regards,<br/><strong>${confName} Organizing Committee</strong></p>
  </div>
</div></body></html>`;

        const text = `Dear ${safeName},\n\nThank you for submitting your abstract: "${safeTitle}". We have successfully received it and will review it shortly.\n\nBest Regards,\n${confName} Organizing Committee`;

        try {
            await transporter.sendMail({ from: `"${confName}" <${fromUser}>`, to: abstractData.email, subject, html, text });
            return { success: true };
        } catch (err) {
            console.error(`❌ Abstract user confirmation error:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Send a professional registration notification to the admin.
     */
    async sendRegistrationToAdmin(regData, conferenceId = 'liutex') {
        const adminEmail = this._getAdminEmail(conferenceId);
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this._defaultUser;

        const submittedAt = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const confName = conferenceId.toUpperCase();

        // Robust field extraction
        const safeName = (regData.name && String(regData.name) !== 'undefined') ? regData.name : '—';
        const safeEmail = (regData.email && String(regData.email) !== 'undefined') ? regData.email : '—';
        const safePhone = (regData.phone && String(regData.phone) !== 'undefined') ? regData.phone : (regData.number && String(regData.number) !== 'undefined') ? regData.number : '—';
        const safeCategory = (regData.category && String(regData.category) !== 'undefined') ? regData.category : (regData.registrationCategory && String(regData.registrationCategory) !== 'undefined') ? regData.registrationCategory : '—';
        const safeAmount = (regData.amount && String(regData.amount) !== 'undefined') ? regData.amount : (regData.totalAmount && String(regData.totalAmount) !== 'undefined') ? regData.totalAmount : '0';
        const safeAffiliation = (regData.affiliation && String(regData.affiliation) !== 'undefined') ? regData.affiliation : (regData.company && String(regData.company) !== 'undefined') ? regData.company : (regData.organization && String(regData.organization) !== 'undefined') ? regData.organization : '—';

        const subject = `📝 New Registration - ${confName}: ${safeName}`;
        
        const html = `<!DOCTYPE html><html><body style="font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; padding: 20px; color: #000;">
<div style="max-width: 700px; margin: 0 auto;">
  <div style="text-align: center; padding-bottom: 20px;">
    <h2 style="margin: 0; color: #000; font-size: 24px; font-weight: bold;">Registration Confirmation for ${confName}</h2>
    <p style="margin: 10px 0 0; color: #555; font-size: 14px;">Registration Received for ${confName} conference. Please find the details below</p>
  </div>
  <div style="background-color: #ececec; padding: 30px; border-radius: 4px;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; font-size: 15px; color: #000;">
      <tr><td style="padding: 8px 0; font-weight: bold; width: 180px; vertical-align: top;">Name:</td><td style="padding: 8px 0; vertical-align: top;">${safeName}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Registration Date:</td><td style="padding: 8px 0; vertical-align: top;">${submittedAt}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Email:</td><td style="padding: 8px 0; vertical-align: top;"><a href="mailto:${safeEmail}" style="color: #007bff; text-decoration: underline;">${safeEmail}</a></td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Phone:</td><td style="padding: 8px 0; vertical-align: top;">${safePhone}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Country:</td><td style="padding: 8px 0; vertical-align: top;">${regData.country || '—'}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Company/Affiliation:</td><td style="padding: 8px 0; vertical-align: top;">${safeAffiliation}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Address:</td><td style="padding: 8px 0; vertical-align: top;">${regData.address || '—'}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Category:</td><td style="padding: 8px 0; vertical-align: top;">${safeCategory}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Conference:</td><td style="padding: 8px 0; vertical-align: top;">${confName}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Registration Counter:</td><td style="padding: 8px 0; vertical-align: top;">#${regData.counter || '—'}</td></tr>
      <tr><td style="padding: 8px 0; font-weight: bold; vertical-align: top;">Payment Description:</td><td style="padding: 8px 0; vertical-align: top;">${safeCategory} : $${safeAmount}</td></tr>
    </table>
  </div>
  <div style="background:#f9fafb;padding:25px;text-align:center;border-top:1px solid #f1f5f9;"><p style="margin:0;color:#9ca3af;font-size:12px;letter-spacing:0.5px;">© 2027 SCIENGASUMMITS. All rights reserved.</p></div>
</div></body></html>`;

        const text = `New Registration Confirmed\n\nName: ${safeName}\nEmail: ${safeEmail}\nPhone: ${safePhone}\nCategory: ${safeCategory}\nAmount: $${safeAmount}\nAffiliation: ${safeAffiliation}`;

        try {
            await transporter.sendMail({ 
                from: `"${confName} Registration" <${fromUser}>`, 
                to: adminEmail, 
                subject, 
                html,
                text 
            });
            console.log(`✅ Registration admin email sent to ${adminEmail}`);
            return { success: true };
        } catch (err) {
            console.error(`❌ Registration admin email error:`, err.message);
            return { success: false, error: err.message };
        }
    }

    /**
     * Send a professional registration confirmation to the participant.
     */
    async sendRegistrationConfirmationToUser(regData, conferenceId = 'liutex') {
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId])
            ? this._accounts[conferenceId].user : this._defaultUser;

        const confName = conferenceId.toUpperCase();
        const subject = `✅ Registration Confirmed — ${confName}`;
        
        const html = `<!DOCTYPE html><html><body style="font-family:'Segoe UI',Arial,sans-serif;background:#f3f4f6;padding:30px;color:#1f2937;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
  <div style="background:linear-gradient(135deg,#059669,#10b981);padding:40px;text-align:center;">
    <div style="background:rgba(255,255,255,0.2);display:inline-block;padding:8px 16px;border-radius:8px;color:#fff;font-size:13px;font-weight:700;margin-bottom:15px;text-transform:uppercase;letter-spacing:1px;">${confName}</div>
    <h1 style="margin:0;color:#fff;font-size:26px;letter-spacing:-0.5px;">Registration Confirmed</h1>
  </div>
  
  <div style="padding:40px;">
    <p style="margin:0 0 20px;font-size:17px;color:#374151;">Dear <strong>${regData.name}</strong>,</p>
    <p style="margin:0 0 25px;font-size:15px;line-height:1.7;color:#4b5563;">
      We are delighted to confirm your registration for the <strong>${confName}</strong>. Your participation has been successfully recorded in our system.
    </p>

    <div style="background:#f0fdf4;border-radius:12px;padding:25px;border:1px solid #d1fae5;margin-bottom:25px;">
      <h3 style="margin:0 0 15px;font-size:13px;color:#065f46;text-transform:uppercase;letter-spacing:1px;">Registration Summary</h3>
      <table width="100%" style="border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#065f46;opacity:0.8;">Category:</td>
          <td style="padding:6px 0;font-size:14px;color:#064e3b;font-weight:700;">${regData.category || regData.registrationCategory || '—'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:14px;color:#065f46;opacity:0.8;">Date:</td>
          <td style="padding:6px 0;font-size:14px;color:#064e3b;font-weight:600;">${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
        </tr>
      </table>
    </div>

    <p style="margin:0 0 25px;font-size:15px;line-height:1.7;color:#4b5563;">
      You will receive further updates regarding the conference schedule, venue details, and speaker announcements as we get closer to the event dates.
    </p>

    <div style="border-top:1px solid #e5e7eb;padding-top:25px;margin-top:10px;">
      <p style="margin:0;font-size:14px;color:#6b7280;">Warm Regards,</p>
      <p style="margin:5px 0 0;font-size:16px;font-weight:700;color:#065f46;">${confName} Organizing Committee</p>
    </div>
  </div>
  
  <div style="background:#f9fafb;padding:20px;text-align:center;border-top:1px solid #f3f4f6;">
    <p style="margin:0;color:#9ca3af;font-size:12px;">This is an automated confirmation of your conference registration.</p>
  </div>
</div></body></html>`;

        try {
            await transporter.sendMail({ from: `"${confName} Registration" <${fromUser}>`, to: regData.email, subject, html });
            return { success: true };
        } catch (err) {
            console.error(`❌ Registration user confirmation error:`, err.message);
            return { success: false, error: err.message };
        }
    }
}
