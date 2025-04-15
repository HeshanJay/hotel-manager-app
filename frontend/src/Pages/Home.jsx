import React, { useState } from "react";
import { Link } from "react-router-dom";

const Home = () => {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [rooms, setRooms] = useState(1);

  const handleSearch = (e) => {
    e.preventDefault();
    // Implement search functionality here
    console.log({ checkIn, checkOut, guests, rooms });
  };

  const roomCategories = [
    {
      id: 1,
      title: "Standard Room",
      description: "Comfortable room for relaxing stay",
      price: 100,
      image:
        "https://images.unsplash.com/photo-1524758631624-e2822e304c36?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
    {
      id: 2,
      title: "Deluxe Room",
      description: "Luxurious room with extra amenities",
      price: 150,
      image:
        "https://image-tc.galaxy.tf/wijpeg-afu0zj5rhmyyirzditj3g96mk/deluxe-room-king-1-2000px.jpg",
    },
    {
      id: 3,
      title: "Suite",
      description: "Spacious and elegant room",
      price: 250,
      image:
        "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Section */}
      <div
        className="relative bg-cover bg-center h-[600px]"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80')",
        }}
      >
        <div className="absolute inset-0 bg-black opacity-50"></div>

        {/* Booking Form */}
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32">
          <h1 className="text-4xl md:text-5xl font-bold text-white text-center mb-8">
            Book Your Perfect Stay
          </h1>

          <div className="bg-white rounded-lg shadow-xl p-6 max-w-4xl mx-auto">
            <form
              onSubmit={handleSearch}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Check-in
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Check-out
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Guests
                </label>
                <select
                  value={guests}
                  onChange={(e) => setGuests(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Guest" : "Guests"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rooms
                </label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(Number(e.target.value))}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? "Room" : "Rooms"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-4">
                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 mt-4"
                >
                  Search Rooms
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Our Rooms Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Our Rooms</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {roomCategories.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <img
                src={room.image}
                alt={room.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{room.title}</h3>
                <p className="text-gray-600 mb-4">{room.description}</p>
                <p className="text-lg font-medium text-indigo-600 mb-4">
                  ${room.price}/night
                </p>
                <Link
                  to={`/room-booking`}
                  className="bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 transition duration-300 block text-center"
                >
                  Book Now
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Why Choose Us</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Luxury Rooms</h3>
            <p className="text-gray-600">
              Experience comfort in our elegantly designed rooms with modern
              amenities.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">Prime Location</h3>
            <p className="text-gray-600">
              Located in the heart of the city with easy access to attractions.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold mb-2">24/7 Service</h3>
            <p className="text-gray-600">
              Our dedicated staff is available round the clock for your needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
