import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
  createToaster,
  Toaster,
} from "@chakra-ui/react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const toaster = createToaster({
  placement: "top",
  duration: 5000,
});

export default function ResidentSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!name.trim()) {
      setError("Please enter your full name");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!phone.trim()) {
      setError("Please enter your phone number");
      return;
    }

    // Phone number validation (10 digits)
    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setError("Please enter a valid 10-digit phone number");
      return;
    }

    if (!address.trim()) {
      setError("Please enter your address");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Prevent admin emails from signing up as residents
    if (email.toLowerCase().includes("admin")) {
      setError(
        "Admin accounts cannot be created through resident signup. Please use admin portal."
      );
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      // Update the user's display name
      await updateProfile(userCredential.user, {
        displayName: name,
      });

      // Store user profile data in Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name: name,
        email: email,
        phone: phone,
        address: address,
        createdAt: new Date().toISOString(),
        role: "resident",
        isApproved: false,
        status: "pending",
      });

      // Show pending approval message with toaster
      toaster.success({
        title: "✅ Account Created Successfully!",
        description:
          "Your account is awaiting admin approval. Please do not attempt to login until you receive an approval email.",
        duration: 8000,
      });

      // Log out the user immediately to prevent login attempts
      await auth.signOut();

      // Redirect after a longer delay to ensure message is read
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } catch (err: any) {
      console.error("Signup error:", err);

      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered. Please sign in instead.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak. Please use a stronger password.");
      } else if (err.code === "permission-denied") {
        setError("Database permission error. Please contact administrator.");
      } else {
        // Show full error message for debugging
        setError(err.message || "Failed to create account. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      minH="100vh"
      bgGradient="linear(to-br, navy.600, navy.800)"
      position="relative"
      overflow="hidden"
    >
      <Toaster toaster={toaster}>
        {(toast) => (
          <Box
            bg={
              toast.type === "success"
                ? "green.500"
                : toast.type === "error"
                ? "red.500"
                : "blue.500"
            }
            color="white"
            p={4}
            rounded="md"
            shadow="lg"
          >
            <Text fontWeight="bold">{toast.title}</Text>
            {toast.description && (
              <Text fontSize="sm">{toast.description}</Text>
            )}
          </Box>
        )}
      </Toaster>
      {/* Background Decorative Elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        w={{ base: "300px", md: "500px" }}
        h={{ base: "300px", md: "500px" }}
        bg="whiteAlpha.100"
        rounded="full"
        filter="blur(80px)"
      />
      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        w={{ base: "250px", md: "400px" }}
        h={{ base: "250px", md: "400px" }}
        bg="whiteAlpha.100"
        rounded="full"
        filter="blur(80px)"
      />

      {/* Header Navigation */}
      <Box position="relative" zIndex={10} bg="transparent" py={4}>
        <Container maxW="6xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center">
            <HStack
              gap={3}
              cursor="pointer"
              onClick={() => (window.location.href = "/")}
              transition="all 0.2s"
              _hover={{ transform: "translateY(-2px)" }}
            >
              <Box
                w={{ base: "36px", md: "44px" }}
                h={{ base: "36px", md: "44px" }}
                rounded="xl"
                bg="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize={{ base: "lg", md: "2xl" }}
                shadow="lg"
              >
                🏠
              </Box>
              <Heading size={{ base: "sm", md: "md" }} color="white">
                Community Portal
              </Heading>
            </HStack>
            <HStack gap={3} display={{ base: "none", md: "flex" }}>
              <Button
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => (window.location.href = "/")}
              >
                Home
              </Button>
              <Button
                bg="white"
                color="navy.600"
                size="sm"
                fontWeight="semibold"
                shadow="md"
                _hover={{
                  bg: "whiteAlpha.900",
                  transform: "translateY(-1px)",
                  shadow: "lg",
                }}
                transition="all 0.2s"
                onClick={() => (window.location.href = "/resident/login")}
              >
                Sign In
              </Button>
            </HStack>

            {/* Mobile Navigation */}
            <Button
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => (window.location.href = "/resident/login")}
            >
              Sign In
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxW="520px"
        py={{ base: 6, md: 12 }}
        px={{ base: 4, md: 6 }}
        position="relative"
        zIndex={10}
      >
        <Box
          bg="white"
          rounded="3xl"
          shadow="2xl"
          p={{ base: 6, sm: 8, md: 10 }}
          backdropFilter="blur(10px)"
          borderWidth="1px"
          borderColor="whiteAlpha.400"
        >
          {/* Header */}
          <VStack
            gap={{ base: 3, md: 4 }}
            mb={{ base: 5, md: 7 }}
            textAlign="center"
          >
            <Box
              w={{ base: "64px", md: "80px" }}
              h={{ base: "64px", md: "80px" }}
              rounded="2xl"
              bgGradient="linear(to-br, navy.500, navy.700)"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize={{ base: "2xl", md: "3xl" }}
              color="white"
              shadow="xl"
              position="relative"
              _before={{
                content: '""',
                position: "absolute",
                inset: "-4px",
                bg: "linear-gradient(45deg, navy.400, navy.600)",
                rounded: "2xl",
                opacity: 0.3,
                filter: "blur(10px)",
                zIndex: -1,
              }}
            >
              ✨
            </Box>
            <Box>
              <Heading
                size={{ base: "lg", md: "xl" }}
                color="navy.700"
                mb={{ base: 1, md: 2 }}
                fontWeight="800"
              >
                Create Your Account
              </Heading>
              <Text
                color="gray.500"
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
              >
                Join your community portal today
              </Text>
            </Box>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Box
              rounded="xl"
              mb={{ base: 4, md: 5 }}
              p={{ base: 3, md: 4 }}
              bgGradient="linear(to-r, red.50, red.100)"
              borderWidth="2px"
              borderColor="red.300"
              shadow="sm"
            >
              <HStack gap={2}>
                <Text fontSize={{ base: "md", md: "lg" }}>⚠️</Text>
                <Text
                  color="red.700"
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="semibold"
                >
                  {error}
                </Text>
              </HStack>
            </Box>
          )}

          {/* Signup Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap={{ base: 3, md: 4 }}>
              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Full Name
                </Text>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Email Address
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Phone Number
                </Text>
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 10) {
                      setPhone(value);
                    }
                  }}
                  placeholder="(555) 123-4567"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Address
                </Text>
                <Input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Password
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Box>
                <Text
                  fontSize={{ base: "xs", md: "sm" }}
                  fontWeight="bold"
                  mb={2}
                  color="navy.700"
                  textTransform="uppercase"
                  letterSpacing="wide"
                >
                  Confirm Password
                </Text>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  size="lg"
                  borderWidth="2px"
                  borderColor="gray.300"
                  rounded="xl"
                  fontSize={{ base: "md", md: "lg" }}
                  _hover={{ borderColor: "navy.400", shadow: "sm" }}
                  _focus={{
                    borderColor: "navy.500",
                    boxShadow: "0 0 0 3px var(--chakra-colors-navy-100)",
                    transform: "scale(1.01)",
                  }}
                  transition="all 0.2s"
                />
              </Box>

              <Button
                type="submit"
                size="lg"
                bgGradient="linear(to-r, navy.500, navy.600)"
                color="white"
                width="full"
                py={{ base: 6, md: 7 }}
                mt={2}
                fontSize={{ base: "md", md: "lg" }}
                fontWeight="bold"
                rounded="xl"
                shadow="lg"
                loading={loading}
                _hover={{
                  bgGradient: "linear(to-r, navy.600, navy.700)",
                  transform: "translateY(-2px)",
                  shadow: "xl",
                }}
                _active={{
                  transform: "translateY(0)",
                }}
                transition="all 0.2s"
              >
                Create Account
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Flex align="center" my={{ base: 4, md: 5 }}>
            <Box
              flex="1"
              h="2px"
              bgGradient="linear(to-r, transparent, gray.300, transparent)"
            />
            <Text px={4} fontSize="sm" color="gray.500" fontWeight="semibold">
              Already have an account?
            </Text>
            <Box
              flex="1"
              h="2px"
              bgGradient="linear(to-l, transparent, gray.300, transparent)"
            />
          </Flex>

          {/* Sign In Link */}
          <Button
            onClick={() => (window.location.href = "/resident/login")}
            variant="outline"
            size="lg"
            width="full"
            borderWidth="2px"
            borderColor="navy.500"
            color="navy.600"
            fontWeight="bold"
            rounded="xl"
            py={{ base: 6, md: 7 }}
            fontSize={{ base: "md", md: "lg" }}
            _hover={{
              bg: "navy.50",
              borderColor: "navy.600",
              transform: "translateY(-2px)",
              shadow: "md",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            transition="all 0.2s"
          >
            Sign In Instead
          </Button>

          {/* Admin Link */}
          <Box mt={{ base: 4, md: 5 }} textAlign="center">
            <Text fontSize="sm" color="gray.500">
              Are you an admin?{" "}
              <Text
                as="span"
                color="navy.600"
                fontWeight="bold"
                cursor="pointer"
                _hover={{ textDecoration: "underline", color: "navy.700" }}
                transition="all 0.2s"
                onClick={() => (window.location.href = "/admin/login")}
              >
                Admin Portal →
              </Text>
            </Text>
          </Box>
        </Box>

        {/* Bottom Text */}
        <Text
          textAlign="center"
          mt={{ base: 5, md: 6 }}
          color="whiteAlpha.800"
          fontSize={{ base: "xs", md: "sm" }}
          fontWeight="medium"
        >
          © 2025 Community Portal. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
