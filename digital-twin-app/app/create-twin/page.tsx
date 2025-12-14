"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import {
  HeartbeatIcon,
  StethoscopeIcon,
  ActivityIcon,
  BedIcon,
  RunningIcon,
  BrainIcon,
  SmokingIcon,
  PillIcon,
  MonitorIcon,
  UserIcon,
  MapPinIcon,
  BriefcaseIcon,
  DollarIcon,
  ForkKnifeIcon,
} from "@/components/medical-icons"
import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api"
import { Check } from "lucide-react"
// import { google } from "google-maps"

const API_BASE = "http://127.0.0.1:8000"

const CITY_AQI_MAP: Record<string, { lat: number; lng: number; aqi: number }> = {
  Mumbai: { lat: 19.076, lng: 72.8777, aqi: 120 },
  Delhi: { lat: 28.7041, lng: 77.1025, aqi: 180 },
  Bangalore: { lat: 12.9716, lng: 77.5946, aqi: 90 },
  Kolkata: { lat: 22.5726, lng: 88.3639, aqi: 150 },
  Chennai: { lat: 13.0827, lng: 80.2707, aqi: 100 },
  Hyderabad: { lat: 17.385, lng: 78.4867, aqi: 110 },
  Pune: { lat: 18.5204, lng: 73.8567, aqi: 95 },
}

