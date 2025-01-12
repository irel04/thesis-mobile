import { Text, View, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import NotificationCard from '@/components/notifications/NotificationCard'
import Ionicons from '@expo/vector-icons/Ionicons';
import { supabase } from "@/utils/supabase";

export default function NotificationTab() {

    const [upComingNotifications, setUpComingNotifications] = useState([])

    const fetchNotifications = async () => {
        try {
            const { data: userAuth } = await supabase.auth.getUser()

            if(!userAuth.user) return

            const { data: user } = await supabase.from("users_details").select("id").eq("auth_id", userAuth.user.id)

            const { data: notifications } = await supabase.from("notifications").select(`notification_type, bins(color, set), created_at`).eq("nearest_user_id", user[0].id).order('created_at', { ascending: false });

            setUpComingNotifications(notifications)

        } catch (error) {
            console.error(error)
        }
    }
    // Initial fetching of notification to load 
    useEffect(() => {

        fetchNotifications()

    }, [])

    // Update Realtime using subscribe
    useEffect(() => {
        const channels = supabase.channel('custom-insert-channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'notifications' },
                (payload) => {
                    fetchNotifications()
                }
            )
            .subscribe()
    }, [])


    return (
        <View className="p-5">
            <View className="flex-row justify-between pb-4 items-end relative">
                <View className='flex-row justify-between items-center gap-3'>
                    <Text className="text-left text-h5 font-bold">Notifications</Text>
                    <Ionicons name="notifications-outline" size={24} color="black" />
                </View>
                <TouchableOpacity>
                    <Text className="text-body font-[400] text-brand-500">Mark all as read</Text>
                </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} className='h-[95%] w-full'>
                <View>
                    {/* Pass the notifications data as props to NotificationCard */}
                    <NotificationCard notifications={upComingNotifications} />
                </View>
            </ScrollView>
        </View>
    )
}
