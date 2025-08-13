import { useState, useEffect, useRef } from "react"
import { mobileGreetings } from "./components/Greetings_mobile"
import countries from "i18n-iso-countries"
import enLocale from "i18n-iso-countries/langs/en.json"
import { AreaChart, XAxis, YAxis, Area, ReferenceDot } from "recharts"
import WeatherSearch from "./components/WeatherSearch"
import LocationSearch from "./components/LocationSearch"
import 'weather-icons/css/weather-icons.css'
import weatherCodeToIcon from "./components/weatherIconMap"
import { greetings } from './components/Greetings'
import './style.css'

countries.registerLocale(enLocale)

export default function App() {
  const [weather, setWeather] = useState(null)
  const [input, setInput] = useState('')
  const [selectedDay, setSelectedDay] = useState('0')
  const [forecastDayZero, setForecastDayZero] = useState([])
  const [forecastDayOne, setForecastDayOne] = useState([])
  const [forecastDayTwo, setForecastDayTwo] = useState([])
  const [countryName, setCountryName] = useState(null)
  const [countryCode, setCountryCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [animationState, setAnimationState] = useState('search-view')
  const [selectWidth, setSelectWidth] = useState(null)
  const selectRef = useRef(null)
  const textWidthRef = useRef(null)
  const [chartActive, setChartActive] = useState(true)
  const [currentChunkIndex, setCurrentChunkIndex] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileResults, setShowMobileResults] = useState(false)
  const [mobileSearchFading, setMobileSearchFading] = useState(false)
  const [mobileSelectedDay, setMobileSelectedDay] = useState('0')
  const [mobileLoading, setMobileLoading] = useState(false)

  // New state for region selection
  const [searchRegion, setSearchRegion] = useState('india')
  const [showRegionDropdown, setShowRegionDropdown] = useState(false)
  const regionDropdownRef = useRef(null)

  // Info message state
  const [showInfoMessage, setShowInfoMessage] = useState(false)
  const [infoMessageTimeout, setInfoMessageTimeout] = useState(null)

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth <= 750)
    }
    checkIsMobile()
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (regionDropdownRef.current && !regionDropdownRef.current.contains(event.target)) {
        setShowRegionDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Show info message on first load
  useEffect(() => {
    const hasSeenInfo = localStorage.getItem('atmosnap-info-seen')
    if (!hasSeenInfo) {
      const timer = setTimeout(() => {
        setShowInfoMessage(true)
        localStorage.setItem('atmosnap-info-seen', 'true')
        
        // Auto hide after 8 seconds
        const hideTimer = setTimeout(() => {
          setShowInfoMessage(false)
        }, 8000)
        setInfoMessageTimeout(hideTimer)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [])

  const getMobileForecastData = () => {
    switch (mobileSelectedDay) {
      case '0': return forecastDayZero
      case '1': return forecastDayOne
      case '2': return forecastDayTwo
      default: return forecastDayZero
    }
  }

  const [greeting, setGreeting] = useState({ title: '', subtext: '' })
  useEffect(() => {
    const selectedGreeting = isMobile ? mobileGreetings : greetings
    const greetingEntries = Object.entries(selectedGreeting)
    const [randomTitle, randomSubtext] = greetingEntries[Math.floor(Math.random() * greetingEntries.length)]
    setGreeting({ title: randomTitle, subtext: randomSubtext })
  }, [isMobile])

  const POINTS_PER_VIEW = 7
  const MIN_POINTS_LAST_PAGE = 4

  useEffect(() => {
    if (weather && selectRef.current) {
      const selectedOption = selectRef.current.options[selectRef.current.selectedIndex]
      if (textWidthRef.current) {
        textWidthRef.current.textContent = selectedOption.text
        const width = textWidthRef.current.offsetWidth
        setSelectWidth(width + 20)
      }
    }
  }, [selectedDay, weather])

  useEffect(() => {
    setCurrentChunkIndex(0)
  }, [selectedDay])

  const getCountryCode = (name) => {
    return countries.getAlpha2Code(name, "en")?.toLowerCase()
  }

  const handleBackToSearch = () => {
    setAnimationState('exiting')
    setChartActive(false)

    setTimeout(() => {
      setAnimationState('search-view')
      setTimeout(() => {
        setWeather(null)
        setForecastDayZero([])
        setForecastDayOne([])
        setForecastDayTwo([])
        setInput('')
        setCountryName(null)
        setCountryCode(null)
        setCurrentChunkIndex(0)
      }, 100)
    }, 500)
  }

  const handleMobileBackToSearch = () => {
    setShowMobileResults(false)
    setWeather(null)
    setForecastDayZero([])
    setForecastDayOne([])
    setForecastDayTwo([])
    setInput('')
    setCountryName(null)
    setCountryCode(null)
    setMobileSelectedDay('0')
  }

  const handleRegionSelect = (region) => {
    setSearchRegion(region)
    setShowRegionDropdown(false)
  }

  const getRegionLabel = () => {
    return searchRegion === 'india' ? 'Search in India' : 'Search Outside India'
  }

  const handleInfoClose = () => {
    if (infoMessageTimeout) {
      clearTimeout(infoMessageTimeout)
    }
    setShowInfoMessage(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (isMobile) {
      setMobileLoading(true);
      setMobileSearchFading(true);
    } else {
      setLoading(true);
    }

    try {
      // 1️⃣ Get coordinates using the selected search region
      const geoData = await LocationSearch(input, searchRegion);
      if (!geoData) throw new Error("Location not found");

      const { lat, lon, display_name } = geoData;

      // 2️⃣ Get weather using the selected search region
      const weatherResult = await WeatherSearch(lat, lon, searchRegion);
      if (!weatherResult) throw new Error("Weather data not found");

      // 3️⃣ Determine API type & normalize data
      let forecastDays = [];
      let currentWeather = {};
      let city = "";
      let country = "";

      if (weatherResult.forecast?.forecastday) {
        // ---- WeatherAPI ----
        console.log("Processing WeatherAPI data");
        forecastDays = weatherResult.forecast.forecastday.map(day => ({
          ...day,
          hour: day.hour.map(h => ({
            ...h,
            iconKey: h.condition?.code, // numeric code for WeatherAPI
            temp_c: h.temp_c,
            condition: {
              text: h.condition?.text || 'Unknown',
              code: h.condition?.code // Keep the original code
            }
          }))
        }));

        // Filter today's hours to show only current hour onwards
        if (forecastDays[0]) {
          const currentHour = new Date().getHours();
          forecastDays[0].hour = forecastDays[0].hour.filter(h => {
            const hourTime = parseInt(h.time.split(" ")[1].split(":")[0]);
            return hourTime >= currentHour;
          });
        }

        currentWeather = weatherResult.current;
        city = weatherResult.location.name || display_name;
        country = weatherResult.location.country || display_name.split(", ").pop();
      }
      else if (weatherResult.days) {
        // ---- Visual Crossing ----
        console.log("Processing Visual Crossing data");
        forecastDays = weatherResult.days.slice(0, 3).map(day => ({
          date: day.datetime,
          hour: day.hours.map(h => ({
            ...h,
            time: h.datetime.substring(0, 5),
            temp_c: h.temp,
            condition: {
              text: h.conditions || 'Unknown',
              code: h.icon // Use icon string as code for Visual Crossing
            },
            iconKey: h.icon // string code (e.g. "rain", "clear-day")
          }))
        }));

        // Filter today's hours to show only current hour onwards  
        if (forecastDays[0]) {
          const currentHour = new Date().getHours();
          forecastDays[0].hour = forecastDays[0].hour.filter(h => {
            const hourTime = parseInt(h.datetime.split(":")[0]);
            return hourTime >= currentHour;
          });
        }

        currentWeather = weatherResult.currentConditions || {};
        // Use the location data from Visual Crossing if available
        city = weatherResult.location?.name || weatherResult.address || display_name;
        country = weatherResult.location?.country || display_name.split(", ").pop();
      }

      console.log("Forecast days processed:", forecastDays);
      console.log("Sample hour data:", forecastDays[0]?.hour[0]);

      // 4️⃣ Save forecast in your 3 day arrays
      setForecastDayZero(forecastDays[0]?.hour || []);
      setForecastDayOne(forecastDays[1]?.hour || []);
      setForecastDayTwo(forecastDays[2]?.hour || []);

      // 5️⃣ Save location & country info
      setWeather({
        location: { name: city, country: country },
        current: { ...currentWeather, temp_c: currentWeather.temp_c || currentWeather.temp },
        forecast: { forecastday: forecastDays }
      });

      setCountryName(country);
      setCountryCode(getCountryCode(country));
      setInput("");

      // 6️⃣ Animation/view transitions
      if (isMobile) {
        // Add delay for mobile loading screen
        setTimeout(() => {
          setShowMobileResults(true);
          setMobileSearchFading(false);
        }, 1000);
      } else {
        setAnimationState('results-view');
        setChartActive(true);
      }

    } catch (err) {
      console.error("⌛ Error in handleSubmit:", err);
      alert(`Error: ${err.message}`);
      if (isMobile) {
        setMobileSearchFading(false);
      }
    } finally {
      if (isMobile) {
        setMobileLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const customFlags = {
    'pk': '/poop.png',
    'ir': '/poop.png',
    'iq': '/poop.png',
    'af': '/poop.png',
    'bd': '/poop.png',
    'mv': '/poop.png',
    'tr': '/poop.png',
    'az': '/poop.png',
    'ye': '/poop.png',
    'sy': '/poop.png',
    'uz': '/poop.png',
    'qa': '/poop.png'
  }

  const getFlagImg = (code) => customFlags[code] || `https://flagcdn.com/w80/${code}.png`
  const isCustomFlag = (code) => Object.hasOwn(customFlags, code)

  const forecastMap = {
    '0': forecastDayZero,
    '1': forecastDayOne,
    '2': forecastDayTwo
  }

  const fullChartData = chartActive && forecastMap[selectedDay]?.length > 0
    ? forecastMap[selectedDay].map(hour => ({
      time: hour.time?.split(" ")[1] || hour.time,
      temp: hour.temp_c,
      condition: hour.condition?.code || hour.iconKey // Use either condition.code or iconKey
    }))
    : []

  const calculateChartData = () => {
    if (!chartActive || fullChartData.length === 0) return []

    const totalLength = fullChartData.length
    const totalPages = Math.ceil(totalLength / POINTS_PER_VIEW)
    const remainingPoints = totalLength % POINTS_PER_VIEW
    const secondLastPageIndex = totalPages - 2

    const isLastPageSmall = totalPages > 1 && remainingPoints > 0 && remainingPoints < MIN_POINTS_LAST_PAGE

    if (isLastPageSmall) {
      if (currentChunkIndex === secondLastPageIndex) {
        return fullChartData.slice(secondLastPageIndex * POINTS_PER_VIEW, totalLength)
      }

      if (currentChunkIndex >= totalPages - 1) {
        return []
      }
    }

    const start = currentChunkIndex * POINTS_PER_VIEW
    const end = Math.min(start + POINTS_PER_VIEW, totalLength)
    return fullChartData.slice(start, end)
  }

  const chartData = calculateChartData()
  const POINT_WIDTH = 150
  const CHART_WIDTH = chartData.length * POINT_WIDTH

  const handleDaySelect = (e) => {
    setSelectedDay(e.target.value)
  }

  const remainingPoints = fullChartData.length % POINTS_PER_VIEW
  const isLastPageSmall = remainingPoints > 0 && remainingPoints < MIN_POINTS_LAST_PAGE
  const totalPages = Math.ceil(fullChartData.length / POINTS_PER_VIEW)
  const effectiveMaxIndex = isLastPageSmall ? totalPages - 2 : totalPages - 1

  const handlePrevChunk = () => {
    if (currentChunkIndex > 0) {
      setCurrentChunkIndex(currentChunkIndex - 1)
    }
  }

  const handleNextChunk = () => {
    const totalLength = fullChartData.length
    const totalPages = Math.ceil(totalLength / POINTS_PER_VIEW)
    const remainingPoints = totalLength % POINTS_PER_VIEW
    const isLastPageSmall = totalPages > 1 && remainingPoints > 0 && remainingPoints < MIN_POINTS_LAST_PAGE

    const maxChunkIndex = isLastPageSmall ? totalPages - 2 : totalPages - 1

    if (currentChunkIndex < maxChunkIndex) {
      setCurrentChunkIndex(currentChunkIndex + 1)
    }
  }

  const hasMoreLeft = currentChunkIndex > 0
  const hasMoreRight = currentChunkIndex < effectiveMaxIndex

  const minTemp = chartData.length > 0 ? Math.min(...chartData.map(d => d.temp)) - 5 : 0
  const maxTemp = chartData.length > 0 ? Math.max(...chartData.map(d => d.temp)) + 5 : 50

  const displayCity = weather?.location?.name || weather?.location?.region || input;

  return (
    <>
      {/* Info Message */}
      {showInfoMessage && (
        <div className="info-message-overlay">
          <div className="info-message">
            <button className="info-close-btn" onClick={handleInfoClose}>×</button>
            <div className="info-content">
              <h3>💡 Quick Tip</h3>
              <p>Click on <strong>"Atmosnap"</strong> at the bottom to switch between searching in India or outside India!</p>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div className="layout-wrapper">
          <div
            ref={textWidthRef}
            style={{
              position: 'absolute',
              visibility: 'hidden',
              fontFamily: '"Jura"',
              fontSize: '1.8rem',
              whiteSpace: 'nowrap'
            }}
          ></div>

          <header>
            <div className="form-container">
              <form onSubmit={handleSubmit} className={`search-form ${animationState}`}>
                <div className={`search-inputs ${animationState !== 'search-view' ? 'fade-out' : 'fade-in'}`}>
                  <div className="greeting-box">
                    <h1>{greeting.title}</h1>
                    <p>{greeting.subtext}</p>
                  </div>
                  <div className="search-row">
                    <input
                      type="search"
                      placeholder="Enter Location"
                      value={input}
                      onChange={(e) => { setInput(e.currentTarget.value) }}
                      id="Search-box"
                    />
                    <button
                      type="submit"
                      id="Search-button"
                      style={{
                        width: loading ? '60px' : '140px',
                        fontSize: loading ? '0' : '2rem'
                      }}
                    >
                      {loading ? <div className="button-loader"></div> : 'Search'}
                    </button>
                  </div>
                </div>

                {weather && animationState !== 'exiting' && (
                  <div className={`results-container ${animationState === 'results-view' ? 'fade-in' : 'fade-out'}`}>
                    <div className="search">
                      <div className="Search-img">
                        <img
                          id="Flag"
                          src={getFlagImg(countryCode)}
                          alt={`Flag of ${countryName}`}
                          style={
                            isCustomFlag(countryCode)
                              ? {
                                height: '40px',
                                width: '40px',
                                objectFit: 'cover'
                              }
                              : undefined
                          }
                        />
                      </div>
                      <div className="location">
                        <p id="Location">{displayCity}</p>
                        <hr />
                        <p id="Country">{weather.location.country}</p>
                      </div>
                      <hr style={{
                        height: '50px',
                        width: '1px',
                        backgroundColor: '#aaa',
                        border: 'none',
                        margin: '0 12px'
                      }} />
                      <p id="Current">Currently: {weather.current.temp_c} °C</p>
                      <hr style={{
                        height: '50px',
                        width: '1px',
                        backgroundColor: '#aaa',
                        border: 'none',
                        margin: '0 12px'
                      }} />
                      <button
                        onClick={handleBackToSearch}
                        id="Exit"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={`day-select-container ${animationState === 'results-view' ? 'show' : ''}`}>
                      <select
                        id="Day-select"
                        value={selectedDay}
                        onChange={handleDaySelect}
                        ref={selectRef}
                        style={{ width: selectWidth ? `${selectWidth}px` : 'auto' }}
                      >
                        <option value="0">Today</option>
                        <option value="1">Tomorrow</option>
                        <option value="2">Day After</option>
                      </select>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </header>

          {(animationState === 'results-view' && chartActive && chartData.length > 0) ? (
            <div className={`forecast-scroll-wrapper ${animationState === 'results-view' ? 'fade-in' : 'fade-out'}`}>
              <div className="forecast-container" style={{
                position: 'relative',
                width: `${CHART_WIDTH + 160}px`,
                margin: 'auto',
                marginBlock: '100px',
                height: '400px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <button onClick={handlePrevChunk} disabled={!hasMoreLeft} className="nav-button left">{'<'}</button>

                <div className="forecast" style={{ width: `${CHART_WIDTH}px`, position: 'relative' }}>
                  {chartData.map((data, index) => {
                    // Get the correct icon class
                    const iconClass = weatherCodeToIcon[data.condition] || 'wi-na';
                    console.log(`Icon for condition ${data.condition}:`, iconClass);

                    return (
                      <div key={index} className="temp-label" style={{
                        position: 'absolute',
                        left: `${index * POINT_WIDTH + POINT_WIDTH / 2 - 14}px`,
                        top: '-30px',
                        color: '#f4c430',
                        fontSize: '18px',
                        zIndex: 5,
                        fontWeight: 'bold',
                        textAlign: 'center'
                      }}>
                        {data.temp}
                        <div className="weather-icon" style={{ fontSize: '38px', marginTop: '5px' }}>
                          <i className={`wi ${iconClass}`}></i>
                        </div>
                      </div>
                    );
                  })}

                  <div className="chart-dividers" style={{ position: 'absolute', width: '100%', height: '500px', zIndex: 0 }}>
                    {chartData.map((_, index) => (
                      <div key={index} className="divider-box" style={{
                        position: 'absolute',
                        left: `${index * POINT_WIDTH}px`,
                        top: '-40px',
                        width: `${POINT_WIDTH}px`,
                        height: '450px',
                        borderRight: '1px solid #aaa',
                        borderLeft: index === 0 ? '1px solid #aaa' : 'none',
                        pointerEvents: 'none'
                      }} />
                    ))}
                  </div>

                  <AreaChart
                    width={CHART_WIDTH}
                    height={400}
                    margin={{ top: 0, bottom: 30, left: 0, right: 0 }}
                    data={chartData}
                  >
                    <XAxis
                      dataKey="time"
                      interval={0}
                      tick={{ fill: "#aaa", fontSize: 18 }}
                      axisLine={false}
                      tickLine={false}
                      padding={{ left: POINT_WIDTH / 2, right: POINT_WIDTH / 2 }}
                    />
                    <YAxis domain={[minTemp, maxTemp]} hide />
                    <Area
                      type="monotone"
                      dataKey="temp"
                      stroke="#f4c430"
                      strokeWidth={2}
                      fill="#f4c430"
                      fillOpacity={0.2}
                      isAnimationActive={true}
                    />
                    {chartData.map((data, index) => (
                      <ReferenceDot
                        key={index}
                        x={data.time}
                        y={data.temp}
                        r={5}
                        fill="#ffffff"
                        stroke="#f4c430"
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </div>

                <button onClick={handleNextChunk} disabled={!hasMoreRight} className="nav-button right">{'>'}</button>
              </div>
            </div>
          ) : null}

          <footer>
            <div className="footer-name">
              <div className="region-dropdown" ref={regionDropdownRef}>
                <button
                  className="region-button"
                  onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                >
                  Atmosnap
                </button>
                {showRegionDropdown && (
                  <div className="region-dropdown-menu">
                    <div
                      className={`region-option ${searchRegion === 'india' ? 'active' : ''}`}
                      onClick={() => handleRegionSelect('india')}
                    >
                      <span className="region-text">Search in India</span>
                    </div>
                    <div
                      className={`region-option ${searchRegion === 'outside' ? 'active' : ''}`}
                      onClick={() => handleRegionSelect('outside')}
                    >
                      <span className="region-text">Search Outside India</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="photo-box">
              <a href="https://github.com/rudraxDragon"><img id="photo" src="/me.jpg" alt="Picture of Rudraksh Prasad" /></a>
            </div>
            <div className="footer-box">
              <h3 id="name">Rudraksh Prasad</h3>
              <hr />
              <div className="gitbox">
                <img src="/github.svg" alt="github logo" id="gitlogo" />
                <a href="https://github.com/rudraxDragon">rudraxDragon</a>
              </div>
            </div>
          </footer>
        </div>
      )}

      {/* Mobile Loading Screen */}
      {isMobile && mobileLoading && (
        <div className="mobile-loading-screen">
          <div className="mobile-loading-content">
            <div className="mobile-spinner"></div>
            <p className="mobile-loading-text">Fetching weather data...</p>
          </div>
        </div>
      )}

      {isMobile && !showMobileResults && !mobileLoading && (
        <>
          <div className={`mobileContainer ${mobileSearchFading ? 'fade-out' : ''}`}>
            <div className="mobileGreetings">
              <h1>{greeting.title}</h1>
              <p>{greeting.subtext}</p>
            </div>

            <div className="mobileSearchBox">
              <form onSubmit={handleSubmit}>
                <input type="search"
                  id="mobileSearch"
                  name="mobileSearchBox"
                  placeholder="Enter Location"
                  value={input}
                  onChange={(e) => { setInput(e.currentTarget.value) }}
                />
              </form>
            </div>
            <div className="footer-mobile">
              <div className="footer-name-mobile">
                <div className="mobile-region-dropdown" ref={regionDropdownRef}>
                  <button
                    className="mobile-region-button"
                    onClick={() => setShowRegionDropdown(!showRegionDropdown)}
                  >
                    Atmosnap
                  </button>
                  {showRegionDropdown && (
                    <div className="mobile-region-dropdown-menu">
                      <div
                        className={`mobile-region-option ${searchRegion === 'india' ? 'active' : ''}`}
                        onClick={() => handleRegionSelect('india')}
                      >
                        <span className="mobile-region-text">Search in India</span>
                      </div>
                      <div
                        className={`mobile-region-option ${searchRegion === 'outside' ? 'active' : ''}`}
                        onClick={() => handleRegionSelect('outside')}
                      >
                        <span className="mobile-region-text">Search Outside India</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="footer-box-mobile">
                <h3 id="name-mobile">Rudraksh Prasad</h3>
                <hr />
                <div className="gitbox-mobile">
                  <img src="/github.svg" alt="github logo" id="gitlogo-mobile" />
                  <a href="https://github.com/rudraxDragon">rudraxDragon</a>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {isMobile && showMobileResults && (
        <>
          <div className="mobileSearchresult">
            <div className="mobileLocationBox">
              <p id="mobileLocation">{weather.location.name}</p>
              <div className="mobileSelectionBox">
                <div className="mobileCountryBox">
                  <p id="mobileCountry">{weather.location.country}</p>
                  <img
                    id="mobileFlag"
                    src={getFlagImg(countryCode)}
                    alt={`flag of ${countryName}`}
                    style={
                      isCustomFlag(countryCode)
                        ? {
                          height: '40px',
                          width: '60px',
                          objectFit: 'cover'
                        }
                        : undefined
                    } />
                </div>
                <div className="selectionOptions">
                  <button
                    className="mobileCloseButton"
                    onClick={handleMobileBackToSearch}
                  >
                    ✕
                  </button>
                  <label htmlFor="daybox"></label>
                  <select
                    value={mobileSelectedDay}
                    onChange={(e) => setMobileSelectedDay(e.target.value)}
                    id="mobileSelector"
                  >
                    <option value="0">Today</option>
                    <option value="1">Tomorrow</option>
                    <option value="2">Day After</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mobileResultBox">
              {getMobileForecastData().map((hourData, index) => {
                // Get the correct icon for mobile view
                const iconClass = weatherCodeToIcon[hourData.condition?.code || hourData.iconKey] || 'wi-na';
                console.log(`Mobile icon for condition ${hourData.condition?.code || hourData.iconKey}:`, iconClass);

                return (
                  <div key={index} className="tempBox" style={{
                    animationDelay: `${index * 0.1}s`
                  }}>
                    <div className="mobileTimeIcon">
                      <div className="mobileWeatherIcon">
                        <i id="weatherIconMobile" className={`wi ${iconClass}`}></i>
                      </div>
                      <span className="timeLabel">{hourData.time?.split(" ")[1] || hourData.time}</span>
                    </div>
                    <p>{hourData.temp_c}°C</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  )
}
