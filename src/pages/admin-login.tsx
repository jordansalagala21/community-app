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
  SimpleGrid,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";

export default function AdminLogin() {
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
      // Redirect to dashboard after successful login
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(
        err.message || "Failed to log in. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box bg="navy.600" minH="100vh">
      {/* Header Navigation */}
      <Box bg="navy.700" py={4}>
        <Container maxW="6xl">
          <Flex justify="space-between" align="center">
            <HStack
              gap={3}
              cursor="pointer"
              onClick={() => (window.location.href = "/")}
            >
              <Box
                w="40px"
                h="40px"
                rounded="lg"
                bg="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xl"
              >
                🏠
              </Box>
              <Heading size="md" color="white">
                Community Portal
              </Heading>
            </HStack>
            <HStack gap={3}>
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
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => (window.location.href = "/events")}
              >
                Events
              </Button>
              <Button
                bg="white"
                color="navy.600"
                size="sm"
                _hover={{ bg: "whiteAlpha.900" }}
                onClick={() => (window.location.href = "/resident/login")}
              >
                Resident Login
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="6xl" py={{ base: 12, md: 16 }}>
        <SimpleGrid
          columns={{ base: 1, lg: 2 }}
          gap={{ base: 12, lg: 20 }}
          alignItems="center"
        >
          {/* Left Side - Welcome Text */}
          <Box color="white" display={{ base: "none", lg: "block" }}>
            <Text
              fontSize="sm"
              fontWeight="semibold"
              color="whiteAlpha.700"
              mb={4}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              Admin Portal
            </Text>
            <Heading size="3xl" lineHeight="1.2" mb={6} fontWeight="800">
              Manage your community with ease
            </Heading>
            <Text fontSize="xl" color="whiteAlpha.800" lineHeight="1.8" mb={8}>
              Access powerful tools to manage events, announcements,
              reservations, and resident information all in one place.
            </Text>

            {/* Feature List */}
            <VStack align="start" gap={4}>
              <HStack gap={4}>
                <Box
                  w="48px"
                  h="48px"
                  rounded="xl"
                  bg="whiteAlpha.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                >
                  📊
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Dashboard Analytics
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Track community engagement and activity
                  </Text>
                </Box>
              </HStack>
              <HStack gap={4}>
                <Box
                  w="48px"
                  h="48px"
                  rounded="xl"
                  bg="whiteAlpha.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                >
                  🎉
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Event Management
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Create and manage community events
                  </Text>
                </Box>
              </HStack>
              <HStack gap={4}>
                <Box
                  w="48px"
                  h="48px"
                  rounded="xl"
                  bg="whiteAlpha.200"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xl"
                >
                  📅
                </Box>
                <Box>
                  <Text fontWeight="bold" fontSize="lg">
                    Reservation Control
                  </Text>
                  <Text color="whiteAlpha.700" fontSize="sm">
                    Approve and manage clubhouse bookings
                  </Text>
                </Box>
              </HStack>
            </VStack>
          </Box>

          {/* Right Side - Login Form */}
          <Box>
            <Box
              bg="white"
              rounded="3xl"
              shadow="2xl"
              p={{ base: 8, md: 10 }}
              maxW="480px"
              mx="auto"
            >
              {/* Header */}
              <VStack gap={4} mb={8} textAlign="center">
                <Box
                  w="72px"
                  h="72px"
                  rounded="2xl"
                  bg="navy.500"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="2xl"
                  color="white"
                  shadow="lg"
                >
                  🔐
                </Box>
                <Box>
                  <Heading size="xl" color="navy.700" mb={2}>
                    Welcome Back
                  </Heading>
                  <Text color="gray.500" fontSize="md">
                    Sign in to access admin dashboard
                  </Text>
                </Box>
              </VStack>

              {/* Error Alert */}
              {error && (
                <Box
                  rounded="xl"
                  mb={6}
                  p={4}
                  bg="red.50"
                  borderWidth="2px"
                  borderColor="red.200"
                >
                  <HStack>
                    <Text fontSize="lg">⚠️</Text>
                    <Text color="red.600" fontSize="sm" fontWeight="medium">
                      {error}
                    </Text>
                  </HStack>
                </Box>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit}>
                <Stack gap={5}>
                  <Box>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.700"
                      mb={2}
                    >
                      Email Address
                    </Text>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      size="lg"
                      bg="gray.50"
                      borderWidth="2px"
                      borderColor="gray.200"
                      rounded="xl"
                      py={6}
                      _focus={{
                        borderColor: "navy.500",
                        bg: "white",
                        shadow: "0 0 0 3px rgba(30, 58, 138, 0.1)",
                      }}
                      _hover={{
                        borderColor: "gray.300",
                      }}
                      required
                    />
                  </Box>

                  <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text
                        fontSize="sm"
                        fontWeight="semibold"
                        color="gray.700"
                      >
                        Password
                      </Text>
                      <Button
                        variant="plain"
                        color="navy.500"
                        fontSize="xs"
                        fontWeight="semibold"
                        p={0}
                        h="auto"
                        _hover={{ color: "navy.600" }}
                      >
                        Forgot password?
                      </Button>
                    </Flex>
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      size="lg"
                      bg="gray.50"
                      borderWidth="2px"
                      borderColor="gray.200"
                      rounded="xl"
                      py={6}
                      _focus={{
                        borderColor: "navy.500",
                        bg: "white",
                        shadow: "0 0 0 3px rgba(30, 58, 138, 0.1)",
                      }}
                      _hover={{
                        borderColor: "gray.300",
                      }}
                      required
                    />
                  </Box>

                  <Button
                    type="submit"
                    size="lg"
                    bg="navy.500"
                    color="white"
                    fontSize="md"
                    fontWeight="bold"
                    py={7}
                    rounded="xl"
                    loading={loading}
                    _hover={{
                      bg: "navy.600",
                      transform: "translateY(-2px)",
                      shadow: "lg",
                    }}
                    _active={{
                      transform: "translateY(0)",
                    }}
                    transition="all 0.2s"
                  >
                    Sign In to Dashboard
                  </Button>
                </Stack>
              </form>

              {/* Divider */}
              <Flex align="center" my={6}>
                <Box flex="1" h="1px" bg="gray.200" />
                <Text px={4} color="gray.400" fontSize="sm">
                  or
                </Text>
                <Box flex="1" h="1px" bg="gray.200" />
              </Flex>

              {/* Alternative Actions */}
              <Stack gap={3}>
                <Button
                  size="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.200"
                  color="gray.700"
                  rounded="xl"
                  py={6}
                  _hover={{
                    bg: "gray.50",
                    borderColor: "gray.300",
                  }}
                  onClick={() => (window.location.href = "/resident/login")}
                >
                  <HStack gap={3}>
                    <Text fontSize="lg">👤</Text>
                    <Text>Sign in as Resident</Text>
                  </HStack>
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  borderWidth="2px"
                  borderColor="gray.200"
                  color="gray.700"
                  rounded="xl"
                  py={6}
                  _hover={{
                    bg: "gray.50",
                    borderColor: "gray.300",
                  }}
                  onClick={() => (window.location.href = "/organizer/login")}
                >
                  <HStack gap={3}>
                    <Text fontSize="lg">🎪</Text>
                    <Text>Sign in as Event Organizer</Text>
                  </HStack>
                </Button>
              </Stack>

              {/* Footer */}
              <Box mt={8} textAlign="center">
                <Button
                  variant="plain"
                  color="navy.500"
                  fontSize="sm"
                  fontWeight="semibold"
                  _hover={{ color: "navy.600" }}
                  onClick={() => (window.location.href = "/")}
                >
                  ← Back to Home
                </Button>
              </Box>
            </Box>

            {/* Help Text Below Card */}
            <Box
              mt={6}
              textAlign="center"
              display={{ base: "block", lg: "block" }}
            >
              <Text color="whiteAlpha.600" fontSize="sm">
                Need help? Contact{" "}
                <Text as="span" color="white" fontWeight="semibold">
                  office@yourcommunity.com
                </Text>
              </Text>
            </Box>
          </Box>
        </SimpleGrid>
      </Container>

      {/* Footer */}
      <Box
        position="absolute"
        bottom={0}
        left={0}
        right={0}
        py={6}
        textAlign="center"
      >
        <Text color="whiteAlpha.500" fontSize="xs">
          © 2025 Community Portal. All rights reserved.
        </Text>
      </Box>
    </Box>
  );
}
