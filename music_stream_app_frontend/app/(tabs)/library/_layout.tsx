
import { Stack } from "expo-router"

const LibraryLayout = () => {
    return (
        <Stack
            screenOptions={{
                headerShown: false
            }}
        >
            <Stack.Screen
                name="index"
            />
            <Stack.Screen
                name="search"
            />
            <Stack.Screen
                name="playlist-details"
            />
            <Stack.Screen
                name="album-details"
            />
            <Stack.Screen
                name="artist-profile"
            />
        </Stack>
    )
}

export default LibraryLayout
