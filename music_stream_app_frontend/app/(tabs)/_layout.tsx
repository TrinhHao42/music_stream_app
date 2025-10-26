import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import Feather from '@expo/vector-icons/Feather';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Tabs } from "expo-router";

const HomeLayout = () => {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: { backgroundColor: 'white' },
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ color, size }) => (
                        <AntDesign name="home" size={24} color="gray" />
                    ),
                }}
            />
            <Tabs.Screen
                name="search/index"
                options={{
                    title: "Search",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="search" size={24} color="gray" />
                    ),
                }}
            />
            <Tabs.Screen
                name="feed/index"
                options={{
                    title: "Feed",
                    tabBarIcon: ({ color, size }) => (
                        <Feather name="rss" size={24} color="gray" />
                    ),
                }}
            />
            <Tabs.Screen
                name="library"
                options={{
                    title: "Library",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="albums-outline" size={24} color="gray" />
                    ),
                }}
            />
            <Tabs.Screen
                name="premium/index"
                options={{
                    title: "Premium",
                    tabBarIcon: ({ color, size }) => (
                        <Entypo name="popup" size={24} color="gray" />
                    ),
                }}
            />
            <Tabs.Screen
                name="artist-profile"
                options={{
                    href: null, // Ẩn khỏi bottom navigation
                }}
            />
        </Tabs>
    );
}

export default HomeLayout;