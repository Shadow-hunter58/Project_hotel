import { supabase } from "@/integrations/supabase/client";

export type AvailabilityRow = {
  room_type_id: string;
  slug: string;
  name: string;
  capacity: number;
  price_per_night: number;
  total_units: number;
  units_available: number;
};

export type BookingResult = {
  reference: string;
  estimated_total: number;
  status: string;
};

export type BookingLookup = {
  reference: string;
  guest_name: string;
  room_name: string;
  check_in: string;
  check_out: string;
  rooms: number;
  adults: number;
  children: number;
  estimated_total: number;
  status: string;
  payment_status: string;
};

export async function fetchAvailability(checkIn: string, checkOut: string) {
  const { data, error } = await supabase.rpc("get_availability", {
    _check_in: checkIn,
    _check_out: checkOut,
  });
  if (error) throw new Error(error.message);
  return (data ?? []) as AvailabilityRow[];
}

export async function createBooking(input: {
  roomTypeId: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | undefined;
  checkIn: string;
  checkOut: string;
  adults: number;
  children: number;
  rooms: number;
  notes?: string | undefined;
}) {
  const { data, error } = await supabase.rpc("create_booking", {
    _room_type_id: input.roomTypeId,
    _guest_name: input.guestName,
    _guest_phone: input.guestPhone,
    _guest_email: input.guestEmail ?? "",
    _check_in: input.checkIn,
    _check_out: input.checkOut,
    _adults: input.adults,
    _children: input.children,
    _rooms: input.rooms,
    _notes: input.notes ?? "",
  });
  if (error) throw new Error(error.message);
  const row = (data as BookingResult[] | null)?.[0];
  if (!row) throw new Error("Booking could not be created. Please try again.");
  return row;
}

export async function lookupBooking(reference: string, phone: string) {
  const { data, error } = await supabase.rpc("lookup_booking", {
    _reference: reference,
    _guest_phone: phone,
  });
  if (error) throw new Error(error.message);
  return ((data as BookingLookup[] | null) ?? [])[0] ?? null;
}

export async function recordPayment(reference: string, phone: string, paymentReference: string) {
  const { data, error } = await supabase.rpc("record_payment", {
    _reference: reference,
    _guest_phone: phone,
    _payment_reference: paymentReference,
  });
  if (error) throw new Error(error.message);
  return (data as { reference: string; payment_status: string }[] | null)?.[0] ?? null;
}

export const nightsBetween = (checkIn: string, checkOut: string) =>
  Math.max(
    1,
    Math.round(
      (new Date(`${checkOut}T00:00:00`).getTime() - new Date(`${checkIn}T00:00:00`).getTime()) /
        86400000,
    ),
  );

export type ReceiptDetails = {
  reference: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string | undefined;
  roomName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  adults: number;
  children: number;
  totalTariff: number;
  paymentStatus?: string | undefined;
  advancePaid?: number | undefined;
  amenities?: string[] | undefined;
};

export function formatReceiptText(details: ReceiptDetails): string {
  const lines = [
    `🏨 *HOTEL RATNA FOREVER, NITTE*`,
    `*Booking Confirmation & Stay Receipt*`,
    `----------------------------------------`,
    `📌 *Booking Reference:* ${details.reference}`,
    `👤 *Guest Name:* ${details.guestName}`,
    `📞 *Guest Contact:* ${details.guestPhone}`,
    ...(details.guestEmail ? [`✉️ *Email:* ${details.guestEmail}`] : []),
    ``,
    `🛏️ *Room Details:*`,
    `• Category: ${details.roomName}`,
    `• Inclusions: Split AC, 24-hr Hot Water, Wi-Fi, Breakfast Included`,
    ...(details.amenities && details.amenities.length > 0
      ? [`• Amenities: ${details.amenities.join(", ")}`]
      : []),
    ``,
    `📅 *Stay Schedule:*`,
    `• Check-in: ${details.checkIn} (From 12:00 PM)`,
    `• Check-out: ${details.checkOut} (Until 11:00 AM)`,
    `• Duration: ${details.nights} ${details.nights === 1 ? "Night" : "Nights"}`,
    `• Occupancy: ${details.adults} ${details.adults === 1 ? "Adult" : "Adults"}${
      details.children > 0 ? `, ${details.children} Child` : ""
    }`,
    ``,
    `💰 *Billing & Tariff Details:*`,
    `• Estimated Tariff: INR ${details.totalTariff.toLocaleString("en-IN")}`,
    `• Payment Status: ${details.paymentStatus ?? "Confirmed at Front Desk"}`,
    ...(details.advancePaid && details.advancePaid > 0
      ? [
          `• Advance Recorded: INR ${details.advancePaid.toLocaleString("en-IN")}`,
          `• Balance Due at Check-in: INR ${Math.max(
            0,
            details.totalTariff - details.advancePaid,
          ).toLocaleString("en-IN")}`,
        ]
      : []),
    ``,
    `📍 *Hotel Address:*`,
    `Hotel Ratna Forever, Main Road, Nitte, Karkala Taluk, Udupi Dist, Karnataka 574110`,
    `📞 Front Desk: +91 73380 88744`,
    `----------------------------------------`,
    `_Thank you for choosing Hotel Ratna Forever! Please present this booking reference at reception._`,
  ];
  return lines.join("\n");
}

export function formatSmsText(details: ReceiptDetails): string {
  return `HOTEL RATNA FOREVER, NITTE
Booking Confirmed!
Ref: ${details.reference}
Guest: ${details.guestName}
Room: ${details.roomName}
Check-in: ${details.checkIn} (12 PM)
Check-out: ${details.checkOut} (11 AM)
Nights: ${details.nights} | Total: INR ${details.totalTariff.toLocaleString("en-IN")}
Status: ${details.paymentStatus ?? "Confirmed at Front Desk"}
Address: Main Rd, Nitte, Karkala Taluk
Front Desk: +91 73380 88744`;
}


