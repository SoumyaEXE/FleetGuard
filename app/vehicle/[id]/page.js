"use client";

import { useState, useEffect, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
	doc,
	addDoc,
	collection,
	serverTimestamp,
	updateDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../lib/firebase";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Link from "next/link";

// Initialize Gemini - API key from environment variable
const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

export default function VehicleInspectionPage({ params }) {
	const { id: vehicleId } = use(params);
	const searchParams = useSearchParams();
	const vehicleName = searchParams.get("name");
	const vehiclePlate = searchParams.get("plate");
	const router = useRouter();

	const [user, setUser] = useState(null);
	const [loading, setLoading] = useState(false);
	const [loadingStep, setLoadingStep] = useState("");

	// Form State
	const [formData, setFormData] = useState({
		vehicleId: vehicleId,
		vehicleName: vehicleName || "",
		licensePlate: vehiclePlate || "",
		sounds: {
			unusualEngineSound: false,
			soundTypes: [], // knocking, ticking, rattling, whining
			brakingSound: { exists: false, description: "" },
			turningSound: { exists: false, description: "" },
		},
		vibrations: {
			steeringWheelVibration: false,
			highSpeedShaking: false,
			brakingVibration: false,
		},
		smells: {
			burningSmell: false,
			fuelSmell: false,
			rottenEggSmell: false,
			coolantSmell: false,
		},
		leaks: {
			oilSpots: false,
			coolantLeak: false,
			waterFromAC: false,
			brakeFluidLeak: false,
		},
		drivingBehavior: {
			reducedPower: false,
			pulling: { exists: false, direction: "" },
			gearShiftingDifficulty: false,
			engineStalling: false,
			hardSteering: false,
			overheating: false,
		},
		dashboardWarnings: {
			checkEngineLight: false,
			absLight: false,
			oilPressureLight: false,
			batteryLight: false,
			temperatureWarning: false,
			tpmsWarning: false,
		},
		tyresBrakes: {
			unevenTyreWear: false,
			lowPressureOften: false,
			squeakyBrakes: false,
			brakePedalFeel: "normal",
		},
		electricalIssues: {
			dimHeadlights: false,
			acNotCooling: false,
			slowPowerWindows: false,
			batteryDyingOften: false,
			slowStart: false,
		},
		fluidsCondition: {
			lowEngineOil: false,
			blackOilColor: false,
			lowCoolant: false,
			lowBrakeFluid: false,
		},
		serviceHistory: {
			lastServiceDate: "",
			lastOilChange: "",
			lastBrakePadChange: "",
			lastTyreChange: "",
			lastBatteryChange: "",
		},
		evSpecific: {
			isEV: false,
			rangeDroppingFast: false,
			chargingSlow: false,
			batteryHeating: false,
			inverterNoise: false,
		},
	});

	const [files, setFiles] = useState({
		exterior: [],
		problemAreas: [],
		documents: [],
	});

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
			if (!currentUser) {
				router.push("/login");
			} else {
				setUser(currentUser);
			}
		});
		return () => unsubscribe();
	}, [router]);

	const updateState = (section, field, value) => {
		setFormData((prev) => ({
			...prev,
			[section]: {
				...prev[section],
				[field]: value,
			},
		}));
	};

	const toggleArrayItem = (section, field, item) => {
		setFormData((prev) => {
			const currentArray = prev[section][field] || [];
			const newArray = currentArray.includes(item)
				? currentArray.filter((i) => i !== item)
				: [...currentArray, item];
			return {
				...prev,
				[section]: {
					...prev[section],
					[field]: newArray,
				},
			};
		});
	};

	const handleFileChange = (category, e) => {
		if (e.target.files) {
			setFiles((prev) => ({
				...prev,
				[category]: Array.from(e.target.files),
			}));
		}
	};

	const uploadPhotosToStorage = async (vehicleId) => {
		const uploadedUrls = {
			exterior: [],
			problemAreas: [],
			documents: [],
		};

		const uploadFile = async (file, path) => {
			const storageRef = ref(storage, path);
			await uploadBytes(storageRef, file);
			return await getDownloadURL(storageRef);
		};

		for (const file of files.exterior) {
			const url = await uploadFile(
				file,
				`vehicles/${vehicleId}/exterior/${Date.now()}_${file.name}`
			);
			uploadedUrls.exterior.push(url);
		}
		for (const file of files.problemAreas) {
			const url = await uploadFile(
				file,
				`vehicles/${vehicleId}/problems/${Date.now()}_${file.name}`
			);
			uploadedUrls.problemAreas.push(url);
		}
		for (const file of files.documents) {
			const url = await uploadFile(
				file,
				`vehicles/${vehicleId}/documents/${Date.now()}_${file.name}`
			);
			uploadedUrls.documents.push(url);
		}

		return uploadedUrls;
	};

	const analyzeVehicleWithGemini = async (completeData) => {
		const prompt = `
      You are an expert automotive diagnostic AI assistant. Analyze the following vehicle inspection data and provide a comprehensive diagnostic report.

      VEHICLE INFORMATION:
      - Vehicle: ${completeData.vehicleName}
      - License Plate: ${completeData.licensePlate}
      - Inspection Date: ${new Date().toISOString().split('T')[0]}

      INSPECTION DATA:
      ${JSON.stringify(completeData, null, 2)}

      ANALYZE AND PROVIDE:
      1. CRITICAL ISSUES (Immediate attention required - safety concerns) - Include recommended repair timeline
      2. UPCOMING MAINTENANCE (Attention needed soon - not urgent) - Include suggested dates
      3. ROUTINE/PREVENTIVE MAINTENANCE (Future planning)
      4. SYSTEM HEALTH BREAKDOWN (Engine, Brakes, Electrical, Fluids, Steering, EV)
      5. OVERALL VEHICLE HEALTH SCORE (0-100)
      6. COST SUMMARY (Immediate, Upcoming, Future in INR)
      7. AI INSIGHTS & RECOMMENDATIONS
      8. PRIORITY RANKING
      9. SUGGESTED REPAIR DATE (Based on severity: CRITICAL = 1 day, HIGH = 3 days, MEDIUM = 7 days, LOW = 14 days)

      IMPORTANT: For each critical issue, suggest a specific repair timeline (e.g., "Within 24 hours", "Within 3 days", "Within 1 week").
      Consider the overall health score when suggesting repair urgency:
      - Score < 40: CRITICAL priority, immediate repair needed
      - Score 40-60: HIGH priority, repair within 3 days
      - Score 60-80: MEDIUM priority, repair within 1 week
      - Score > 80: LOW priority, routine maintenance

      RESPONSE FORMAT:
      Return ONLY valid JSON with this structure:
      {
        "overallHealthScore": number,
        "vehicleSummary": "string",
        "suggestedRepairDate": "YYYY-MM-DD (based on most critical issue)",
        "repairUrgency": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        "criticalIssues": [{ 
          "title": string, 
          "severity": "CRITICAL"|"URGENT"|"HIGH", 
          "description": string, 
          "reasoning": string, 
          "estimatedCost": { "min": number, "max": number, "currency": "INR" }, 
          "timeline": string (e.g., "Within 24 hours", "Within 3 days"),
          "affectedComponents": [string], 
          "priority": number 
        }],
        "upcomingMaintenance": [...],
        "routineMaintenance": [...],
        "systemHealth": {
          "engine": { "score": number, "status": string, "issues": [string], "recommendations": [string] },
          "brakes": { ... },
          "electrical": { ... },
          "fluids": { ... },
          "steering": { ... },
          "ev": { ... }
        },
        "costSummary": { 
          "immediate": { "min": number, "max": number }, 
          "upcoming": { "min": number, "max": number }, 
          "future": { "min": number, "max": number }, 
          "total": { "min": number, "max": number } 
        },
        "aiInsights": [{ "type": string, "title": string, "description": string }],
        "priorityRanking": [{ "rank": number, "issueTitle": string, "category": string }]
      }
    `;

		const result = await model.generateContent(prompt);
		const response = await result.response;
		const text = response.text();
		const cleanedText = text
			.replace(/```json\n?/g, "")
			.replace(/```\n?/g, "")
			.trim();
		return JSON.parse(cleanedText);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			setLoadingStep("Uploading photos...");
			const photoUrls = await uploadPhotosToStorage(vehicleId);

			const completeData = {
				...formData,
				photos: photoUrls,
				submittedAt: new Date().toISOString(),
				userId: user.uid,
			};

			setLoadingStep("AI analyzing vehicle data...");
			const analysisResult = await analyzeVehicleWithGemini(completeData);

			setLoadingStep("Saving report...");
			const inspectionRef = await addDoc(collection(db, "inspections"), {
				userId: user.uid,
				vehicleId: vehicleId,
				formData: completeData,
				analysis: analysisResult,
				photos: photoUrls,
				submittedAt: serverTimestamp(),
				analyzedAt: serverTimestamp(),
				status: "completed",
				vehicleName: formData.vehicleName,
				licensePlate: formData.licensePlate,
			});

			await updateDoc(doc(db, "vehicles", vehicleId), {
				lastInspection: serverTimestamp(),
				lastInspectionId: inspectionRef.id,
				lastHealthScore: analysisResult.overallHealthScore,
			});

			router.push(`/analysis/${inspectionRef.id}`);
		} catch (error) {
			console.error("Error submitting inspection:", error);

			// Check for rate limit error (429)
			if (
				error.message?.includes("429") ||
				error.message?.includes("quota") ||
				error.message?.includes("rate")
			) {
				alert(
					"⚠️ API Rate Limit Exceeded\n\nThe AI analysis service is temporarily unavailable due to high usage. Please try again in a few minutes.\n\nIf this persists, consider:\n1. Waiting 1-2 minutes before retrying\n2. Checking your Gemini API quota at ai.google.dev"
				);
			} else {
				alert("An error occurred: " + error.message);
			}
		} finally {
			setLoading(false);
			setLoadingStep("");
		}
	};

	return (
		<div className="vehicle-inspection-page theme-logistics">
			<div className="main-container">
				{/* Left Panel: Visual & Preview */}
				<div className="left-panel">
					<div className="overlay"></div>
					<div className="brand-mark">
						<i className="fa-solid fa-truck-fast"></i>
						<span>FLEETGUARD</span>
					</div>
					<div className="vehicle-preview">
						<div className="animation-container">
							<div className="country-wrap">
								<div className="sun"></div>
								<div className="grass"></div>
								<div className="street">
									<div className="car">
										<div className="car-body">
											<div className="car-top-back">
												<div className="back-curve"></div>
											</div>
											<div className="car-gate"></div>
											<div className="car-top-front">
												<div className="wind-sheild"></div>
											</div>
											<div className="bonet-front"></div>
											<div className="stepney"></div>
										</div>
										<div className="boundary-tyre-cover">
											<div className="boundary-tyre-cover-back-bottom"></div>
											<div className="boundary-tyre-cover-inner"></div>
										</div>
										<div className="tyre-cover-front">
											<div className="boundary-tyre-cover-inner-front"></div>
										</div>
										<div className="base-axcel"></div>
										<div className="front-bumper"></div>
										<div className="tyre">
											<div className="gap"></div>
										</div>
										<div className="tyre front">
											<div className="gap"></div>
										</div>
										<div className="car-shadow"></div>
									</div>
								</div>
								<div className="street-stripe"></div>
								<div className="hill"></div>
							</div>
						</div>

						<div className="preview-details asymmetric-card">
							<h3>Logistics Fleet Support</h3>
							<p>
								Vehicle: <strong>{vehicleName}</strong>
							</p>
							<p>
								Plate: <strong>{vehiclePlate}</strong>
							</p>
							<p>
								Status: <span className="status-badge">OnDuty</span>
							</p>
						</div>
					</div>
					<div className="decorative-line"></div>
				</div>

				{/* Right Panel: Form */}
				<div className="right-panel">
					<header className="form-header glass-effect">
						<h1>Vehicle Inspection</h1>
						<p>Complete the comprehensive diagnostic checklist.</p>
					</header>

					<form className="logistics-form" onSubmit={handleSubmit}>
						{/* Section 1: Sound Analysis */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-volume-high section-icon"></i>
								<h2>Sound Analysis</h2>
							</div>
							<div className="toggle-wrapper">
								<label>Any unusual engine sound?</label>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={formData.sounds.unusualEngineSound}
										onChange={(e) =>
											updateState(
												"sounds",
												"unusualEngineSound",
												e.target.checked
											)
										}
									/>
									<span className="slider"></span>
								</label>
							</div>
							<div className="checkbox-grid">
								{["knocking", "ticking", "rattling", "whining"].map((type) => (
									<div className="checkbox-group" key={type}>
										<input
											type="checkbox"
											id={`sound-${type}`}
											checked={formData.sounds.soundTypes.includes(type)}
											onChange={() =>
												toggleArrayItem("sounds", "soundTypes", type)
											}
										/>
										<label htmlFor={`sound-${type}`}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</label>
									</div>
								))}
							</div>
							<div className="input-grid" style={{ marginTop: "1.5rem" }}>
								<div className="input-group">
									<select
										value={formData.sounds.brakingSound.exists ? "yes" : "no"}
										onChange={(e) =>
											updateState("sounds", "brakingSound", {
												...formData.sounds.brakingSound,
												exists: e.target.value === "yes",
											})
										}
									>
										<option value="no">No</option>
										<option value="yes">Yes</option>
									</select>
									<label>Sound while braking?</label>
								</div>
								<div className="input-group">
									<select
										value={formData.sounds.turningSound.exists ? "yes" : "no"}
										onChange={(e) =>
											updateState("sounds", "turningSound", {
												...formData.sounds.turningSound,
												exists: e.target.value === "yes",
											})
										}
									>
										<option value="no">No</option>
										<option value="yes">Yes</option>
									</select>
									<label>Sound while turning?</label>
								</div>
							</div>
						</div>

						{/* Section 2: Vibrations */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-wave-square section-icon"></i>
								<h2>Vibrations</h2>
							</div>
							<div className="toggle-wrapper">
								<label>Steering wheel vibration?</label>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={formData.vibrations.steeringWheelVibration}
										onChange={(e) =>
											updateState(
												"vibrations",
												"steeringWheelVibration",
												e.target.checked
											)
										}
									/>
									<span className="slider"></span>
								</label>
							</div>
							<div className="toggle-wrapper">
								<label>Car shaking at high speed?</label>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={formData.vibrations.highSpeedShaking}
										onChange={(e) =>
											updateState(
												"vibrations",
												"highSpeedShaking",
												e.target.checked
											)
										}
									/>
									<span className="slider"></span>
								</label>
							</div>
							<div className="toggle-wrapper">
								<label>Vibration when braking?</label>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={formData.vibrations.brakingVibration}
										onChange={(e) =>
											updateState(
												"vibrations",
												"brakingVibration",
												e.target.checked
											)
										}
									/>
									<span className="slider"></span>
								</label>
							</div>
						</div>

						{/* Section 3: Smells */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-wind section-icon"></i>
								<h2>Smells</h2>
							</div>
							<div className="checkbox-grid">
								{[
									{ key: "burningSmell", label: "Burning smell" },
									{ key: "fuelSmell", label: "Fuel smell" },
									{ key: "rottenEggSmell", label: "Rotten egg smell" },
									{ key: "coolantSmell", label: "Sweet coolant smell" },
								].map((item) => (
									<div className="checkbox-group" key={item.key}>
										<input
											type="checkbox"
											id={item.key}
											checked={formData.smells[item.key]}
											onChange={(e) =>
												updateState("smells", item.key, e.target.checked)
											}
										/>
										<label htmlFor={item.key}>{item.label}</label>
									</div>
								))}
							</div>
						</div>

						{/* Section 4: Leaks */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-droplet section-icon"></i>
								<h2>Leaks</h2>
							</div>
							{[
								{ key: "oilSpots", label: "Oil spots under car" },
								{ key: "coolantLeak", label: "Coolant (green/pink)" },
								{ key: "waterFromAC", label: "Water (AC normal)" },
								{ key: "brakeFluidLeak", label: "Brake fluid leaks" },
							].map((item) => (
								<div className="toggle-wrapper" key={item.key}>
									<label>{item.label}</label>
									<label className="toggle-switch">
										<input
											type="checkbox"
											checked={formData.leaks[item.key]}
											onChange={(e) =>
												updateState("leaks", item.key, e.target.checked)
											}
										/>
										<span className="slider"></span>
									</label>
								</div>
							))}
						</div>

						{/* Section 5: Driving Behavior */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-gamepad section-icon"></i>
								<h2>Driving Behavior</h2>
							</div>
							<div className="checkbox-grid">
								{[
									{ key: "reducedPower", label: "Reduced pickup/power" },
									{
										key: "gearShiftingDifficulty",
										label: "Gear shifting difficulty",
									},
									{ key: "engineStalling", label: "Engine stalling" },
									{ key: "hardSteering", label: "Hard steering" },
									{ key: "overheating", label: "Car overheating" },
								].map((item) => (
									<div className="checkbox-group" key={item.key}>
										<input
											type="checkbox"
											id={item.key}
											checked={formData.drivingBehavior[item.key]}
											onChange={(e) =>
												updateState(
													"drivingBehavior",
													item.key,
													e.target.checked
												)
											}
										/>
										<label htmlFor={item.key}>{item.label}</label>
									</div>
								))}
							</div>
							<div className="input-group" style={{ marginTop: "1rem" }}>
								<select
									value={formData.drivingBehavior.pulling.direction || ""}
									onChange={(e) =>
										updateState("drivingBehavior", "pulling", {
											exists: !!e.target.value,
											direction: e.target.value,
										})
									}
								>
									<option value="">None</option>
									<option value="left">Left</option>
									<option value="right">Right</option>
								</select>
								<label>Car pulling left/right</label>
							</div>
						</div>

						{/* Section 6: Dashboard & Warnings */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-gauge-high section-icon"></i>
								<h2>Dashboard & Warnings</h2>
							</div>
							{[
								{ key: "checkEngineLight", label: "Check engine light" },
								{ key: "absLight", label: "ABS light" },
								{ key: "oilPressureLight", label: "Oil pressure light" },
								{ key: "batteryLight", label: "Battery light" },
								{ key: "temperatureWarning", label: "Temperature warning" },
								{ key: "tpmsWarning", label: "TPMS (Tyre pressure)" },
							].map((item) => (
								<div className="status-indicator-group" key={item.key}>
									<label>{item.label}</label>
									<button
										type="button"
										className={`status-btn ${
											formData.dashboardWarnings[item.key] ? "active" : ""
										}`}
										onClick={() =>
											updateState(
												"dashboardWarnings",
												item.key,
												!formData.dashboardWarnings[item.key]
											)
										}
									>
										{formData.dashboardWarnings[item.key] ? "ON" : "OFF"}
									</button>
								</div>
							))}
						</div>

						{/* Section 7: Tyres & Brakes */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-circle-notch section-icon"></i>
								<h2>Tyres & Brakes</h2>
							</div>
							{[
								{ key: "unevenTyreWear", label: "Uneven tyre wear" },
								{ key: "lowPressureOften", label: "Low tyre pressure often" },
								{ key: "squeakyBrakes", label: "Squeaky brakes" },
							].map((item) => (
								<div className="toggle-wrapper" key={item.key}>
									<label>{item.label}</label>
									<label className="toggle-switch">
										<input
											type="checkbox"
											checked={formData.tyresBrakes[item.key]}
											onChange={(e) =>
												updateState("tyresBrakes", item.key, e.target.checked)
											}
										/>
										<span className="slider"></span>
									</label>
								</div>
							))}
							<div className="input-group" style={{ marginTop: "1rem" }}>
								<select
									value={formData.tyresBrakes.brakePedalFeel}
									onChange={(e) =>
										updateState("tyresBrakes", "brakePedalFeel", e.target.value)
									}
								>
									<option value="normal">Normal</option>
									<option value="soft">Too Soft</option>
									<option value="hard">Too Hard</option>
								</select>
								<label>Brake pedal feel</label>
							</div>
						</div>

						{/* Section 8: Electrical Issues */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-plug section-icon"></i>
								<h2>Electrical Issues</h2>
							</div>
							<div className="checkbox-grid">
								{[
									{ key: "dimHeadlights", label: "Dim headlights" },
									{ key: "acNotCooling", label: "AC not cooling well" },
									{ key: "slowPowerWindows", label: "Power windows slow" },
									{ key: "batteryDyingOften", label: "Battery dying often" },
									{ key: "slowStart", label: "Car taking too long to start" },
								].map((item) => (
									<div className="checkbox-group" key={item.key}>
										<input
											type="checkbox"
											id={item.key}
											checked={formData.electricalIssues[item.key]}
											onChange={(e) =>
												updateState(
													"electricalIssues",
													item.key,
													e.target.checked
												)
											}
										/>
										<label htmlFor={item.key}>{item.label}</label>
									</div>
								))}
							</div>
						</div>

						{/* Section 9: Fluids Condition */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-oil-can section-icon"></i>
								<h2>Fluids Condition</h2>
							</div>
							{[
								{ key: "lowEngineOil", label: "Engine oil level low" },
								{ key: "blackOilColor", label: "Oil colour very black" },
								{ key: "lowCoolant", label: "Coolant level low" },
								{ key: "lowBrakeFluid", label: "Brake fluid low" },
							].map((item) => (
								<div className="toggle-wrapper" key={item.key}>
									<label>{item.label}</label>
									<label className="toggle-switch">
										<input
											type="checkbox"
											checked={formData.fluidsCondition[item.key]}
											onChange={(e) =>
												updateState(
													"fluidsCondition",
													item.key,
													e.target.checked
												)
											}
										/>
										<span className="slider"></span>
									</label>
								</div>
							))}
						</div>

						{/* Section 10: Service History */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-calendar-days section-icon"></i>
								<h2>Service History</h2>
							</div>
							<div className="input-grid">
								{[
									{ key: "lastServiceDate", label: "Last service date" },
									{ key: "lastOilChange", label: "Last oil change" },
									{ key: "lastBrakePadChange", label: "Last brake pad change" },
									{ key: "lastTyreChange", label: "Last tyre change" },
									{ key: "lastBatteryChange", label: "Last battery change" },
								].map((item) => (
									<div className="input-group" key={item.key}>
										<input
											type="date"
											value={formData.serviceHistory[item.key]}
											onChange={(e) =>
												updateState("serviceHistory", item.key, e.target.value)
											}
										/>
										<label>{item.label}</label>
									</div>
								))}
							</div>
						</div>

						{/* Section 11: Electric Vehicles */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-bolt section-icon"></i>
								<h2>Electric Vehicles (Optional)</h2>
							</div>
							<div className="toggle-wrapper">
								<label>Is this an EV?</label>
								<label className="toggle-switch">
									<input
										type="checkbox"
										checked={formData.evSpecific.isEV}
										onChange={(e) =>
											updateState("evSpecific", "isEV", e.target.checked)
										}
									/>
									<span className="slider"></span>
								</label>
							</div>
							{formData.evSpecific.isEV && (
								<>
									{[
										{ key: "rangeDroppingFast", label: "Range dropping fast" },
										{ key: "chargingSlow", label: "Charging slow" },
										{ key: "batteryHeating", label: "Battery heating" },
										{
											key: "inverterNoise",
											label: "Strange inverter/motor noise",
										},
									].map((item) => (
										<div className="toggle-wrapper" key={item.key}>
											<label>{item.label}</label>
											<label className="toggle-switch">
												<input
													type="checkbox"
													checked={formData.evSpecific[item.key]}
													onChange={(e) =>
														updateState(
															"evSpecific",
															item.key,
															e.target.checked
														)
													}
												/>
												<span className="slider"></span>
											</label>
										</div>
									))}
								</>
							)}
						</div>

						{/* Section 12: Photos */}
						<div className="form-section">
							<div className="section-header">
								<i className="fa-solid fa-camera section-icon"></i>
								<h2>Photos & Documents</h2>
							</div>
							<div className="input-grid">
								<div className="input-group">
									<input
										type="file"
										multiple
										accept="image/*"
										onChange={(e) => handleFileChange("exterior", e)}
									/>
									<label
										style={{
											position: "static",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										Exterior Photos
									</label>
								</div>
								<div className="input-group">
									<input
										type="file"
										multiple
										accept="image/*"
										onChange={(e) => handleFileChange("problemAreas", e)}
									/>
									<label
										style={{
											position: "static",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										Problem Areas
									</label>
								</div>
								<div className="input-group">
									<input
										type="file"
										multiple
										accept=".pdf,image/*"
										onChange={(e) => handleFileChange("documents", e)}
									/>
									<label
										style={{
											position: "static",
											marginBottom: "0.5rem",
											display: "block",
										}}
									>
										Service Documents
									</label>
								</div>
							</div>
						</div>

						<div className="form-actions">
							<button type="button" className="btn btn-secondary">
								Save Draft
							</button>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={loading}
							>
								{loading ? (
									<>
										<i className="fa-solid fa-spinner fa-spin"></i>{" "}
										{loadingStep || "Processing..."}
									</>
								) : (
									<>
										Submit Report <i className="fa-solid fa-check"></i>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
