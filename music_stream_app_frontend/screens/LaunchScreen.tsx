import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageBackground,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";

export default function LaunchScreen() {
  const router = useRouter();
  const { login, register } = useAuth();
  
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userName, setUserName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    userName: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateLoginForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      userName: '',
      confirmPassword: '',
    };

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const validateRegisterForm = () => {
    let isValid = true;
    const newErrors = {
      email: '',
      password: '',
      userName: '',
      confirmPassword: '',
    };

    // Validate email
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    // Validate username
    if (!userName.trim()) {
      newErrors.userName = 'Username is required';
      isValid = false;
    } else if (userName.length < 3) {
      newErrors.userName = 'Username must be at least 3 characters';
      isValid = false;
    }

    // Validate password
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateLoginForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await login(email, password);
      
      // Navigate to home screen after successful login
      setShowLoginModal(false);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validateRegisterForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await register(email, password, userName);
      
      // Đóng register modal
      setShowRegisterModal(false);
      
      // Reset form
      setUserName('');
      setConfirmPassword('');
      setErrors({ email: '', password: '', userName: '', confirmPassword: '' });
      
      // Hiển thị thông báo thành công
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully. Please login to continue.'
      );
      
      // Tự động mở login modal
      setShowLoginModal(true);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/images/Launch-Screen/Image 30.png")}
      style={styles.bg}
      resizeMode="cover"
      blurRadius={0}
    >
      {/* Overlay tối */}
      <View style={styles.overlay} />

      {/* Container chính - căn giữa tất cả */}
      <View style={styles.mainContainer}>
        {/* Logo Spotify */}
        <View style={styles.spotifyLogo}>
          <Image source={require("../assets/images/logo/Frame1.png")} style={styles.spotifyLogoImage} />
        </View>

        {/* Text chính */}
        <Text style={styles.mainText}>
          Millions of Songs are waiting for you.{"\n"}
        </Text>

        {/* Các nút đăng nhập */}
        <View style={styles.buttonsContainer}>
          {/* Nút Sign up free */}
          <TouchableOpacity
            style={styles.signupButton}
            activeOpacity={0.8}
            onPress={() => setShowRegisterModal(true)}
          >
            <Text style={styles.signupButtonText}>Sign up free</Text>
          </TouchableOpacity>
          
          {/* Link Log in */}
          <TouchableOpacity
            style={styles.loginLink}
            activeOpacity={0.7}
            onPress={() => setShowLoginModal(true)}
          >
            <Text style={styles.loginLinkText}>Log in</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Login Modal */}
      <Modal
        visible={showLoginModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowLoginModal(false)}
      >
        <ImageBackground
          source={require("../assets/images/Launch Screen - Premium/Image 112.png")}
          style={styles.modalContainer}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowLoginModal(false)}
              >
                <FontAwesome name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Login to your account</Text>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Login</Text>
                )}
              </TouchableOpacity>

              {/* Register Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>{"Don't have an account? "}</Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                  }} 
                  disabled={isLoading}
                >
                  <Text style={styles.registerLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </Modal>

      {/* Register Modal */}
      <Modal
        visible={showRegisterModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRegisterModal(false)}
      >
        <ImageBackground
          source={require("../assets/images/Launch Screen - Premium/Image 112.png")}
          style={styles.modalContainer}
          resizeMode="cover"
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Back Button */}
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setShowRegisterModal(false)}
              >
                <FontAwesome name="arrow-left" size={24} color="#fff" />
              </TouchableOpacity>

            <View style={styles.formContainer}>
              <Text style={styles.title}>Create Account</Text>
              <Text style={styles.subtitle}>Sign up to get started</Text>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={[styles.input, errors.userName ? styles.inputError : null]}
                  placeholder="Enter your username"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={userName}
                  onChangeText={(text) => {
                    setUserName(text);
                    setErrors({ ...errors, userName: '' });
                  }}
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.userName ? (
                  <Text style={styles.errorText}>{errors.userName}</Text>
                ) : null}
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email</Text>
                <TextInput
                  style={[styles.input, errors.email ? styles.inputError : null]}
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors({ ...errors, email: '' });
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
                {errors.email ? (
                  <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Password</Text>
                <TextInput
                  style={[styles.input, errors.password ? styles.inputError : null]}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors({ ...errors, password: '' });
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {/* Confirm Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Confirm Password</Text>
                <TextInput
                  style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                  placeholder="Confirm your password"
                  placeholderTextColor="rgba(255, 255, 255, 0.5)"
                  value={confirmPassword}
                  onChangeText={(text) => {
                    setConfirmPassword(text);
                    setErrors({ ...errors, confirmPassword: '' });
                  }}
                  secureTextEntry
                  editable={!isLoading}
                />
                {errors.confirmPassword ? (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}
              </View>

              {/* Register Button */}
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Sign Up</Text>
                )}
              </TouchableOpacity>

              {/* Login Link */}
              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Already have an account? </Text>
                <TouchableOpacity 
                  onPress={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                  }} 
                  disabled={isLoading}
                >
                  <Text style={styles.registerLink}>Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
          </KeyboardAvoidingView>
        </ImageBackground>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  mainContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    zIndex: 1,
  },
  spotifyLogo: {
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
  },
  spotifyLogoImage: {
    width: 80,
    height: 80,
    resizeMode: "contain",
  },
  mainText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 40,
  },
  buttonsContainer: {
    width: "100%",
    gap: 12,
    marginTop: 20,
  },
  signupButton: {
    backgroundColor: "#1ED760",
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  signupButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  socialButton: {
    backgroundColor: "transparent",
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  socialIcon: {
    position: "absolute",
    left: 16,
  },
  socialButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  loginLink: {
    paddingVertical: 8,
    alignItems: "center",
    marginTop: 8,
  },
  loginLinkText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Login Modal Styles
  modalContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modalKeyboardView: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#E0E0E0',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#fff',
  },
  inputError: {
    borderColor: '#ff3b30',
  },
  errorText: {
    color: '#ff3b30',
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#1ED760',
    borderRadius: 25,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  registerText: {
    color: '#E0E0E0',
    fontSize: 14,
  },
  registerLink: {
    color: '#1ED760',
    fontSize: 14,
    fontWeight: '600',
  },
});
