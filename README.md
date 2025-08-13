# Atmosnap ⛅

A modern, responsive weather application built with React that provides real-time weather forecasts with beautiful animations and intuitive user experience.

## ✨ Features

- **Dual Search Regions**: Search for weather in India or outside India with dedicated API optimization
- **Multi-Day Forecasts**: Get weather data for today, tomorrow, and the day after
- **Responsive Design**: Seamless experience on both desktop and mobile devices
- **Interactive Charts**: Beautiful area charts showing hourly temperature trends with weather icons
- **Smooth Animations**: Elegant transitions and loading states
- **Weather Icons**: Comprehensive weather icon mapping using Weather Icons font
- **Location Detection**: Automatic reverse geocoding to display city and country information

## 🚀 Live Demo

[View Live Application](https://atmosnap.netlify.app/) 

## 🛠️ Tech Stack

- **Frontend**: React 18+ with Hooks
- **Styling**: CSS3 with custom animations and responsive design
- **Charts**: Recharts for data visualization
- **Icons**: Weather Icons library
- **Build Tool**: Vite
- **Deployment**: Netlify with serverless functions
- **APIs**: 
  - WeatherAPI.com
  - Visual Crossing Weather API
  - OpenStreetMap Nominatim (Geocoding)

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rudraxDragon/atmosnap.git
   cd atmosnap
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   WEATHER_API_KEY=your_weatherapi_key_here
   VISUAL_CROSSING_API_KEY=your_visual_crossing_key_here
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **For production deployment**, set up Netlify functions:
   - Create a `netlify.toml` file in your root directory
   - Deploy to Netlify and set environment variables in the dashboard

## 🔑 API Keys Setup

### WeatherAPI.com
1. Visit [WeatherAPI.com](https://www.weatherapi.com/)
2. Sign up for a free account
3. Get your API key from the dashboard
4. Add it to your environment variables as `WEATHER_API_KEY`

### Visual Crossing Weather
1. Visit [Visual Crossing](https://www.visualcrossing.com/weather-api)
2. Create a free account
3. Get your API key
4. Add it to your environment variables as `VISUAL_CROSSING_API_KEY`

## 📱 Usage

### Desktop Interface
- Enter any location in the search box
- Click the "Atmosnap" button at the bottom to switch between India and international search
- View interactive charts with navigation buttons
- Select different days using the dropdown menu

### Mobile Interface
- Touch-friendly interface with smooth animations
- Swipe-friendly result cards
- Mobile-optimized search and selection

### Search Regions
- **Search in India**: Uses Visual Crossing API (primary) with WeatherAPI fallback
- **Search Outside India**: Uses WeatherAPI exclusively for better international coverage

## 🏗️ Project Structure

```
atmosnap/
├── src/
│   ├── components/
│   │   ├── Greetings.js           # Desktop greeting messages
│   │   ├── Greetings_mobile.js    # Mobile greeting messages  
│   │   ├── LocationSearch.js      # Geocoding functionality
│   │   ├── WeatherSearch.js       # Weather API integration
│   │   └── weatherIconMap.js      # Icon mapping for weather codes
│   ├── App.jsx                    # Main application component
│   ├── main.jsx                   # React entry point
│   └── style.css                  # Global styles and animations
├── netlify/functions/
│   ├── visualcrossing.js         # Visual Crossing API handler
│   └── weather.js                # WeatherAPI handler
├── public/
│   ├── me.jpg                    # Developer photo
│   ├── github.svg                # GitHub icon
│   └── poop.png                  # Custom flag placeholder
└── README.md
```

## 🎨 Key Features Explained

### Multi-API Strategy
- **India**: Primary Visual Crossing API with WeatherAPI fallback for reliability
- **International**: WeatherAPI for broader global coverage

### Responsive Charts
- Desktop: Interactive area charts with pagination
- Mobile: Card-based hourly forecast display

### Weather Icons
Comprehensive mapping supporting both API formats:
- WeatherAPI numeric codes (e.g., 1000 for sunny)
- Visual Crossing string codes (e.g., "clear-day")

### Animations
- Smooth page transitions
- Staggered loading animations
- Interactive hover effects
- Loading spinners and progress indicators

## 🌟 Browser Support

- Modern browsers (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Mobile browsers (iOS Safari, Chrome Mobile, Samsung Internet)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Rudraksh Prasad**
- GitHub: [@rudraxDragon](https://github.com/rudraxDragon)
- Email: your.email@domain.com <!-- Update with your actual email -->

## 🙏 Acknowledgments

- [WeatherAPI.com](https://www.weatherapi.com/) for reliable weather data
- [Visual Crossing](https://www.visualcrossing.com/) for comprehensive weather API
- [OpenStreetMap Nominatim](https://nominatim.openstreetmap.org/) for geocoding services
- [Weather Icons](https://erikflowers.github.io/weather-icons/) for beautiful weather iconography
- [Recharts](https://recharts.org/) for elegant data visualization

## 📊 API Usage & Limits

- **WeatherAPI**: 1M calls/month (free tier)
- **Visual Crossing**: 1000 calls/day (free tier)
- **Nominatim**: Please respect usage policy (max 1 request/second)

## 🐛 Known Issues

- None currently reported. Please open an issue if you find any bugs!

## 🔮 Future Enhancements

- [ ] Weather alerts and notifications
- [ ] Location-based recommendations
- [ ] Weather history and trends
- [ ] Offline mode support
- [ ] PWA capabilities
- [ ] Dark/Light theme toggle

---

Made with ❤️ by Rudraksh Prasad
