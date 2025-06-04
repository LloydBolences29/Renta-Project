import React, { useState, useEffect, useRef } from 'react';
import ApartmentIcon from '@mui/icons-material/Apartment';
import firstImg from '../imgfolder/1st.png';
import security from '../imgfolder/24_7.png';
import affordable from '../imgfolder/affordable.png';
import career from '../imgfolder/career.png';
import cozy from '../imgfolder/cozy.png';
import transport from '../imgfolder/transport.png';

export default function PageWithIframe() {
  const [iframeSrc, setIframeSrc] = useState('');
  const iframeRef = useRef(null);

  // URL for Allysa Building Virtual Tour (with devicemotion support)
  const allysaUrl = 'https://tour.panoee.net/iframe/67c1b91965c2e37b7b463482';
  // URL for Jade Building Virtual Tour (with devicemotion support)
  const jadeUrl = 'https://tour.panoee.net/iframe/67bfd30a0d49756a6ea773e2';

  const handleTourClick = () => {
    setIframeSrc(allysaUrl);
  };

  const handleRoomClick = () => {
    setIframeSrc(jadeUrl);
  };

  // Attach devicemotion event listener when either tour is active
  useEffect(() => {
    if (iframeSrc === allysaUrl || iframeSrc === jadeUrl) {
      const handleDeviceMotion = (e) => {
        const iframe = document.getElementById('tour-embeded');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: 'devicemotion',
              deviceMotionEvent: {
                acceleration: {
                  x: e.acceleration.x,
                  y: e.acceleration.y,
                  z: e.acceleration.z,
                },
                accelerationIncludingGravity: {
                  x: e.accelerationIncludingGravity.x,
                  y: e.accelerationIncludingGravity.y,
                  z: e.accelerationIncludingGravity.z,
                },
                rotationRate: {
                  alpha: e.rotationRate.alpha,
                  beta: e.rotationRate.beta,
                  gamma: e.rotationRate.gamma,
                },
                interval: e.interval,
                timeStamp: e.timeStamp,
              },
            },
            '*'
          );
        }
      };

      window.addEventListener('devicemotion', handleDeviceMotion);
      return () => {
        window.removeEventListener('devicemotion', handleDeviceMotion);
      };
    }
  }, [iframeSrc, allysaUrl, jadeUrl]);

  // Automatically request full screen when the iframe loads
  const handleIframeLoad = () => {
    if (iframeRef.current && !document.fullscreenElement) {
      if (iframeRef.current.requestFullscreen) {
        iframeRef.current.requestFullscreen();
      } else if (iframeRef.current.webkitRequestFullscreen) {
        iframeRef.current.webkitRequestFullscreen();
      } else if (iframeRef.current.mozRequestFullScreen) {
        iframeRef.current.mozRequestFullScreen();
      } else if (iframeRef.current.msRequestFullscreen) {
        iframeRef.current.msRequestFullscreen();
      }
    }
  };

  // Updated feature list using imported images for icons
  const features = [
    {
      icon: <img src={firstImg} alt="Prime Location" className="w-42 md:w-42 h-auto" />,
      title: 'Prime Location',
      description: 'Enjoy easy access to dining, shopping, and entertainment.'
    },
    {
      icon: <img src={security} alt="Secure Community" className="w-42 md:w-42 h-auto" />,
      title: 'Secure Community',
      description: 'Feel at ease with 24/7 security and friendly neighbors.'
    },
    {
      icon: <img src={cozy} alt="Cozy Layouts" className="w-42 md:w-42 h-auto" />,
      title: 'Cozy Layouts',
      description: 'Compact but comfortable units with a hint of classic charm.'
    },
    {
      icon: <img src={career} alt="Career Leaf" className="w-42 md:w-42 h-auto" />,
      title: 'Career Leaf',
      description: 'Conveniently located near major business and career opportunities.'
    },
    {
      icon: <img src={transport} alt="Public Transport" className="w-42 md:w-42 h-auto" />,
      title: 'Public Transport',
      description: 'Close to bus routes and bustling business districts.'
    },
    {
      icon: <img src={affordable} alt="Affordable Rent" className="w-42 md:w-42 h-auto" />,
      title: 'Affordable Rent',
      description: 'Budget-friendly without sacrificing comfort and growth potential.'
    }
  ];

  return (
    <div className="w-full min-h-screen bg-blue-100 flex flex-col items-center py-8 px-4">
      {/* Content Section */}
      <div className="w-full max-w-5xl p-6 rounded-lg mb-10">
        <h2 className="mt-10 text-3xl md:text-7xl font-extrabold font-quicksand tracking-wide mb-8 text-gray-800 text-center">
          Sweet Home: Redefining the route to comfortable home.
        </h2>
        <p className="text-gray-700 mb-10 mx-4 md:mx-20 tracking-wider text-center font-quicksand text-sm md:text-base">
          Our virtual tour offers an immersive experience, allowing you to explore spacious living areas, and top-notch amenities—all from the comfort of your home.
        </p>

        {/* Buttons Section */}
        <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4 mb-8">
          <button
            onClick={handleTourClick}
            className="inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-blue-950 text-lg transition-all duration-300 px-6 py-3 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 font-quicksand mb:text-xs tb:text-md"
          >
            <ApartmentIcon className="mr-3" />
            Lalaine Building Virtual Tour
          </button>
          <button
            onClick={handleRoomClick}
            className="inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-blue-950 text-lg transition-all duration-300 px-6 py-3 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 font-quicksand mb:text-xs tb:text-md"
          >
            <ApartmentIcon className="mr-3" />
            Jade Building Virtual Tour
          </button>
        </div>

        {/* Iframe Section */}
        {iframeSrc && (
          <div className="relative w-full max-w-5xl aspect-video shadow-xl mb-8">
            <iframe
              id="tour-embeded"
              name={iframeSrc === allysaUrl ? 'alyssa Virtual Tour' : 'Jade Virtual Tour'}
              title="Embedded Content"
              src={iframeSrc}
              frameBorder="0"
              scrolling="no"
              allow="vr; xr; accelerometer; gyroscope; autoplay;"
              allowFullScreen
              webkitallowfullscreen="true"
              mozallowfullscreen="true"
              loading="lazy"
              ref={iframeRef}
              onLoad={handleIframeLoad}
              className="absolute inset-0 w-full h-full rounded-lg border-none"
            />
          </div>
        )}

        {/* Why Vergara's Apartment Complex? */}
        <h2 className="text-3xl md:text-5xl font-quicksand text-center font-bold text-gray-800 tracking-widest mt-20 mb-8">
          Why Vergara's Apartment Complex?
        </h2>
        <p className="text-md md:text-lg font-quicksand text-center text-gray-800 tracking-wider mx-4 md:mx-32 mb-10 mb:text-xs">
          Beyond the robust amenities and prime location, you'll notice the meticulously landscaped green areas that create a refreshing, inviting atmosphere, ensuring you feel right at home.
        </p>

        {/* Three-column features layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4 md:gap-4 mb-20">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center p-8 bg-white border rounded-lg shadow-lg text-center"
            >
              {/* Icon */}
              <div className="mb-8">{feature.icon}</div>

              {/* Optional title */}
              {feature.title && (
                <h3 className="text-xl md:text-2xl font-quicksand font-extrabold mb-2 text-gray-800">
                  {feature.title}
                </h3>
              )}

              {/* Description */}
              <p className="text-gray-700 font-quicksand text-sm md:text-base tracking-wider">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Available Room Button */}
        <div className="flex justify-center mt-8">
          <a
            href="/available-unit"
            className="inline-flex items-center font-semibold rounded-full bg-gradient-to-r from-blue-500 to-blue-400 hover:from-blue-600 hover:to-blue-500 text-blue-950 text-lg transition-all duration-300 px-6 py-3 shadow-lg transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300 font-quicksand"
          >
            <ApartmentIcon className="mr-3" />
            Available Room
          </a>
        </div>
      </div>
    </div>
  );
}
