import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Dashboard as DashboardIcon, 
  Paid as PaidIcon, 
  Construction as ConstructionIcon, 
  Pets as PetsIcon 
} from '@mui/icons-material';

// Your imported images
import dashboard from '../imgfolder/Dashboard.png';
import pet from '../imgfolder/Pet.png';
import payment from '../imgfolder/payment.png';
import maintenance from '../imgfolder/Maintenance.png';
import firstImg from '../imgfolder/1st.png';
import security from '../imgfolder/24_7.png';
import affordable from '../imgfolder/affordable.png';
import career from '../imgfolder/career.png';
import cozy from '../imgfolder/cozy.png';
import transport from '../imgfolder/transport.png';

const TenantHomePage = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-blue-50 to-blue-100 font-Inter lg:px-20">
      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="text-center mb-12">
          <h2 
            className="
              font-semibold font-quicksand mb-4
              text-xl mb:text-2xl tb:text-4xl lg:text-6xl
              "
          >
            Welcome to <span className="text-blue-900">RENTA</span>
          </h2>
          <p 
            className="
              text-gray-700 font-quicksand max-w-2xl mx-auto
              text-sm mb:text-base tb:text-lg lg:text-xl
            "
          >
            Experience convenience at your fingertips. Our comprehensive platform
            empowers you to manage your home seamlessly.
          </p>
        </section>

        {/* Marquee Section */}
        <section className="overflow-hidden my-10 w-full">
          <div className="flex animate-marquee whitespace-nowrap">
            {/* Example:
                - Default size: w-60 h-60
                - Mobile (mb:) smaller: w-32 h-32
                - Tablet (tb:) medium: w-48 h-48
            */}
            <img 
              src={career} 
              alt="Career" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={dashboard} 
              alt="Dashboard" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={firstImg} 
              alt="First" 
              className="
                mx-4 object-cover
                rounded-t-xl
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={payment} 
              alt="Payment" 
              className="
                mx-4 object-cover
                rounded-r-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={affordable} 
              alt="Affordable" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={maintenance} 
              alt="Maintenance" 
              className="
                mx-4 object-cover
                rounded-xl
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={pet} 
              alt="Pet" 
              className="
                mx-4 object-cover
                rounded-l-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={security} 
              alt="Security" 
              className="
                mx-4 object-cover
                rounded-t-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={cozy} 
              alt="Cozy" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={transport} 
              alt="Transport" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />

            {/* Duplicate for a seamless loop */}
            <img 
              src={dashboard} 
              alt="Dashboard" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={payment} 
              alt="Payment" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={maintenance} 
              alt="Maintenance" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={pet} 
              alt="Pet" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={firstImg} 
              alt="First" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={security} 
              alt="Security" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={affordable} 
              alt="Affordable" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={career} 
              alt="Career" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={cozy} 
              alt="Cozy" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
            <img 
              src={transport} 
              alt="Transport" 
              className="
                mx-4 object-cover rounded-full
                w-60 h-60
                mb:w-32 mb:h-32
                tb:w-48 tb:h-48
              " 
            />
          </div>
        </section>

        {/* Benefits Section */}
        <section className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="
              text-gray-900 font-quicksand font-extrabold mb-4
              text-3xl tb:text-4xl md:text-5xl
            "
          >
            The benefits for you
          </h2>
          <p 
            className="
              text-gray-600 font-quicksand mb-10 max-w-3xl mx-auto
              text-sm mb:text-base tb:text-lg lg:text-xl
            "
          >
            A better way to rent that leaves your wallet wealthier and your house homier. 
            Interested? Here are the basics.
          </p>

          <div className="grid grid-cols-2 mb:grid-cols-1 tb:grid-cols-2 gap-8">
            {/* Column 1 */}
            <div className="flex flex-col items-center rounded-lg font-quicksand">
              <img
                src={dashboard}
                alt="Dashboard"
                className="
                  mb-6 rounded-xl
                  w-68 h-38
                  mb:w-40 mb:h-24
                  tb:w-52 tb:h-32
                "
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Dashboard View</h3>
              <p className="text-gray-600 text-sm mb:text-base tb:text-lg">
                Our Dashboard offers a comprehensive overview of your apartment’s status. 
                Easily monitor payment history, and track maintenance requests. With an intuitive design 
                and actionable insights, managing your rental experience has never been simpler.
              </p>
            </div>

            {/* Column 2 */}
            <div className="flex flex-col items-center rounded-lg font-quicksand">
              <img
                src={payment}
                alt="Payment"
                className="
                  mb-6 rounded-xl
                  w-68 h-38
                  mb:w-40 mb:h-24
                  tb:w-52 tb:h-32
                "
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Rental Payment</h3>
              <p className="text-gray-600 text-sm mb:text-base tb:text-lg">
                Make hassle-free rent payments directly from your dashboard. Our secure online 
                system ensures that transactions are processed quickly and safely, while detailed 
                records keep you informed of your payment history.
              </p>
            </div>

            {/* Column 3 */}
            <div className="flex flex-col items-center rounded-lg font-quicksand">
              <img
                src={maintenance}
                alt="Maintenance"
                className="
                  mb-6 rounded-xl
                  w-68 h-38
                  mb:w-40 mb:h-24
                  tb:w-52 tb:h-32
                "
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Request Maintenance</h3>
              <p className="text-gray-600 text-sm mb:text-base tb:text-lg">
                Submit and track maintenance requests with ease. Our streamlined process offers 
                real-time updates on your service requests, ensuring repairs are handled promptly 
                and your living space remains comfortable.
              </p>
            </div>

            {/* Column 4 */}
            <div className="flex flex-col items-center rounded-lg font-quicksand">
              <img
                src={pet}
                alt="Pet Registration"
                className="
                  mb-6 rounded-xl
                  w-50 h-38
                  mb:w-32 mb:h-24
                  tb:w-48 tb:h-32
                "
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Pet Registration</h3>
              <p className="text-gray-600 text-sm mb:text-base tb:text-lg">
                Our pet feature lets you register and manage your pets effortlessly. Access 
                pet-friendly services and guidelines, ensuring that your furry friends are 
                well cared for within a supportive and pet-friendly environment.
              </p>
            </div>
          </div>
        </section>

        {/* Navigation Cards */}
        <div className="p-5 text-center">
          <h1 className="font-quicksand font-bold mb:text-2xl tb:text-3xl lg:text-4xl">
            Features
          </h1>
        </div>

        <section 
          className="
            grid grid-cols-1
            mb:grid-cols-2
            tb:grid-cols-3
            md:grid-cols-4
            gap-4 pt-5
          "
        >
          {/* Dashboard Card */}
          <Link 
            to="/dashboard" 
            className="
              flex flex-col items-center p-8 bg-white border rounded-lg shadow-lg 
              text-center hover:shadow-xl transition duration-300
            "
          >
            <DashboardIcon className="text-blue-800 text-6xl mb-3" />
            <span className="text-xl font-medium">Dashboard</span>
          </Link>

          {/* Rent Payment Card */}
          <Link 
            to="/pay" 
            className="
              flex flex-col items-center p-8 bg-white border rounded-lg shadow-lg 
              text-center hover:shadow-xl transition duration-300
            "
          >
            <PaidIcon className="text-green-600 text-6xl mb-3" />
            <span className="text-xl font-medium">Rent Payment</span>
          </Link>

          {/* Maintenance Card */}
          <Link 
            to="/maintenance" 
            className="
              flex flex-col items-center p-8 bg-white border rounded-lg shadow-lg 
              text-center hover:shadow-xl transition duration-300
            "
          >
            <ConstructionIcon className="text-orange-500 text-6xl mb-3" />
            <span className="text-xl font-medium">Maintenance</span>
          </Link>

          {/* Pets Card */}
          <Link 
            to="/pets" 
            className="
              flex flex-col items-center p-8 bg-white border rounded-lg shadow-lg 
              text-center hover:shadow-xl transition duration-300
            "
          >
            <PetsIcon className="text-purple-500 text-6xl mb-3" />
            <span className="text-xl font-medium">Pets</span>
          </Link>
        </section>
      </main>

      {/* Footer */}
      <footer className="text-black py-4">
        <div className="container mx-auto px-4 text-center">
          <p>
            &copy; {new Date().getFullYear()} Vergara's Apartment Complex. 
            All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TenantHomePage;
