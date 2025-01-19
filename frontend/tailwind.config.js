module.exports = {
    content: [
        './src/**/*.{js,jsx,ts,tsx,css}',
    ],
    plugins: [require('flowbite/plugin')],
    theme: {
      screens: {
        sm: '300px',
        md: '768px',
        lg: '976px',
        lgxl: '1080px',
        xl: '1440px',
      },
    }
}
