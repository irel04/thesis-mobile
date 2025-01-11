import React, { Key, ReactNode } from "react"
import { Image, ImageSourcePropType, Text, TextInput, View } from "react-native"
import FontAwesome from '@expo/vector-icons/FontAwesome';



interface InputProps {
	onChangeText: (text: string) => void,
	placeholder: string,
	children?: ReactNode,
	id: string,
	value: string,
	secureTextEntry?: boolean
}

const Input = ({ children, onChangeText, placeholder, id, value, secureTextEntry }: InputProps) => {
	return (
		<View className="w-72 flex px-5 bg-neutral-100 rounded-2xl flex-row items-center justify-between py-1">
			<TextInput placeholder={placeholder} onChangeText={onChangeText} id={id} className="w-5/6 text-body" maxLength={25} value={value} secureTextEntry={secureTextEntry}/>
			{/* Pass the icon as */}
			{children}
		</View>
	)
}


export default Input