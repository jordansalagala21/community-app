import { useAuth } from "../contexts/AuthContext";
import {
  Box,
  Spinner,
  Container,
  Heading,
  Text,
  Button,
} from "@chakra-ui/react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
}: ProtectedRouteProps) {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <Box
        minH="100vh"
        display="flex"
        alignItems="center"
        justifyContent="center"
        bg="gray.50"
      >
        <Spinner size="xl" color="navy.500" borderWidth="4px" />
      </Box>
    );
  }

  if (!user) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="md" textAlign="center">
          <Heading size="xl" mb={4} color="navy.700">
            Access Denied
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            You must be logged in to access this page.
          </Text>
          <Button
            onClick={() =>
              (window.location.href = requireAdmin
                ? "/admin/login"
                : "/resident/login")
            }
            bg="navy.500"
            color="white"
            size="lg"
            _hover={{ bg: "navy.600" }}
          >
            {requireAdmin ? "Go to Admin Login" : "Go to Login"}
          </Button>
        </Container>
      </Box>
    );
  }

  if (requireAdmin && !isAdmin) {
    return (
      <Box
        minH="100vh"
        bg="gray.50"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Container maxW="md" textAlign="center">
          <Heading size="xl" mb={4} color="navy.700">
            Admin Access Required
          </Heading>
          <Text fontSize="lg" color="gray.600" mb={6}>
            You don't have permission to access this page.
          </Text>
          <Button
            onClick={() => (window.location.href = "/")}
            bg="navy.500"
            color="white"
            size="lg"
            _hover={{ bg: "navy.600" }}
          >
            Go to Home
          </Button>
        </Container>
      </Box>
    );
  }

  return <>{children}</>;
}
