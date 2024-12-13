import Input from "@/components/ui/Input"
import { Alert, Image, Keyboard, KeyboardAvoidingView, Platform, Pressable, Text, TouchableWithoutFeedback, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Feather from '@expo/vector-icons/Feather';
import CustomButton from "@/components/ui/CustomButton";
import AntDesign from '@expo/vector-icons/AntDesign';

const Main = () => {
	return (
		<View className="flex flex-col h-screen">
			<KeyboardAvoidingView className="flex-col justify-center items-center " behavior={Platform.OS === "ios" ? "padding" : "height"}>
				<View className="flex-auto flex-col justify-center items-center h- w-full">
					<Image source={require("@/assets/images/pup-logo.png")} className="flex-none" />
					<Text className="text-h3 font-bold text-brand-700 mt-32">Welcome Back</Text>
					<Text className="text-body">It's nice to see you again Kups! Please enter your details</Text>
				</View>

				{/* Form */}
				<View className="flex-auto flex-col gap-7 w-full items-center justify-center h-72" >
					<Input onChange={() => console.log("Hello")} placeholder="Email" id="email">
						<FontAwesome name="user-o" size={13} color="black" />
					</Input>
					<Input onChange={() => console.log("Hello")} placeholder="Password" id="password">
						<Feather size={13} name="lock" />
					</Input>
				</View>
			</KeyboardAvoidingView>
			{/* Button */}
			<View className="justify-center items-center flex-auto h-1/6 gap-5 px-5">
				<CustomButton onPress={() => Alert.alert("You Licked Me")} title="Continue">
					<AntDesign name="arrowright" size={16} color="white" />
				</CustomButton>
				<Pressable>
					<Text className="underline text-body">Forgot Password</Text>
				</Pressable>
			</View>
			<View className="justify-center items-center flex-auto h-1/6 gap-5 px-5">
				<Text className="text-caption text-neutral-500 text-center">This is a mobile application developed for a research project titled "Enhancing Garbage Management: A Mobile-Integrated, Solar-Powered Intelligent Waste Collection System."</Text>
			</View>
		</View>
	)
}


export default Main