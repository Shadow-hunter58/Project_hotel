-- Room types (public catalogue with real inventory counts)
CREATE TABLE public.room_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  beds text NOT NULL DEFAULT '',
  capacity integer NOT NULL DEFAULT 2,
  price_per_night integer NOT NULL,
  total_units integer NOT NULL DEFAULT 1,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.room_types TO anon, authenticated;
GRANT ALL ON public.room_types TO service_role;
ALTER TABLE public.room_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Room types are publicly readable"
  ON public.room_types FOR SELECT
  TO anon, authenticated
  USING (active);

-- Reservations
CREATE TABLE public.bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reference text NOT NULL UNIQUE DEFAULT 'RF-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6)),
  room_type_id uuid NOT NULL REFERENCES public.room_types(id),
  guest_name text NOT NULL,
  guest_phone text NOT NULL,
  guest_email text,
  check_in date NOT NULL,
  check_out date NOT NULL,
  adults integer NOT NULL DEFAULT 2,
  children integer NOT NULL DEFAULT 0,
  rooms integer NOT NULL DEFAULT 1,
  notes text,
  estimated_total integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_status text NOT NULL DEFAULT 'unpaid',
  payment_reference text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT bookings_dates_valid CHECK (check_out > check_in),
  CONSTRAINT bookings_rooms_positive CHECK (rooms > 0 AND rooms <= 10),
  CONSTRAINT bookings_status_valid CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  CONSTRAINT bookings_payment_status_valid CHECK (payment_status IN ('unpaid', 'advance_paid', 'paid'))
);

CREATE INDEX bookings_dates_idx ON public.bookings (check_in, check_out);
CREATE INDEX bookings_room_type_idx ON public.bookings (room_type_id);

GRANT ALL ON public.bookings TO service_role;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
-- No anon/authenticated policies: guest data is written and read only through
-- security-definer functions below, so reservations are never publicly listable.

