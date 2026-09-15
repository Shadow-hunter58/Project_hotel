import roomDeluxe from "@/assets/real-deluxe-room.jpg";
import realExecutiveRoom from "@/assets/real-executive-room.jpg";
import realSuiteLiving from "@/assets/real-suite-living.jpg";
import realFacadeDay from "@/assets/real-facade-day.jpg";
import realBedroom from "@/assets/real-bedroom.jpg";
import realHall from "@/assets/real-hall.jpg";
import realMeeting from "@/assets/real-meeting.jpg";
import realSuiteDining from "@/assets/real-suite-dining.jpg";
import realEventStage from "@/assets/real-event-stage.jpg";
import realLoungeAsset from "@/assets/ratna-lounge.webp.asset.json";

export const PHONE = "+917338088744";
export const PHONE_DISPLAY = "+91 73380 88744";
export const WHATSAPP = "917338088744";
/** Replace with the hotel's own UPI handle before going live. */
export const UPI_ID = "ratnaforever@upi";
export const UPI_NAME = "Hotel Ratna Forever";

export const nav = [
  { label: "Home", to: "/" },
  { label: "Rooms", to: "/rooms" },
  { label: "Reservations", to: "/reservations" },
  { label: "Contact", to: "/contact" },
] as const;

export const rooms = [
  {
    name: "Deluxe Room",
    beds: "1 king or 2 twin beds · 2 guests",
    price: "₹1,899",
    amount: 1899,
    blurb:
      "Warm teak interiors, blackout curtains, kettle with tea tray and 24-hour hot water. The dependable choice for a one or two night stay.",
    tags: ["Air-conditioned", "Kettle & tea tray", "Free Wi-Fi"],
    image: roomDeluxe,
  },
  {
    name: "Executive Room",
    beds: "1 king bed · 2 guests · work desk",
    price: "₹2,499",
    amount: 2499,
    blurb:
      "A little more floor space, a proper work desk and a quiet garden-facing aspect — built for visiting faculty and business guests.",
    tags: ["Garden view", "Work desk", "Daily housekeeping"],
    image: realExecutiveRoom,
  },
  {
    name: "Family Suite",
    beds: "2 rooms · up to 4 guests",
    price: "₹3,699",
    amount: 3699,
    blurb:
      "Two connected rooms with a shared sitting area — the pick for parents visiting Nitte campuses or wedding-season families.",
    tags: ["Extra bed available", "Room service", "Laundry service"],
    image: realSuiteLiving,
  },
];

export const dishes = [
  { name: "Prawn Ghee Roast", note: "Guest favourite · slow-roasted in byadgi and ghee" },
  { name: "Kane Fish Masala Fry", note: "Ladyfish from the Malpe catch, rava-crusted" },
  { name: "Neer Dosa & Chicken Sukka", note: "The Tulu Nadu classic, served all day" },
  { name: "Ghee Roast Dosa & Filter Coffee", note: "Complimentary breakfast, 7:30–10:30 AM" },
];

export const facilities = [
  { title: "Free Wi-Fi", note: "Fast enough for calls and uploads in every room" },
  { title: "Free breakfast", note: "South Indian spread included with every stay" },
  { title: "Free parking", note: "Ample on-site parking for cars and buses" },
  { title: "Banquet & function hall", note: "Weddings, receptions and seminars, full setup" },
  { title: "Room service", note: "Kitchen orders to your door until 11 PM" },
  { title: "Laundry service", note: "Same-day wash and press on request" },
  { title: "24-hour hot water", note: "Plus kettle and bottled water daily" },
  { title: "Power backup", note: "Generator keeps rooms and kitchen running" },
];

export const reviews = [
  {
    quote:
      "The room was clean and had everything one needs for a one or two day stay. Staff were helpful throughout.",
    name: "shek2005",
    source: "Tripadvisor",
  },
  {
    quote:
      "Prawn ghee roast and kane fish fry were outstanding — easily the best food we found around Nitte.",
    name: "Google guest review",
    source: "Google",
  },
  {
    quote:
      "Convenient parking, spotless rooms and hot water any time of night. Perfect base for a campus visit.",
    name: "Google guest review",
    source: "Google",
  },
];

export const gallery = [
  {
    src: realHall,
    title: "Function hall",
    note: "Seats a few hundred for weddings, receptions and seminars",
    alt: "Function hall at Hotel Ratna Forever set with red-covered chairs facing a decorated stage",
  },
  {
    src: realMeeting,
    title: "Meeting room",
    note: "Projector, air-conditioning and table service for small groups",
    alt: "Air-conditioned meeting room with red armchairs, laid tables and a projector screen",
  },
  {
    src: realFacadeDay,
    title: "The building",
    note: "Blue-glass facade right on the Nitte main road, with free parking in front",
    alt: "Daytime view of the Hotel Ratna Forever building with its blue glass facade and forecourt parking",
  },
  {
    src: realLoungeAsset.url,
    title: "Lobby lounge",
    note: "Cushioned seating, aquarium and reception desk, staffed round the clock",
    alt: "Hotel Ratna Forever lobby lounge with cream sofas, a magazine table, carved teak daybed, aquarium and reception desk",
  },
  {
    src: realSuiteDining,
    title: "Suite dining area",
    note: "In-suite dining table with pantry counter and fridge",
    alt: "Dining area inside a Ratna Forever suite with a round table, wooden chairs, pantry counter and fridge",
  },
  {
    src: realEventStage,
    title: "Event stage",
    note: "Decorated stage in the function hall for weddings and receptions",
    alt: "Decorated event stage inside the Ratna Forever function hall with two ceremonial chairs",
  },
  {
    src: realBedroom,
    title: "Bedroom",
    note: "AC room with king bed, phone, seating and 24-hour hot water",
    alt: "Air-conditioned bedroom with a king bed, red drapes and a wooden seating set",
  },
];
