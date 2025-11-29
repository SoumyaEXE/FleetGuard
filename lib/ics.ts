/**
 * Generate an ICS (iCalendar) format string for a vehicle repair event
 */
export function generateRepairICS(options: {
  uid: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  attendees: string[]; // list of email addresses
}): string {
  const { uid, title, description, start, end, attendees } = options;

  // Format date to ICS format: YYYYMMDDTHHmmssZ
  const formatICSDate = (date: Date): string => {
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(date.getUTCSeconds()).padStart(2, '0');
    return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
  };

  // Escape newlines in description for ICS format
  const escapeDescription = (text: string): string => {
    return text.replace(/\n/g, '\\n').replace(/,/g, '\\,');
  };

  // Current timestamp for DTSTAMP
  const now = new Date();
  const dtstamp = formatICSDate(now);

  // Build attendee lines
  const attendeeLines = attendees.map(
    (email) => `ATTENDEE;CN=${email};RSVP=TRUE:MAILTO:${email}`
  );

  // Build ICS content
  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//FleetGuard//VehicleRepair//EN',
    'METHOD:REQUEST',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${formatICSDate(start)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${title}`,
    description ? `DESCRIPTION:${escapeDescription(description)}` : '',
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'PRIORITY:5',
    ...attendeeLines,
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Reminder: Vehicle repair scheduled tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  // Filter out empty lines and join with CRLF
  return icsLines.filter((line) => line).join('\r\n');
}

/**
 * Helper to create repair date at 10:00 AM on a given date
 */
export function createRepairDateTime(dateString: string): { start: Date; end: Date } {
  // Parse YYYY-MM-DD
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create start time at 10:00 UTC
  const start = new Date(Date.UTC(year, month - 1, day, 10, 0, 0));
  
  // End time is 1 hour later (11:00 UTC)
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  
  return { start, end };
}
