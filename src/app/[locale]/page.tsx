"use client";

import { useState } from "react";

type AnalyzeResponse = {
  bmi: number;
  category: string;
  analysis: string;
  error?: string;
};

export default function HomePage() {
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");

  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleCalculate() {
    try {
      setLoading(true);

      const response = await fetch("/api/bmi/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          height: Number(height),
          weight: Number(weight),
          country: "United States",
          language: "English",
          gender: "Male",
          age: 28,
        }),
      });

      const data = (await response.json()) as AnalyzeResponse;

      if (!response.ok) {
        setResult({
          bmi: 0,
          category: "",
          analysis: "",
          error:
            typeof data.error === "string"
              ? data.error
              : `Request failed (${response.status})`,
        });
        return;
      }

      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">
        AI BMI Calculator
      </h1>

      {/* Height */}
      <div className="mb-4">
        <label className="block mb-2">
          Height (cm)
        </label>

        <input
          type="number"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full border rounded-lg p-3"
          placeholder="175"
        />
      </div>

      {/* Weight */}
      <div className="mb-4">
        <label className="block mb-2">
          Weight (kg)
        </label>

        <input
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full border rounded-lg p-3"
          placeholder="70"
        />
      </div>

      {/* Button */}
      <button
        onClick={handleCalculate}
        disabled={loading}
        className="bg-black text-white px-6 py-3 rounded-lg"
      >
        {loading ? "Analyzing..." : "Calculate BMI"}
      </button>

      {/* Result */}
      {result && (
        <div className="mt-8 border rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-4">
            Result
          </h2>

          {result.error ? (
            <p className="text-red-600">{result.error}</p>
          ) : (
            <>
              <p className="mb-2">
                <strong>BMI:</strong> {result.bmi}
              </p>

              <p className="mb-4">
                <strong>Category:</strong>{" "}
                {result.category}
              </p>

              <div>
                <h3 className="font-bold mb-2">
                  AI Analysis
                </h3>

                <p className="leading-7">
                  {result.analysis}
                </p>
              </div>
            </>
          )}
        </div>
      )}
    </main>
  );
}