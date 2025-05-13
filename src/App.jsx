import { useState, useEffect, useRef } from "react"
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

  const [greeting,setGreeting] = useState({title: '', subtext: ''})
  useEffect(()=>{
    const greetingEntries = Object.entries(greetings)
    const [randomTitle,randomSubtext] = greetingEntries[Math.floor(Math.random() * greetingEntries.length)]
    setGreeting({ title: randomTitle, subtext: randomSubtext })
  },[])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setLoading(true)
    const searchResult = await LocationSearch(input)

    if (searchResult) {
      const weatherResult = await WeatherSearch(searchResult.lat, searchResult.lon)

      if (weatherResult) {
        const locationTime = new Date(weatherResult.location.localtime)

        const currentHour = locationTime.getHours()

        const dayZero = weatherResult.forecast.forecastday[0].hour
          .filter((hourData) => {
            const hourTime = parseInt(hourData.time.split(" ")[1].split(":")[0])
            return hourTime >= currentHour
          })

        const dayOne = weatherResult.forecast.forecastday[1].hour.slice(0, 24)
        const dayTwo = weatherResult.forecast.forecastday[2].hour.slice(0, 24)

        const name = weatherResult.location.country
        const code = getCountryCode(name)

        setAnimationState('transitioning')

        setTimeout(() => {
          setWeather(weatherResult)
          setForecastDayZero(dayZero)
          setForecastDayOne(dayOne)
          setForecastDayTwo(dayTwo)
          setCountryName(name)
          setCountryCode(code)
          setAnimationState('results-view')
          setCurrentChunkIndex(0)
          setChartActive(true)
        }, 400)
      }
    }

    setLoading(false)
  }

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
      time: hour.time.split(" ")[1],
      temp: hour.temp_c,
      condition: hour.condition.code
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

  return (
    <>
      <div
        ref={textWidthRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          fontFamily: '"JetBrains Mono"',
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
                    <p id="Location">{weather.location.name}</p>
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
              {chartData.map((data, index) => (
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
                  <div className="weather-icon" style={{ fontSize: '38px', marginTop: '5px', }}>
                    <i className={`wi ${weatherCodeToIcon[data.condition] || 'wi-na'}`}></i>
                  </div>
                </div>
              ))}

              <div className="chart-dividers" style={{ position: 'absolute', width: '100%', height: '500px', zIndex: 0 }}>
                {chartData.map((_, index) => (
                  <div key={index} className="divider-box" style={{
                    position: 'absolute',
                    left: `${index * POINT_WIDTH}px`,
                    top: '-40px',
                    width: `${POINT_WIDTH}px`,
                    height: '550px',
                    borderRight: '1px solid #aaa',
                    borderLeft: index === 0 ? '1px solid #aaa' : 'none',
                    pointerEvents: 'none'
                  }} />
                ))}
              </div>

              <AreaChart
                width={CHART_WIDTH}
                height={500}
                margin={{ top: 10, bottom: 30, left: 0, right: 0 }}
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
    </>
  )
}
