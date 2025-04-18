import { FaBed, FaCalendarAlt, FaDollarSign, FaUsers } from 'react-icons/fa';

const Dashboard = () => {
  const stats = [
    { title: 'Total Bookings', value: '245', icon: <FaBed />, color: 'bg-blue-100' },
    { title: 'Revenue', value: '$52,420', icon: <FaDollarSign />, color: 'bg-green-100' },
    { title: 'Upcoming Events', value: '12', icon: <FaCalendarAlt />, color: 'bg-purple-100' },
    { title: 'Employees', value: '48', icon: <FaUsers />, color: 'bg-orange-100' },
  ];

  return (
    <div className="ml-64 p-6 mt-16">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm mb-1">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-4 rounded-full`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Bookings</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-600 border-b">
                <th className="pb-3">Guest Name</th>
                <th className="pb-3">Room Type</th>
                <th className="pb-3">Check-In</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {[...Array(5)].map((_, i) => (
                <tr key={i} className="border-b last:border-b-0">
                  <td className="py-4">Guest {i+1}</td>
                  <td>Deluxe Room</td>
                  <td>2023-09-{15+i}</td>
                  <td>
                    <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;