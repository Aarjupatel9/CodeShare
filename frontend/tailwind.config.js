module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx,css}',
    ],
    plugins: [require('flowbite/plugin')],
    theme: {
      screens: {
        sm: '350px',
        md: '768px',
        lg: '976px',
        xl: '1440px',
      },
    }
}
