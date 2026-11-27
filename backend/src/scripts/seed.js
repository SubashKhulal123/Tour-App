const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Tour = require("../models/Tour");
const Booking = require("../models/Booking");

const tours = [
  {
    title: "Everest Panorama Trek",
    location: "Khumbu, Nepal",
    price: 1299,
    duration: 8,
    description:
      "A high-impact Himalayan trekking route built for travelers who want Everest views, Sherpa villages, and manageable daily walking distances.",
    images: [
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80"
    ],
    itinerary: [
      { day: 1, title: "Arrival in Kathmandu", description: "Meet your guide and prepare gear for the mountain flight." },
      { day: 2, title: "Fly to Lukla", description: "Begin the trek through pine forest and riverside villages." },
      { day: 3, title: "Namche Bazaar", description: "Climb to the Sherpa capital with wide views of Kongde Ri." },
      { day: 4, title: "Acclimatization", description: "Visit Everest View Hotel and return to Namche for rest." }
    ],
    maxGroupSize: 12
  },
  {
    title: "Bali Coast and Culture Escape",
    location: "Bali, Indonesia",
    price: 899,
    duration: 6,
    description:
      "A balanced island escape through temple visits, surf beaches, rice terraces, and locally guided food experiences.",
    images: [
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=1200&q=80"
    ],
    itinerary: [
      { day: 1, title: "Canggu Arrival", description: "Settle near the coast and enjoy a sunset welcome dinner." },
      { day: 2, title: "Ubud Temples", description: "Explore sacred water temples and rice terrace viewpoints." },
      { day: 3, title: "Cooking Class", description: "Shop a market and cook regional dishes with a local host." }
    ],
    maxGroupSize: 10
  },
  {
    title: "Iceland Ring Road Highlights",
    location: "Iceland",
    price: 2199,
    duration: 9,
    description:
      "A compact Ring Road itinerary covering waterfalls, glacier lagoons, black sand beaches, geothermal pools, and volcanic coastlines.",
    images: [
      "https://images.unsplash.com/photo-1504829857797-ddff29c27927?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?auto=format&fit=crop&w=1200&q=80"
    ],
    itinerary: [
      { day: 1, title: "Reykjavik", description: "Arrive and meet the group for a city orientation." },
      { day: 2, title: "Golden Circle", description: "Visit Thingvellir, Geysir, and Gullfoss." },
      { day: 3, title: "South Coast", description: "Walk behind waterfalls and visit black sand beaches." }
    ],
    maxGroupSize: 14
  }
];

const seed = async () => {
  await connectDB();

  await Promise.all([User.deleteMany(), Tour.deleteMany(), Booking.deleteMany()]);

  const [admin, user] = await User.create([
    {
      name: "Admin User",
      email: "admin@tourapp.com",
      password: "Admin123!",
      role: "admin"
    },
    {
      name: "Demo Traveler",
      email: "user@tourapp.com",
      password: "User123!",
      role: "user"
    }
  ]);

  const createdTours = await Tour.create(tours);

  await Booking.create({
    userId: user._id,
    tourId: createdTours[0]._id,
    numberOfPeople: 2,
    totalPrice: createdTours[0].price * 2,
    status: "pending"
  });

  console.log("Seed complete");
  console.log(`Admin: ${admin.email} / Admin123!`);
  console.log(`User: ${user.email} / User123!`);
  await mongoose.connection.close();
};

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});

