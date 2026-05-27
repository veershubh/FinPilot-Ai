module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#050816',
          secondary: '#07111f',
          tertiary: '#0B1220',
        },
        accent: {
          mint: '#10B981',
          mintHover: '#0ECF7E',
        },
        text: {
          primary: '#ffffff',
          secondary: '#94a3b8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon': '0 0 20px rgba(16, 185, 129, 0.3)',
        'neon-lg': '0 0 40px rgba(16, 185, 129, 0.2)',
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%': {
            boxShadow: '0 0 10px rgba(16, 185, 129, 0.3)',
          },
          '100%': {
            boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
          },
        },
        float: {
          '0%, 100%': {
            transform: 'translateY(0)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },
      },
    },
  },
  plugins: [],
};