-- Availability: units left per room type for a date range
CREATE OR REPLACE FUNCTION public.get_availability(_check_in date, _check_out date)
RETURNS TABLE (
  room_type_id uuid,
  slug text,
  name text,
  capacity integer,
  price_per_night integer,
  total_units integer,
  units_available integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    rt.id,
    rt.slug,
    rt.name,
    rt.capacity,
    rt.price_per_night,
    rt.total_units,
    GREATEST(
      0,
      rt.total_units - COALESCE((
        SELECT SUM(b.rooms)
        FROM public.bookings b
        WHERE b.room_type_id = rt.id
          AND b.status <> 'cancelled'
          AND b.check_in < _check_out
          AND b.check_out > _check_in
      ), 0)
    )::integer
  FROM public.room_types rt
  WHERE rt.active
  ORDER BY rt.sort_order, rt.name;
$$;

GRANT EXECUTE ON FUNCTION public.get_availability(date, date) TO anon, authenticated;

-- Create a booking, re-checking availability inside the database
CREATE OR REPLACE FUNCTION public.create_booking(
  _room_type_id uuid,
  _guest_name text,
  _guest_phone text,
  _guest_email text,
  _check_in date,
  _check_out date,
  _adults integer,
  _children integer,
  _rooms integer,
  _notes text
)
RETURNS TABLE (reference text, estimated_total integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rt public.room_types;
  taken integer;
  nights integer;
  total integer;
  new_row public.bookings;
BEGIN
  IF length(btrim(coalesce(_guest_name, ''))) < 2 THEN
    RAISE EXCEPTION 'Please enter the guest name';
  END IF;
  IF length(regexp_replace(coalesce(_guest_phone, ''), '\D', '', 'g')) < 10 THEN
    RAISE EXCEPTION 'Please enter a valid phone number';
  END IF;
  IF _check_out <= _check_in THEN
    RAISE EXCEPTION 'Check-out must be after check-in';
  END IF;
  IF _check_in < current_date THEN
    RAISE EXCEPTION 'Check-in cannot be in the past';
  END IF;
  IF _rooms IS NULL OR _rooms < 1 OR _rooms > 10 THEN
    RAISE EXCEPTION 'Please choose between 1 and 10 rooms';
  END IF;

  SELECT * INTO rt FROM public.room_types WHERE id = _room_type_id AND active;
  IF rt IS NULL THEN
    RAISE EXCEPTION 'That room is no longer offered';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext(_room_type_id::text));

  SELECT COALESCE(SUM(b.rooms), 0) INTO taken
  FROM public.bookings b
  WHERE b.room_type_id = _room_type_id
    AND b.status <> 'cancelled'
    AND b.check_in < _check_out
    AND b.check_out > _check_in;

  IF taken + _rooms > rt.total_units THEN
    RAISE EXCEPTION 'Only % room(s) of type % left for those dates', GREATEST(0, rt.total_units - taken), rt.name;
  END IF;

  IF (coalesce(_adults, 0) + coalesce(_children, 0)) > rt.capacity * _rooms THEN
    RAISE EXCEPTION 'That party size needs more rooms of type %', rt.name;
  END IF;

  nights := (_check_out - _check_in);
  total := rt.price_per_night * nights * _rooms;

  INSERT INTO public.bookings (
    room_type_id, guest_name, guest_phone, guest_email,
    check_in, check_out, adults, children, rooms, notes, estimated_total
  ) VALUES (
    _room_type_id, btrim(_guest_name), btrim(_guest_phone), nullif(btrim(coalesce(_guest_email, '')), ''),
    _check_in, _check_out, greatest(1, coalesce(_adults, 1)), greatest(0, coalesce(_children, 0)),
    _rooms, nullif(btrim(coalesce(_notes, '')), ''), total
  )
  RETURNING * INTO new_row;

  RETURN QUERY SELECT new_row.reference, new_row.estimated_total, new_row.status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_booking(uuid, text, text, text, date, date, integer, integer, integer, text) TO anon, authenticated;

-- Look up one booking by reference + phone (guest self-service, no listing)
CREATE OR REPLACE FUNCTION public.lookup_booking(_reference text, _guest_phone text)
RETURNS TABLE (
  reference text,
  guest_name text,
  room_name text,
  check_in date,
  check_out date,
  rooms integer,
  adults integer,
  children integer,
  estimated_total integer,
  status text,
  payment_status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT b.reference, b.guest_name, rt.name, b.check_in, b.check_out, b.rooms,
         b.adults, b.children, b.estimated_total, b.status, b.payment_status
  FROM public.bookings b
  JOIN public.room_types rt ON rt.id = b.room_type_id
  WHERE upper(btrim(b.reference)) = upper(btrim(_reference))
    AND regexp_replace(b.guest_phone, '\D', '', 'g') = regexp_replace(coalesce(_guest_phone, ''), '\D', '', 'g')
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.lookup_booking(text, text) TO anon, authenticated;

-- Record an advance payment against a booking (guest-declared, staff verifies)
CREATE OR REPLACE FUNCTION public.record_payment(_reference text, _guest_phone text, _payment_reference text)
RETURNS TABLE (reference text, payment_status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated public.bookings;
BEGIN
  UPDATE public.bookings b
  SET payment_status = 'advance_paid',
      payment_reference = nullif(btrim(coalesce(_payment_reference, '')), '')
  WHERE upper(btrim(b.reference)) = upper(btrim(_reference))
    AND regexp_replace(b.guest_phone, '\D', '', 'g') = regexp_replace(coalesce(_guest_phone, ''), '\D', '', 'g')
    AND b.status <> 'cancelled'
  RETURNING * INTO updated;

  IF updated IS NULL THEN
    RAISE EXCEPTION 'No booking found for that reference and phone number';
  END IF;

  RETURN QUERY SELECT updated.reference, updated.payment_status;
END;
$$;

GRANT EXECUTE ON FUNCTION public.record_payment(text, text, text) TO anon, authenticated;

-- Real room inventory
INSERT INTO public.room_types (slug, name, description, beds, capacity, price_per_night, total_units, sort_order) VALUES
  ('deluxe', 'Deluxe Room', 'Warm teak interiors, blackout curtains, kettle with tea tray and 24-hour hot water.', '1 king or 2 twin beds', 2, 1899, 12, 1),
  ('executive', 'Executive Room', 'More floor space, a proper work desk and a quiet garden-facing aspect.', '1 king bed with work desk', 2, 2499, 8, 2),
  ('family-suite', 'Family Suite', 'Two connected rooms with a shared sitting area, ideal for families.', '2 rooms, extra bed available', 4, 3699, 4, 3);