export default function CreateTwinPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const totalSteps = 6
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState("")
  const [aqi, setAqi] = useState<number | null>(null)
  const [mapCenter, setMapCenter] = useState({ lat: 20.5937, lng: 78.9629 })
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null)

  const { isLoaded } = useLoadScript({
    googleMapsApiKey: "AIzaSyB9Zwre3aq1kgbcJVRP-HwbyzbpsoEjqqE",
  })

  useEffect(() => {
    const name = localStorage.getItem("userName")
    if (name) {
      setUserName(name)
    }
  }, [])

  const [formData, setFormData] = useState({
    // Basic Details - REQUIRED
    age: "",
    gender: "",
    height_cm: "",
    weight_kg: "",
    // Vitals - REQUIRED
    systolic_bp: "",
    diastolic_bp: "",
    fasting_sugar: "",
    resting_hr: "",
    spo2: "",
    cholesterol: "",
    // Lifestyle - REQUIRED
    sleep_hours: "",
    exercise_level: "",
    stress_level: "",
    smoking: "0",
    alcohol: "",
    screen_time_hours: "",
    // OPTIONAL fields
    daily_steps: "",
    outside_food_per_week: "",
    tea_coffee_per_day: "",
    diet_type: "",
    // Work - OPTIONAL
    work_type: "",
    commute_hours: "",
    ac_exposure_hours: "",
    // Income & Location - OPTIONAL
    income: "",
    city: "",
    latitude: "",
    longitude: "",
  })

  useEffect(() => {
    if (formData.city && CITY_AQI_MAP[formData.city]) {
      const cityData = CITY_AQI_MAP[formData.city]
      setAqi(cityData.aqi)
      setMapCenter({ lat: cityData.lat, lng: cityData.lng })
      setMarkerPosition({ lat: cityData.lat, lng: cityData.lng })
      setFormData((prev) => ({
        ...prev,
        latitude: cityData.lat.toString(),
        longitude: cityData.lng.toString(),
      }))
    }
  }, [formData.city])

  const handleMapClick = async (e: any) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      setFormData((prev) => ({
        ...prev,
        latitude: lat.toString(),
        longitude: lng.toString(),
      }))

      const geocoder = new google.maps.Geocoder()
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const city = results[0].address_components.find((comp) => comp.types.includes("locality"))?.long_name || ""
          if (city && CITY_AQI_MAP[city]) {
            setAqi(CITY_AQI_MAP[city].aqi)
          } else {
            setAqi(100)
          }
        }
      })
    }
  }

  const handleNext = () => {
    if (step < totalSteps) setStep(step + 1)
  }

  const handlePrev = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = async () => {
    setIsAnalyzing(true)

    await new Promise((resolve) => setTimeout(resolve, 4500))

    try {
      const userId = localStorage.getItem("userId")
      if (!userId) {
        console.log("[v0] No userId found, redirecting to login")
        router.push("/login")
        return
      }

      const payload = {
        user_id: Number.parseInt(userId),
        name: userName,
        // Required fields
        age: Number.parseInt(formData.age),
        gender: formData.gender,
        height_cm: Number.parseFloat(formData.height_cm),
        weight_kg: Number.parseFloat(formData.weight_kg),
        systolic_bp: Number.parseFloat(formData.systolic_bp),
        diastolic_bp: Number.parseFloat(formData.diastolic_bp),
        fasting_sugar: Number.parseFloat(formData.fasting_sugar),
        resting_hr: Number.parseFloat(formData.resting_hr),
        spo2: Number.parseFloat(formData.spo2),
        cholesterol: Number.parseFloat(formData.cholesterol),
        sleep_hours: Number.parseFloat(formData.sleep_hours),
        exercise_level: Number.parseInt(formData.exercise_level),
        stress_level: Number.parseInt(formData.stress_level),
        smoking: Number.parseInt(formData.smoking),
        alcohol: Number.parseInt(formData.alcohol),
        screen_time_hours: Number.parseFloat(formData.screen_time_hours),
        // Optional fields
        income: formData.income ? Number.parseInt(formData.income) : null,
        city: formData.city || null,
        latitude: formData.latitude ? Number.parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? Number.parseFloat(formData.longitude) : null,
        work_type: formData.work_type || null,
        commute_hours: formData.commute_hours ? Number.parseFloat(formData.commute_hours) : null,
        ac_exposure_hours: formData.ac_exposure_hours ? Number.parseFloat(formData.ac_exposure_hours) : null,
        diet_type: formData.diet_type || null,
        daily_steps: formData.daily_steps ? Number.parseInt(formData.daily_steps) : null,
        tea_coffee_per_day: formData.tea_coffee_per_day ? Number.parseInt(formData.tea_coffee_per_day) : null,
        outside_food_per_week: formData.outside_food_per_week ? Number.parseInt(formData.outside_food_per_week) : null,
        aqi: aqi || null,
      }

      console.log("[v0] Creating twin with payload:", payload)
      const response = await fetch(`${API_BASE}/api/twin/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      console.log("[v0] Twin creation response:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Twin created successfully:", data)
        localStorage.setItem("twinId", data.id.toString())
        router.push("/dashboard")
      } else {
        const error = await response.json()
        console.log("[v0] Twin creation failed:", error)
        alert("Failed to create digital twin: " + JSON.stringify(error.detail || "Unknown error"))
      }
    } catch (error) {
      console.log("[v0] Network error creating twin:", error)
      alert("Network error. Please ensure your backend is running at http://127.0.0.1:8000")
    } finally {
      setIsAnalyzing(false)
    }
  }

  if (isAnalyzing) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-2 bg-card/80 backdrop-blur-lg glow-border">
          <CardContent className="p-8 space-y-6">
            <div className="flex justify-center">
              <ActivityIcon className="w-16 h-16 text-accent heartbeat-animation" />
            </div>
            <div className="space-y-3 text-center">
              <h3 className="text-2xl font-bold">Creating Your Digital Twin</h3>
              <div className="space-y-2 text-muted-foreground">
                <div className="flex items-center gap-2 justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                  <p>Analyzing your report...</p>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                  <p>Parsing medical data...</p>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                  <p>Formatting health metrics...</p>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <Check className="w-5 h-5 text-green-500" />
                  <p>Computing health scores...</p>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <ActivityIcon className="w-5 h-5 text-accent animate-pulse" />
                  <p>Storing in the model...</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-2 bg-card/80 backdrop-blur-lg shadow-2xl fade-in-up">
          <CardHeader className="space-y-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">Create Your Digital Twin</CardTitle>
              <span className="text-sm text-muted-foreground">
                Step {step} of {totalSteps}
              </span>
            </div>
            <Progress value={(step / totalSteps) * 100} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Basic Body Details */}
            {step === 1 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <UserIcon className="w-6 h-6 text-accent" />
                  Basic Body Details
                </h3>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    Age <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter your age (e.g., 25)"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <UserIcon className="w-4 h-4" />
                    Gender <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.gender}
                    onValueChange={(value) => setFormData({ ...formData, gender: value })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="male" id="male" />
                        <Label htmlFor="male">Male</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="female" id="female" />
                        <Label htmlFor="female">Female</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ActivityIcon className="w-4 h-4" />
                    Height (cm) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter height in cm (e.g., 170)"
                    value={formData.height_cm}
                    onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ActivityIcon className="w-4 h-4" />
                    Weight (kg) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="Enter weight in kg (e.g., 70)"
                    value={formData.weight_kg}
                    onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Vitals & Medical Parameters */}
            {step === 2 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <HeartbeatIcon className="w-6 h-6 text-accent" />
                  Vitals & Medical Parameters
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <HeartbeatIcon className="w-4 h-4" />
                      Systolic BP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 120"
                      value={formData.systolic_bp}
                      onChange={(e) => setFormData({ ...formData, systolic_bp: e.target.value })}
                      className="bg-background/50 backdrop-blur-sm"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-2 mb-2">
                      <HeartbeatIcon className="w-4 h-4" />
                      Diastolic BP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      type="number"
                      placeholder="e.g., 80"
                      value={formData.diastolic_bp}
                      onChange={(e) => setFormData({ ...formData, diastolic_bp: e.target.value })}
                      className="bg-background/50 backdrop-blur-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <StethoscopeIcon className="w-4 h-4" />
                    Fasting Sugar (mg/dL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 90"
                    value={formData.fasting_sugar}
                    onChange={(e) => setFormData({ ...formData, fasting_sugar: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <HeartbeatIcon className="w-4 h-4" />
                    Resting Heart Rate <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 70"
                    value={formData.resting_hr}
                    onChange={(e) => setFormData({ ...formData, resting_hr: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ActivityIcon className="w-4 h-4" />
                    SpO₂ (%) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 98"
                    value={formData.spo2}
                    onChange={(e) => setFormData({ ...formData, spo2: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <StethoscopeIcon className="w-4 h-4" />
                    Cholesterol (mg/dL) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 180"
                    value={formData.cholesterol}
                    onChange={(e) => setFormData({ ...formData, cholesterol: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Lifestyle & Habits */}
            {step === 3 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <RunningIcon className="w-6 h-6 text-accent" />
                  Lifestyle & Habits
                </h3>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <BedIcon className="w-4 h-4" />
                    Sleep Hours (per night) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., 7"
                    value={formData.sleep_hours}
                    onChange={(e) => setFormData({ ...formData, sleep_hours: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <RunningIcon className="w-4 h-4" />
                    Exercise Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.exercise_level}
                    onValueChange={(value) => setFormData({ ...formData, exercise_level: value })}
                  >
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select level (0-3)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - None</SelectItem>
                      <SelectItem value="1">1 - Light</SelectItem>
                      <SelectItem value="2">2 - Moderate</SelectItem>
                      <SelectItem value="3">3 - Heavy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <BrainIcon className="w-4 h-4" />
                    Stress Level <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.stress_level}
                    onValueChange={(value) => setFormData({ ...formData, stress_level: value })}
                  >
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select level (0-3)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Low</SelectItem>
                      <SelectItem value="1">1 - Moderate</SelectItem>
                      <SelectItem value="2">2 - High</SelectItem>
                      <SelectItem value="3">3 - Very High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <SmokingIcon className="w-4 h-4" />
                    Smoking <span className="text-destructive">*</span>
                  </Label>
                  <RadioGroup
                    value={formData.smoking}
                    onValueChange={(value) => setFormData({ ...formData, smoking: value })}
                  >
                    <div className="flex gap-4">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="0" id="no-smoking" />
                        <Label htmlFor="no-smoking">No</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="1" id="yes-smoking" />
                        <Label htmlFor="yes-smoking">Yes</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <PillIcon className="w-4 h-4" />
                    Alcohol Consumption <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.alcohol}
                    onValueChange={(value) => setFormData({ ...formData, alcohol: value })}
                  >
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select frequency (0-3)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 - Never</SelectItem>
                      <SelectItem value="1">1 - Occasionally</SelectItem>
                      <SelectItem value="2">2 - Regularly</SelectItem>
                      <SelectItem value="3">3 - Frequently</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MonitorIcon className="w-4 h-4" />
                    Screen Time (hours/day) <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., 4"
                    value={formData.screen_time_hours}
                    onChange={(e) => setFormData({ ...formData, screen_time_hours: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <RunningIcon className="w-4 h-4" />
                    Daily Steps (optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 10000"
                    value={formData.daily_steps}
                    onChange={(e) => setFormData({ ...formData, daily_steps: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ForkKnifeIcon className="w-4 h-4" />
                    Outside Food (times/week, optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 3"
                    value={formData.outside_food_per_week}
                    onChange={(e) => setFormData({ ...formData, outside_food_per_week: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <PillIcon className="w-4 h-4" />
                    Tea/Coffee (cups/day, optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 2"
                    value={formData.tea_coffee_per_day}
                    onChange={(e) => setFormData({ ...formData, tea_coffee_per_day: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ForkKnifeIcon className="w-4 h-4" />
                    Diet Type (optional)
                  </Label>
                  <Select
                    value={formData.diet_type}
                    onValueChange={(value) => setFormData({ ...formData, diet_type: value })}
                  >
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="veg">Vegetarian</SelectItem>
                      <SelectItem value="egg">Eggitarian</SelectItem>
                      <SelectItem value="nonveg">Non-Vegetarian</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 4: Work & Environment */}
            {step === 4 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <BriefcaseIcon className="w-6 h-6 text-accent" />
                  Work & Environment
                </h3>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <BriefcaseIcon className="w-4 h-4" />
                    Work Type (optional)
                  </Label>
                  <Select
                    value={formData.work_type}
                    onValueChange={(value) => setFormData({ ...formData, work_type: value })}
                  >
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select work type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desk">Desk Job</SelectItem>
                      <SelectItem value="field">Field Work</SelectItem>
                      <SelectItem value="mixed">Mixed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ActivityIcon className="w-4 h-4" />
                    Commute Hours (per day, optional)
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., 2"
                    value={formData.commute_hours}
                    onChange={(e) => setFormData({ ...formData, commute_hours: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <ActivityIcon className="w-4 h-4" />
                    AC Exposure (hours/day, optional)
                  </Label>
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="e.g., 8"
                    value={formData.ac_exposure_hours}
                    onChange={(e) => setFormData({ ...formData, ac_exposure_hours: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Income & Location */}
            {step === 5 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <DollarIcon className="w-6 h-6 text-accent" />
                  Income & Location
                </h3>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <DollarIcon className="w-4 h-4" />
                    Annual Income (optional)
                  </Label>
                  <Input
                    type="number"
                    placeholder="e.g., 500000"
                    value={formData.income}
                    onChange={(e) => setFormData({ ...formData, income: e.target.value })}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    City (optional)
                  </Label>
                  <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                    <SelectTrigger className="bg-background/50 backdrop-blur-sm">
                      <SelectValue placeholder="Select your city" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mumbai">Mumbai</SelectItem>
                      <SelectItem value="Delhi">Delhi</SelectItem>
                      <SelectItem value="Bangalore">Bangalore</SelectItem>
                      <SelectItem value="Kolkata">Kolkata</SelectItem>
                      <SelectItem value="Chennai">Chennai</SelectItem>
                      <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      <SelectItem value="Pune">Pune</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {aqi !== null && (
                  <div className="p-4 bg-accent/10 border border-accent rounded-lg">
                    <p className="text-sm font-medium">
                      Estimated AQI: <span className="text-accent font-bold">{aqi}</span>
                    </p>
                  </div>
                )}

                <div>
                  <Label className="flex items-center gap-2 mb-2">
                    <MapPinIcon className="w-4 h-4" />
                    Location Picker (Click on map)
                  </Label>
                  {isLoaded && (
                    <div className="h-[400px] rounded-lg overflow-hidden border-2 border-border">
                      <GoogleMap
                        mapContainerStyle={{ width: "100%", height: "100%" }}
                        center={mapCenter}
                        zoom={5}
                        onClick={handleMapClick}
                      >
                        {markerPosition && <Marker position={markerPosition} />}
                      </GoogleMap>
                    </div>
                  )}
                  {formData.latitude && formData.longitude && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Selected: {Number.parseFloat(formData.latitude).toFixed(4)},{" "}
                      {Number.parseFloat(formData.longitude).toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Step 6: Reports (Optional) */}
            {step === 6 && (
              <div className="space-y-6 fade-in-up">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <StethoscopeIcon className="w-6 h-6 text-accent" />
                  Medical Reports (Optional)
                </h3>

                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center space-y-4">
                  <StethoscopeIcon className="w-12 h-12 text-muted-foreground mx-auto" />
                  <div>
                    <p className="text-sm text-muted-foreground">Drop your recent medical reports here</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      This is optional and will be analyzed for insights
                    </p>
                  </div>
                  <Button type="button" variant="outline">
                    Browse Files
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center">
                  You can skip this step and create your digital twin without reports
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrev}
                  className="flex-1 bg-transparent"
                  disabled={isLoading}
                >
                  Previous
                </Button>
              )}
              {step < totalSteps && (
                <Button type="button" onClick={handleNext} className="flex-1 glow-border" disabled={isLoading}>
                  {isLoading ? "Loading..." : "Next"}
                </Button>
              )}
              {step === totalSteps && (
                <Button type="button" onClick={handleSubmit} className="flex-1 glow-border">
                  Create Digital Twin
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
