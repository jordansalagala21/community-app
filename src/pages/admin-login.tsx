import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Input,
  Stack,
  Text,
  VStack,
  HStack,
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
    <Box bg="gray.50" minH="100vh" py={{ base: 12, md: 20 }}>
      <Container maxW="md">
        <Box
          bg="white"
          rounded="2xl"
          shadow="2xl"
          p={{ base: 8, md: 10 }}
          borderWidth="2px"
          borderColor="navy.200"
        >
          {/* Header */}
          <VStack gap={6} mb={8} textAlign="center">
            <Box
              w="80px"
              h="80px"
              rounded="full"
              bg="navy.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="3xl"
              color="white"
              fontWeight="bold"
            >
              🔐
            </Box>
            <Box>
              <Heading size="xl" color="navy.700" mb={2}>
                Admin Portal
              </Heading>
              <Text color="gray.600" fontSize="lg">
                Sign in to access the dashboard
              </Text>
            </Box>
          </VStack>

          {/* Error Alert */}
          {error && (
            <Box
              rounded="lg"
              mb={6}
              p={4}
              bg="red.50"
              borderWidth="1px"
              borderColor="red.200"
            >
              <Text color="red.700" fontSize="sm" fontWeight="semibold">
                ⚠️ {error}
              </Text>
            </Box>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit}>
            <Stack gap={6}>
              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="navy.700"
                  mb={2}
                >
                  Email Address
                </Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@yourcommunity.com"
                  size="lg"
                  bg="gray.50"
                  borderWidth="2px"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "navy.500",
                    bg: "white",
                  }}
                  required
                />
              </Box>

              <Box>
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="navy.700"
                  mb={2}
                >
                  Password
                </Text>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  size="lg"
                  bg="gray.50"
                  borderWidth="2px"
                  borderColor="gray.200"
                  _focus={{
                    borderColor: "navy.500",
                    bg: "white",
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
                py={6}
                loading={loading}
                _hover={{
                  bg: "navy.600",
                }}
              >
                Sign In
              </Button>
            </Stack>
          </form>

          {/* Footer */}
          <Box mt={8} textAlign="center">
            <HStack justify="center" gap={2}>
              <Text color="gray.600" fontSize="sm">
                Not an admin?
              </Text>
              <Button
                variant="plain"
                color="navy.500"
                fontSize="sm"
                fontWeight="semibold"
                onClick={() => (window.location.href = "/")}
              >
                Go to Home
              </Button>
            </HStack>
          </Box>
        </Box>

        {/* Demo Credentials Info */}
        <Box
          mt={6}
          p={4}
          bg="blue.50"
          rounded="lg"
          borderWidth="1px"
          borderColor="blue.200"
        >
          <Text fontSize="sm" color="blue.700" fontWeight="semibold" mb={2}>
            💡 Demo Credentials
          </Text>
          <Text fontSize="xs" color="blue.600">
            Email: admin@yourcommunity.com
          </Text>
          <Text fontSize="xs" color="blue.600">
            Password: (Set up in Firebase Authentication)
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
