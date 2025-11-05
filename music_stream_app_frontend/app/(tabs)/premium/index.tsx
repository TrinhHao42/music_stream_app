import { upgradeToPremium } from '@/api/musicApi';
import { useAuth } from '@/contexts/AuthContext';
import Entypo from '@expo/vector-icons/Entypo';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { Alert, Animated, Dimensions, FlatList, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { RadioButton } from 'react-native-paper';


const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.8;
const PremiumScreen = () => {
  const { user, refreshUserData } = useAuth();

  const cards = [
    { id: '1', title: 'Premium', price: '$12.99 / month' },
    { id: '2', title: 'Gold', price: '$19.99 / month' },
    { id: '3', title: 'Diamond', price: '$29.99 / month' },
  ];

  const [selected, setSelected] = useState('1');
  const [isUpgrading, setIsUpgrading] = useState(false);
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  const router = useRouter();

  const handleScrollEnd = (event: any) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / (CARD_WIDTH));
    const selectedCard = cards[index];
    if (selectedCard) setSelected(selectedCard.id);
  };

  const handleRadioSelect = (value: string) => {
    setSelected(value);
    const index = cards.findIndex(c => c.id === value);
    flatListRef.current?.scrollToOffset({
      offset: index * (CARD_WIDTH),
      animated: true,
    });
  };

  const handleSubscribe = async () => {
    if (!user?.userId) {
      Alert.alert('Error', 'Please login to subscribe');
      router.push('/login' as never);
      return;
    }

    Alert.alert(
      'Confirm Subscription',
      `Upgrade to ${cards.find(c => c.id === selected)?.title} plan?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Subscribe',
          onPress: async () => {
            try {
              setIsUpgrading(true);
              const success = await upgradeToPremium(user.userId);
              
              if (success) {
                // Refresh user data to update isPremium status
                await refreshUserData();
                
                Alert.alert('Success', 'Upgraded to Premium successfully!');
                // Navigate back or to downloaded songs
                router.push('/downloaded-songs' as never);
              } else {
                Alert.alert('Error', 'Failed to upgrade. Please try again.');
              }
            } catch (error) {
              console.error('Error upgrading:', error);
              Alert.alert('Error', 'An error occurred. Please try again.');
            } finally {
              setIsUpgrading(false);
            }
          }
        }
      ]
    );
  };

  return (
    <ImageBackground
      source={require('@/assets/images/SubscriptionPlans/Image116.png')}
      style={styles.background}
    >
      <Text style={styles.header}>Unlimited{'\n'}Music selections</Text>

      <Animated.FlatList
        ref={flatListRef}
        data={cards}
        horizontal
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={{ paddingHorizontal: (width - CARD_WIDTH) / 2 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH),
            index * (CARD_WIDTH),
            (index + 1) * (CARD_WIDTH),
          ];
          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.85, 1, 0.85]
          });
          return (
            <Animated.View style={[styles.cardContainer, { transform: [{ scale }] }]}>
              <View style={styles.card}>
                <View>
                  <Text style={styles.title}>{item.title}</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.free}>Free for 1 month</Text>
                    <Text style={styles.price}>{item.price}</Text>
                  </View>
                </View>
                <View style={styles.features}>
                  <Text style={styles.feature}>
                    <Entypo name="check" size={24} color="black" />
                    Ad-free listening
                  </Text>
                  <Text style={styles.feature}>
                    <Entypo name="check" size={24} color="black" />
                    Download to listen offline
                  </Text>
                  <Text style={styles.feature}>
                    <Entypo name="check" size={24} color="black" />
                    Access full catalog
                  </Text>
                  <Text style={styles.feature}>
                    <Entypo name="check" size={24} color="black" />
                    High sound quality
                  </Text>
                  <Text style={styles.feature}>
                    <Entypo name="check" size={24} color="black" />
                    Cancel anytime
                  </Text>
                </View>
                <TouchableOpacity 
                  style={styles.button}
                  onPress={handleSubscribe}
                  disabled={isUpgrading}
                >
                  <Text style={styles.buttonText}>
                    {isUpgrading ? 'Processing...' : 'Subscribe now'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
          );
        }}
      />
      <RadioButton.Group onValueChange={handleRadioSelect} value={selected}>
        <View style={styles.radioRow}>
          {cards.map(card => (
            <RadioButton key={card.id} value={card.id} color="white" uncheckedColor="white" />
          ))}
        </View>
      </RadioButton.Group>

      <TouchableOpacity
        onPress={() => router.push('/' as never)}
      >
        <Text style={[styles.buttonText, { textAlign: 'center' }]}>Back home</Text>
      </TouchableOpacity>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, paddingVertical: 40 },
  header: { color: 'white', fontSize: 35, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  cardContainer: { width: CARD_WIDTH },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 30, height: '100%', flexDirection: 'column', justifyContent: 'space-between' },
  title: { fontSize: 30, fontWeight: '700', marginBottom: 8 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  free: { padding: 7, color: '#9369e6', backgroundColor: '#f5f2fd', borderRadius: 15 },
  price: { fontSize: 16, fontWeight: 'bold' },
  features: { marginVertical: 8 },
  feature: { fontSize: 16, color: '#555', marginVertical: 4 },
  button: { marginTop: 12, backgroundColor: '#111', paddingVertical: 12, borderRadius: 28, alignItems: 'center', marginVertical: 20 },
  buttonText: { color: 'white', fontWeight: '600' },
  radioRow: { flexDirection: 'row', justifyContent: 'center', marginVertical: 20 },
});

export default PremiumScreen;