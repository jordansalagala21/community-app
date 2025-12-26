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
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export default function ResidentLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);

      // Check if user account is approved
      if (auth.currentUser) {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Check if account is approved
          if (userData.isApproved === false || userData.status === "pending") {
            setError(
              "Your account is pending admin approval. Please wait for approval before logging in."
            );
            setLoading(false);
            return;
          }

          // Check if account is deactivated
          if (userData.isActive === false) {
            setError(
              "Your account has been deactivated. Please contact the administrator."
            );
            setLoading(false);
            return;
          }
        }
      }

      // Redirect to resident portal after successful login
      window.location.href = "/resident-portal";
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email. Please sign up first.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(
          err.message || "Failed to log in. Please check your credentials."
        );
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
                onClick={() => (window.location.href = "/resident/signup")}
              >
                Sign Up
              </Button>
            </HStack>

            {/* Mobile Navigation */}
            <Button
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
              onClick={() => (window.location.href = "/resident/signup")}
            >
              Sign Up
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container
        maxW="520px"
        py={{ base: 8, md: 16 }}
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
            mb={{ base: 6, md: 8 }}
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
              👤
            </Box>
            <Box>
              <Heading
                size={{ base: "lg", md: "xl" }}
                color="navy.700"
                mb={{ base: 1, md: 2 }}
                fontWeight="800"
              >
                Welcome Back
              </Heading>
              <Text
                color="gray.500"
                fontSize={{ base: "sm", md: "md" }}
                fontWeight="medium"
              >
                Sign in to access your resident portal
              </Text>
            </Box>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Box
              rounded="xl"
              mb={{ base: 5, md: 6 }}
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

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap={{ base: 4, md: 5 }}>
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
                <Flex justify="space-between" align="center" mb={2}>
                  <Text
                    fontSize={{ base: "xs", md: "sm" }}
                    fontWeight="bold"
                    color="navy.700"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    Password
                  </Text>
                  <Text
                    fontSize="xs"
                    color="navy.600"
                    fontWeight="semibold"
                    cursor="pointer"
                    _hover={{ textDecoration: "underline", color: "navy.700" }}
                    transition="all 0.2s"
                  >
                    Forgot password?
                  </Text>
                </Flex>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
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
                Sign In to Portal
              </Button>
            </Stack>
          </form>

          {/* Divider */}
          <Flex align="center" my={{ base: 5, md: 6 }}>
            <Box
              flex="1"
              h="2px"
              bgGradient="linear(to-r, transparent, gray.300, transparent)"
            />
            <Text px={4} fontSize="sm" color="gray.500" fontWeight="semibold">
              Don't have an account?
            </Text>
            <Box
              flex="1"
              h="2px"
              bgGradient="linear(to-l, transparent, gray.300, transparent)"
            />
          </Flex>

          {/* Sign Up Link */}
          <Button
            onClick={() => (window.location.href = "/resident/signup")}
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
            Create New Account
          </Button>

          {/* Admin Link */}
          <Box mt={{ base: 5, md: 6 }} textAlign="center">
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
          mt={{ base: 6, md: 8 }}
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
