import { View, Text, Image, ScrollView, ActivityIndicator } from 'react-native';
import React, { useEffect, useMemo, useState } from 'react';
import Weather from '@/components/home/Weather';
import SolarPower from '@/components/home/SolarPower';
import TrashBinLevel from '@/components/home/TrashBinLevel';
import OverflowEvents from '@/components/home/OverflowEvents';
import Route from "@/app/(main)/(route)/index"
import { supabase } from "@/utils/supabase";
import { useSession } from "@/contexts/auth";
import LoaderKit from "react-native-loader-kit"
import { DailySummarySchema, UserSchema } from "@/utils/schemas";



export const getDailySummary = async (date: string) => {
	const { data, error } = await supabase.from("daily_summary").select("*, bins(*)").eq("date", date)

	if(error) throw error

	return data
}

export const getWeeklySummary = async (date: string) => {
	// Calculate the start and end of the week based on the provided date
	const startOfWeek = new Date(date);
	const endOfWeek = new Date(date);
  
	// Set the start of the week to be Sunday (or adjust based on your needs)
	startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());  // Adjust for Sunday
	endOfWeek.setDate(startOfWeek.getDate() + 6);  // Adjust for Saturday

  
	// Format dates to match the format in the database (if needed)
	const formattedStartOfWeek = startOfWeek.toISOString().split('T')[0];
	const formattedEndOfWeek = endOfWeek.toISOString().split('T')[0];
  
	// Query the database for data between the start and end of the week
	const { data, error } = await supabase
	  .from("daily_summary")
	  .select("*, bins(*)")
	  .gte("date", formattedStartOfWeek)  // Greater than or equal to the start date
	  .lte("date", formattedEndOfWeek)
	  
  
	if (error) throw error;
  
	return data;
  };
  

const Main = () => {

	const [currentUser, setCurrentUser] = useState<UserSchema[]>([])
	const [loading, setLoading] = useState(true);

	const { session } = useSession()
	const parseSession = JSON.parse(session)

	const currentDate = new Date()
	const [dailySummary, setDailySummary] = useState<DailySummarySchema[]>([])

	const [weeklySummary, setWeeklySummary] = useState([])

	const [currentWeather, setCurrentWeather] = useState(null)

	const getUser = async () => {
		const { data, error } = await supabase.from("users_details").select("first_name, last_name, id, lng, lat").eq("auth_id", parseSession.session.user.id)
	
		if (error) throw error
	
		
		return data
	}
	

	const getWeather = async (lat: number, lon: number) => {
		const API_KEY = process.env.EXPO_PUBLIC_OPWKEY; // Replace with your OpenWeatherMap API key
		const API_URL = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

		const response = await fetch(API_URL);
		if (!response.ok) {
			throw new Error('Failed to fetch weather data');
		}
		const data = await response.json();

		setCurrentWeather(data)
	};

	const fetchData = async () => {
		try {
			// Get user
			const user = await getUser()
			setCurrentUser(user)

			// get daily summary
			const daily_summary = await getDailySummary(currentDate.toISOString().split("T")[0])
			setDailySummary(daily_summary)

			const weekly_summary = await getWeeklySummary(currentDate.toISOString().split("T")[0])

			setWeeklySummary(weekly_summary)


			await getWeather(user[0].lat, user[0].lng)

		} catch (error) {
			console.error(error)
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		
		fetchData()
	}, [])


	// Make it realtime using subscribe
	useEffect(() => {

		const channels = supabase.channel('daily-summary-changes').on(
				'postgres_changes',
				{ event: 'UPDATE', schema: 'public', table: 'daily_summary' },
				() => {
					fetchData()
				}).subscribe()
		
		return () => {
			supabase.removeChannel(channels);
		};

	}, [])
	

	return (
		<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 16 }} >
				{loading ? (
				<View className="h-screen flex items-center justify-center">
					<LoaderKit style={{ width: 50, height: 50 }}
						name={'BallPulse'} // Optional: see list of animations below
						color={'#0E46A3'} />
				</View>
				) : (
					<>
						<View>
							<Text className="text-left text-h5 font-[700] pb-5">Welcome, {currentUser[0].first_name}!</Text>
						</View>

						<Weather currentDate={currentDate.toDateString()} degree={currentWeather.main.feels_like}/>

						<View className="flex-row  mt-5 gap-2">
							<SolarPower />

							<OverflowEvents weekly_summary={weeklySummary} />
						</View>

						<View>
							<TrashBinLevel daily_summary={dailySummary}/>
						</View>

						<View className="flex h-52 mt-5 border-brand-700 border-2 rounded-xl p-1">
							<Route showButton={false}/>
						</View>
					</>
				)}
			</ScrollView>
	);
};

export default Main;