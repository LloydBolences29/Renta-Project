// tailwind.config.js

module.exports = {
  // Specify all template paths where Tailwind should look for class names
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: ["class"], // Enable class-based dark mode
  theme: {
    // Container configuration with a custom screen breakpoint
    container: {
      center: true,      // Center the container horizontally
      padding: "2rem",   // Apply default horizontal padding
      screens: {
        "2xl": "1400px", // For the 2xl breakpoint, the container will be 1400px wide
      },
    },
    extend: {
      // Extend the default font families
      fontFamily: {
        Inter: ['Inter', 'serif'],
        playfair: ['Playfair Display', 'serif'],
        quicksand: ['Quicksand', 'sans-serif'],
      },
      // Add custom breakpoints
      screens: {
        // Mobile devices (up to 767px)
        mb: { max: '767px' },
        // Tablet devices (768px to 1023px)
        tb: { min: '768px', max: '1023px' },
        // Base desktop design is for 1024px up to 1439px (default, no prefix needed)
        // Bigger screens (1440px and up)
        big: { min: '1440px' },
      },
      // Custom marquee animation
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
    },
  },
  plugins: [],
};
