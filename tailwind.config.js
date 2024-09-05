/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [],
  theme: {
  	extend: {
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
		backgroundColor: ['hover'],
  		colors: {
			'primary-yellow': '#FFC107',
		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

