import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registration from '@/models/Registration';
import { requireAuth } from '@/lib/auth';
import { RealEmailSender } from '@/lib/emailSender';

const realEmailSender = new RealEmailSender();

// GET — Admin reads all registrations (requires auth - contains personal data)
export async function GET(request) {
    // ── Admin only: require authentication ──
    const auth = requireAuth(request);
    if (auth.error) return auth.error;

    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const conf = searchParams.get('conference') || 'liutex';
        const regs = await Registration.find({ conference: conf }).sort({ createdAt: -1 });
        return NextResponse.json(regs);
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}

// POST — Public registration submission (no auth required - from website)
export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        // Sanitize: only allow known registration fields
        const allowed = [
            // identity
            'conference', 'title', 'name', 'email', 'phone',
            // personal details
            'affiliation', 'country', 'address',
            // registration details
            'category', 'packageType', 'sponsorship', 'accommodation',
            'accompanyingPerson', 'description',
            // payment
            'amount', 'currency', 'coupon', 'discountPercentage', 'finalAmount',
            'status', 'paymentMethod',
            // razorpay
            'razorpayOrderId', 'razorpayPaymentId',
        ];
        const sanitized = {};
        for (const key of allowed) {
            if (body[key] !== undefined) sanitized[key] = body[key];
        }
        const reg = new Registration(sanitized);
        await reg.save();

        const conferenceId = sanitized.conference || 'liutex';
        
        // Add registration counter
        const registrationCount = await Registration.countDocuments({ conference: conferenceId });
        sanitized.counter = registrationCount;

        // Notify admin with full registration + payment details
        try {
            await realEmailSender.sendRegistrationToAdmin(sanitized, conferenceId);
        } catch (emailErr) {
            console.error('[Registration] Failed to send admin email:', emailErr);
        }

        // Send confirmation to registrant
        try {
            await realEmailSender.sendRegistrationConfirmationToUser(sanitized, conferenceId);
        } catch (emailErr) {
            console.error('[Registration] Failed to send user confirmation email:', emailErr);
        }

        return NextResponse.json(reg, { status: 201 });
    } catch (err) {
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
