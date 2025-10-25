
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
        </Stack>
    )
}

export default LibraryLayout
