"use client"

import { useState } from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { ActivityIcon } from "@/components/medical-icons"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Gauge } from "@/components/ui/gauge"

const API_BASE = "http://127.0.0.1:8000"

export default function SimulationPage() {
  const [years, setYears] = useState(10)
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [lifestyle, setLifestyle] = useState({
    increaseExercise: false,
    reduceSmoking: false,
    betterSleep: false,
    dietImprovement: false,
  })
  const [environment, setEnvironment] = useState({
    higherPollution: false,
    workStress: false,
    noiseExposure: false,
  })

  const handleRunSimulation = async () => {
    setIsRunning(true)

    try {
      const userId = localStorage.getItem("userId")
      const twinId = localStorage.getItem("twinId")

      if (!userId || !twinId) {
        alert("Please login and create a digital twin first")
        setIsRunning(false)
        return
      }

      const response = await fetch(`${API_BASE}/api/simulation/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(userId),
          twin_id: Number(twinId),
          scenario_name: "future_health_simulation",
          duration_years: years,
          changes: {
            increase_exercise: lifestyle.increaseExercise ? 1 : 0,
            reduce_smoking: lifestyle.reduceSmoking ? 1 : 0,
            better_sleep: lifestyle.betterSleep ? 1 : 0,
            diet_improvement: lifestyle.dietImprovement ? 1 : 0,
            higher_pollution: environment.higherPollution ? 1 : 0,
            work_stress: environment.workStress ? 1 : 0,
            noise_exposure: environment.noiseExposure ? 1 : 0,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Raw API Response:", data)

      // Backend returns: result_summary = {summary: {...}, curves: [...]}
      // Curves contain: heart_score, mental_stress_score, organ_load_score, year
      if (data.result_summary && data.result_summary.curves) {
        const mappedTimeline = data.result_summary.curves.map((point: any) => ({
          year: point.year || 0,
          heart: Math.round((point.heart_score || 0.5) * 100), // Convert 0-1 to 0-100
          mental: Math.round((point.mental_stress_score || 0.5) * 100),
          organ: Math.round((point.organ_load_score || 0.5) * 100),
        }))

        const finalState = data.result_summary.summary?.final_state || {}
        const riskLevel = data.result_summary.summary?.risk_level || "safe"

        setResults({
          timeline: mappedTimeline,
          final_organ_load: Math.round((finalState.organ_load_score || 0) * 100),
          risk_level: riskLevel,
        })

        console.log("[v0] Mapped Results:", {
          timeline: mappedTimeline,
          final_organ_load: Math.round((finalState.organ_load_score || 0) * 100),
          risk_level: riskLevel,
        })
      } else {
        console.error("[v0] Invalid response structure:", data)
        alert("Invalid simulation response. Check backend.")
      }
    } catch (error) {
      console.error("[v0] Simulation failed:", error)
      alert("Simulation failed. Please check if backend is running.")
    } finally {
      setIsRunning(false)
    }
  }

  const getLastTimelineValue = (key: string, defaultValue = 50) => {
    if (!results?.timeline || !Array.isArray(results.timeline) || results.timeline.length === 0) {
      return defaultValue
    }
    const lastItem = results.timeline[results.timeline.length - 1]
    return lastItem?.[key] ?? defaultValue
  }

  const hasResults = results && results.timeline && Array.isArray(results.timeline) && results.timeline.length > 0

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8 fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Future Health Simulation</h1>
          <p className="text-muted-foreground text-lg">What will happen to you?</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Simulation Controls */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up">
              <CardHeader>
                <CardTitle>Simulation Period</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Number of Years</Label>
                  <Input
                    type="number"
                    min="1"
                    max="30"
                    value={years}
                    onChange={(e) => setYears(Number.parseInt(e.target.value) || 10)}
                    className="bg-background/50 backdrop-blur-sm"
                  />
                  <div className="flex gap-2 mt-3">
                    {[5, 10, 20].map((y) => (
                      <Button key={y} variant="outline" size="sm" onClick={() => setYears(y)} className="flex-1">
                        {y}y
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up" style={{ animationDelay: "0.1s" }}>
              <CardHeader>
                <CardTitle>Lifestyle Changes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="exercise"
                    checked={lifestyle.increaseExercise}
                    onCheckedChange={(checked) => setLifestyle({ ...lifestyle, increaseExercise: checked as boolean })}
                  />
                  <Label htmlFor="exercise" className="cursor-pointer">
                    💪 Increase Exercise
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smoking"
                    checked={lifestyle.reduceSmoking}
                    onCheckedChange={(checked) => setLifestyle({ ...lifestyle, reduceSmoking: checked as boolean })}
                  />
                  <Label htmlFor="smoking" className="cursor-pointer">
                    🚭 Reduce Smoking
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sleep"
                    checked={lifestyle.betterSleep}
                    onCheckedChange={(checked) => setLifestyle({ ...lifestyle, betterSleep: checked as boolean })}
                  />
                  <Label htmlFor="sleep" className="cursor-pointer">
                    😴 Better Sleep
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="diet"
                    checked={lifestyle.dietImprovement}
                    onCheckedChange={(checked) => setLifestyle({ ...lifestyle, dietImprovement: checked as boolean })}
                  />
                  <Label htmlFor="diet" className="cursor-pointer">
                    🥗 Diet Improvement
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up" style={{ animationDelay: "0.2s" }}>
              <CardHeader>
                <CardTitle>Environmental Factors</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="pollution"
                    checked={environment.higherPollution}
                    onCheckedChange={(checked) =>
                      setEnvironment({ ...environment, higherPollution: checked as boolean })
                    }
                  />
                  <Label htmlFor="pollution" className="cursor-pointer">
                    🏭 Higher Pollution
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="stress"
                    checked={environment.workStress}
                    onCheckedChange={(checked) => setEnvironment({ ...environment, workStress: checked as boolean })}
                  />
                  <Label htmlFor="stress" className="cursor-pointer">
                    😰 Work Stress
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noise"
                    checked={environment.noiseExposure}
                    onCheckedChange={(checked) => setEnvironment({ ...environment, noiseExposure: checked as boolean })}
                  />
                  <Label htmlFor="noise" className="cursor-pointer">
                    🔊 Noise Exposure
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Button onClick={handleRunSimulation} disabled={isRunning} className="w-full py-6 text-lg glow-border">
              {isRunning ? "Running Simulation..." : "Run Simulation"}
            </Button>
          </div>

          {/* Results */}
          <div className="lg:col-span-2 space-y-6">
            {isRunning && (
              <Card className="border-2 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <ActivityIcon className="w-16 h-16 mx-auto mb-4 text-accent heartbeat-animation" />
                  <p className="text-xl font-medium">Analyzing your future health...</p>
                </CardContent>
              </Card>
            )}

            {!isRunning && hasResults && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up">
                    <CardContent className="p-6 text-center">
                      <Gauge
                        value={getLastTimelineValue("heart", 75)}
                        max={100}
                        label="Heart Health"
                        color="oklch(0.6 0.2 25)"
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up" style={{ animationDelay: "0.05s" }}>
                    <CardContent className="p-6 text-center">
                      <Gauge
                        value={getLastTimelineValue("mental", 75)}
                        max={100}
                        label="Mental Health"
                        color="oklch(0.6 0.15 240)"
                      />
                    </CardContent>
                  </Card>

                  <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up" style={{ animationDelay: "0.1s" }}>
                    <CardContent className="p-6 text-center">
                      <Gauge
                        value={100 - getLastTimelineValue("organ", 25)}
                        max={100}
                        label="Organ Health"
                        color="oklch(0.75 0.15 85)"
                      />
                    </CardContent>
                  </Card>
                </div>

                <Card className="border-2 bg-card/80 backdrop-blur-sm fade-in-up" style={{ animationDelay: "0.15s" }}>
                  <CardHeader>
                    <CardTitle>Year-wise Health Projection</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={results.timeline}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                        <XAxis dataKey="year" label={{ value: "Years", position: "insideBottom", offset: -5 }} />
                        <YAxis label={{ value: "Health Score", angle: -90, position: "insideLeft" }} />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="heart"
                          stroke="#ef4444"
                          strokeWidth={3}
                          name="Heart Health"
                          animationDuration={2000}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mental"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          name="Mental Health"
                          animationDuration={2000}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="organ"
                          stroke="#eab308"
                          strokeWidth={3}
                          name="Organ Load"
                          animationDuration={2000}
                          dot={{ r: 5 }}
                          activeDot={{ r: 8 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card
                  className={`border-2 bg-card/80 backdrop-blur-sm fade-in-up ${
                    results.risk_level === "critical"
                      ? "border-destructive shadow-lg shadow-destructive/20"
                      : results.risk_level === "warning"
                        ? "border-warning shadow-lg shadow-warning/20"
                        : "border-success shadow-lg shadow-success/20"
                  }`}
                  style={{ animationDelay: "0.2s" }}
                >
                  <CardHeader>
                    <CardTitle>Final Health Prediction</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <span className="font-medium">Final Organ Load Score</span>
                      <span className="text-2xl font-bold text-warning">{results.final_organ_load || 0}</span>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                      <span className="font-medium">Risk Level</span>
                      <span
                        className={`text-2xl font-bold uppercase ${
                          results.risk_level === "critical"
                            ? "text-destructive"
                            : results.risk_level === "warning"
                              ? "text-warning"
                              : "text-success"
                        }`}
                      >
                        {results.risk_level || "SAFE"}
                      </span>
                    </div>
                    <div
                      className={`p-6 rounded-lg border-2 ${
                        results.risk_level === "critical"
                          ? "border-destructive bg-destructive/10"
                          : results.risk_level === "warning"
                            ? "border-warning bg-warning/10"
                            : "border-success bg-success/10"
                      }`}
                    >
                      <p className="text-lg font-medium text-center">
                        {results.risk_level === "critical" &&
                          `At current lifestyle, your ${years}-year risk is CRITICAL. Immediate lifestyle changes recommended.`}
                        {results.risk_level === "warning" &&
                          `At current lifestyle, your ${years}-year risk is MODERATE. Consider lifestyle improvements.`}
                        {(!results.risk_level || results.risk_level === "safe") &&
                          `At current lifestyle, your ${years}-year risk is LOW. Keep up the good work!`}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}

            {!isRunning && !hasResults && (
              <Card className="border-2 bg-card/80 backdrop-blur-sm">
                <CardContent className="p-12 text-center">
                  <ActivityIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-xl font-medium text-muted-foreground">
                    Configure your simulation parameters and click "Run Simulation" to see your future health projection
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
