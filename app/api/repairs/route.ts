import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { appendRepairToCSV } from '@/lib/csv';
import { generateRepairICS, createRepairDateTime } from '@/lib/ics';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const {
      vehicleId,
      driverEmail,
      managerEmail,
      damageLevel,
      repairDate,
      reportDetails,
      inspectionId,
    } = body;

    // Validate required fields
    if (!vehicleId || !driverEmail || !repairDate) {
      return NextResponse.json(
        { error: 'Missing required fields: vehicleId, driverEmail, repairDate' },
        { status: 400 }
      );
    }

    // Validate damage level
    const validLevels = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    if (!validLevels.includes(damageLevel)) {
      return NextResponse.json(
        { error: 'Invalid damageLevel. Must be one of: LOW, MEDIUM, HIGH, CRITICAL' },
        { status: 400 }
      );
    }

    // Generate unique ID
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const status = 'pending';

    // Save to CSV
    await appendRepairToCSV({
      id,
      vehicleId,
      damageLevel,
      repairDate,
      createdAt,
      driverEmail,
      managerEmail,
      status,
      inspectionId,
    });

    // Generate calendar invite
    const { start, end } = createRepairDateTime(repairDate);
    const timestamp = Date.now();
    const uid = `repair-${vehicleId}-${timestamp}@fleetguard`;
    
    const attendees = [driverEmail];
    if (managerEmail) {
      attendees.push(managerEmail);
    }

    const description = reportDetails 
      ? `Vehicle: ${vehicleId}\nDamage Level: ${damageLevel}\n\nDetails:\n${reportDetails}`
      : `Vehicle: ${vehicleId}\nDamage Level: ${damageLevel}`;

    const icsContent = generateRepairICS({
      uid,
      title: `Repair – ${vehicleId} (${damageLevel})`,
      description,
      start,
      end,
      attendees,
    });

    // Send email with calendar invite
    await sendRepairEmail({
      to: attendees,
      vehicleId,
      damageLevel,
      repairDate,
      icsContent,
    });

    return NextResponse.json({
      success: true,
      id,
      message: 'Repair scheduled and calendar invite sent',
    });
  } catch (error) {
    console.error('Error creating repair:', error);
    return NextResponse.json(
      { error: 'Failed to create repair', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * Send email with calendar invite using nodemailer
 */
async function sendRepairEmail(options: {
  to: string[];
  vehicleId: string;
  damageLevel: string;
  repairDate: string;
  icsContent: string;
}) {
  const { to, vehicleId, damageLevel, repairDate, icsContent } = options;

  // Check for required environment variables
  const mailUser = process.env.MAIL_USER;
  const mailPassword = process.env.MAIL_APP_PASSWORD;

  if (!mailUser || !mailPassword) {
    throw new Error('Email credentials not configured. Please set MAIL_USER and MAIL_APP_PASSWORD in .env.local');
  }

  // Create transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: mailUser,
      pass: mailPassword,
    },
  });

  // Email subject and body
  const subject = `Vehicle Repair Scheduled: ${vehicleId}`;
  const text = `
FleetGuard - Repair Scheduled

Vehicle: ${vehicleId}
Damage Level: ${damageLevel}
Scheduled Date: ${repairDate}

A calendar invite has been attached to this email. Please accept the invite to add the repair appointment to your calendar.

You will receive a reminder 24 hours before the scheduled repair time.

Thank you for using FleetGuard!
  `.trim();

  const html = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #3b82f6; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 20px; border: 1px solid #e2e8f0; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-weight: bold; margin: 10px 0; }
    .badge-critical { background: #ef4444; color: white; }
    .badge-high { background: #f59e0b; color: white; }
    .badge-medium { background: #eab308; color: white; }
    .badge-low { background: #10b981; color: white; }
    .info { background: white; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .footer { text-align: center; padding: 20px; color: #64748b; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">🚗 FleetGuard - Repair Scheduled</h2>
    </div>
    <div class="content">
      <p>A vehicle repair has been scheduled in FleetGuard.</p>
      
      <div class="info">
        <p><strong>Vehicle:</strong> ${vehicleId}</p>
        <p><strong>Damage Level:</strong> <span class="badge badge-${damageLevel.toLowerCase()}">${damageLevel}</span></p>
        <p><strong>Scheduled Date:</strong> ${repairDate}</p>
      </div>
      
      <p>📅 <strong>A calendar invite has been attached to this email.</strong> Please accept the invite to add the repair appointment to your calendar.</p>
      
      <p>⏰ You will receive a reminder 24 hours before the scheduled repair time.</p>
    </div>
    <div class="footer">
      <p>Thank you for using FleetGuard</p>
      <p>© 2025 FleetGuard Inc. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;

  // Send email with ICS attachment
  await transporter.sendMail({
    from: `"Fleet Guard" <${mailUser}>`,
    to: to.join(', '),
    subject,
    text,
    html,
    alternatives: [
      {
        contentType: 'text/calendar; method=REQUEST; charset="UTF-8"',
        content: Buffer.from(icsContent),
      },
    ],
  });
}
