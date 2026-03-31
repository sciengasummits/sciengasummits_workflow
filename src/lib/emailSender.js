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
            iqces2026: {
                user: process.env.IQCES_SMTP_USER || this._defaultUser,
                pass: (process.env.IQCES_SMTP_PASS || this._defaultPass).replace(/\s/g, ''),
            },
        };

        // Build one transporter per conference account
        this._transporters = {};
        for (const [confId, creds] of Object.entries(this._accounts)) {
            // If the password is a placeholder or empty, fall back to liutex at send time
            if (!creds.pass || creds.pass.startsWith('REPLACE_WITH')) {
                console.warn(`⚠️  No valid SMTP password for "${confId}" — will fall back to liutex sender`);
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

        // ── Derive display values ──────────────────────────────────
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

        // ── HTML template ──────────────────────────────────────────
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
     * Send an "Abstract Submitted" notification to the admin.
     */
    async sendAbstractToAdmin(abstractData, conferenceId = 'liutex') {
        const adminEmail = conferenceId === 'liutex' ? (process.env.LIUTEX_EMAIL || 'liutex@sciengasummits.com') : this.user;
        const transporter = this._transporters[conferenceId] || this._defaultTransporter;
        const fromUser = (this._accounts[conferenceId] && this._transporters[conferenceId]) ? this._accounts[conferenceId].user : this.user;

        const subject = `📝 New Abstract Submitted by ${abstractData.name || 'Unknown'} - ${conferenceId.toUpperCase()}`;
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px;">
                <h3>New Abstract Submission</h3>
                <p>A new abstract has been submitted to the system.</p>
                <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Name:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.name || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Email:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.email || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Affiliation:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.affiliation || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Title:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.title || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Category:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.category || 'N/A'}</td></tr>
                    <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Topic:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${abstractData.topic || 'N/A'}</td></tr>
                </table>
            </div>`;
        try {
            await transporter.sendMail({ from: `"System" <${fromUser}>`, to: adminEmail, subject, html });
            return { success: true };
        } catch (err) { return { success: false, error: err.message }; }
    }
}


