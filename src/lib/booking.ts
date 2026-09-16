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
