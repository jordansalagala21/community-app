import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";

function DashboardContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  const stats = [
    {
      label: "Total Residents",
      value: "248",
      icon: "👥",
      change: "+12 this month",
    },
    { label: "Active Events", value: "8", icon: "🎉", change: "3 this week" },
    {
      label: "Pending Reservations",
      value: "15",
      icon: "📅",
      change: "Requires review",
    },
    { label: "Announcements", value: "23", icon: "📢", change: "5 unread" },
  ];

  const recentActivity = [
    {
      id: 1,
      title: "New reservation request",
      description: "John Doe requested clubhouse for Jan 25",
      time: "2 hours ago",
      type: "reservation",
    },
    {
      id: 2,
      title: "Event registration",
      description: "15 new registrations for Game Night",
      time: "5 hours ago",
      type: "event",
    },
    {
      id: 3,
      title: "New resident signup",
      description: "Jane Smith created an account",
      time: "1 day ago",
      type: "user",
    },
  ];

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Header */}
      <Box bg="navy.600" color="white" py={6} shadow="lg">
        <Container maxW="7xl">
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="xl" fontWeight="bold">
                Admin Dashboard
              </Heading>
              <Text fontSize="sm" color="whiteAlpha.800" mt={1}>
                Welcome back, {user?.email}
              </Text>
            </Box>
            <HStack gap={4}>
              <Button
                onClick={() => (window.location.href = "/")}
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                View Site
              </Button>
              <Button
                onClick={handleLogout}
                bg="white"
                color="navy.600"
                _hover={{ bg: "whiteAlpha.900" }}
              >
                Sign Out
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* Main Content */}
      <Container maxW="7xl" py={10}>
        {/* Stats Grid */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6} mb={10}>
          {stats.map((stat) => (
            <Box
              key={stat.label}
              bg="white"
              p={6}
              rounded="xl"
              shadow="md"
              borderWidth="2px"
              borderColor="navy.100"
              transition="all 0.3s"
              _hover={{
                transform: "translateY(-4px)",
                shadow: "lg",
                borderColor: "navy.300",
              }}
            >
              <HStack justify="space-between" mb={3}>
                <Text fontSize="3xl">{stat.icon}</Text>
                <Text fontSize="3xl" fontWeight="bold" color="navy.700">
                  {stat.value}
                </Text>
              </HStack>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700" mb={1}>
                {stat.label}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {stat.change}
              </Text>
            </Box>
          ))}
        </SimpleGrid>

        {/* Two Column Layout */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={8}>
          {/* Recent Activity */}
          <Box
            bg="white"
            rounded="2xl"
            shadow="lg"
            p={8}
            borderWidth="2px"
            borderColor="navy.200"
          >
            <Heading size="lg" color="navy.700" mb={6}>
              📋 Recent Activity
            </Heading>
            <Stack gap={4}>
              {recentActivity.map((activity) => (
                <Box
                  key={activity.id}
                  p={4}
                  bg="gray.50"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontWeight="semibold" color="navy.700" mb={1}>
                    {activity.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    {activity.description}
                  </Text>
                  <Text fontSize="xs" color="gray.500">
                    {activity.time}
                  </Text>
                </Box>
              ))}
            </Stack>
            <Button
              mt={6}
              variant="outline"
              borderColor="navy.500"
              color="navy.500"
              width="full"
              _hover={{ bg: "navy.50" }}
            >
              View All Activity
            </Button>
          </Box>

          {/* Quick Actions */}
          <Box
            bg="white"
            rounded="2xl"
            shadow="lg"
            p={8}
            borderWidth="2px"
            borderColor="navy.200"
          >
            <Heading size="lg" color="navy.700" mb={6}>
              ⚡ Quick Actions
            </Heading>
            <VStack gap={4}>
              <Button
                width="full"
                size="lg"
                bg="navy.500"
                color="white"
                justifyContent="flex-start"
                px={6}
                _hover={{ bg: "navy.600" }}
              >
                <HStack gap={3}>
                  <Text fontSize="xl">📢</Text>
                  <Text>Create Announcement</Text>
                </HStack>
              </Button>
              <Button
                width="full"
                size="lg"
                bg="navy.500"
                color="white"
                justifyContent="flex-start"
                px={6}
                _hover={{ bg: "navy.600" }}
              >
                <HStack gap={3}>
                  <Text fontSize="xl">🎉</Text>
                  <Text>Create Event</Text>
                </HStack>
              </Button>
              <Button
                width="full"
                size="lg"
                bg="navy.500"
                color="white"
                justifyContent="flex-start"
                px={6}
                _hover={{ bg: "navy.600" }}
              >
                <HStack gap={3}>
                  <Text fontSize="xl">📅</Text>
                  <Text>Manage Reservations</Text>
                </HStack>
              </Button>
              <Button
                width="full"
                size="lg"
                bg="navy.500"
                color="white"
                justifyContent="flex-start"
                px={6}
                _hover={{ bg: "navy.600" }}
              >
                <HStack gap={3}>
                  <Text fontSize="xl">👥</Text>
                  <Text>View Residents</Text>
                </HStack>
              </Button>
              <Button
                width="full"
                size="lg"
                bg="white"
                color="navy.500"
                borderWidth="2px"
                borderColor="navy.500"
                justifyContent="flex-start"
                px={6}
                _hover={{ bg: "navy.50" }}
              >
                <HStack gap={3}>
                  <Text fontSize="xl">⚙️</Text>
                  <Text>Settings</Text>
                </HStack>
              </Button>
            </VStack>
          </Box>
        </SimpleGrid>

        {/* Pending Items */}
        <Box
          mt={8}
          bg="white"
          rounded="2xl"
          shadow="lg"
          p={8}
          borderWidth="2px"
          borderColor="orange.200"
        >
          <Heading size="lg" color="navy.700" mb={6}>
            ⏳ Pending Items
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
            <Box
              p={5}
              bg="orange.50"
              rounded="lg"
              borderWidth="1px"
              borderColor="orange.200"
            >
              <Text fontSize="2xl" fontWeight="bold" color="orange.600">
                15
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Reservation Requests
              </Text>
              <Button
                mt={3}
                size="sm"
                bg="orange.500"
                color="white"
                _hover={{ bg: "orange.600" }}
              >
                Review
              </Button>
            </Box>
            <Box
              p={5}
              bg="blue.50"
              rounded="lg"
              borderWidth="1px"
              borderColor="blue.200"
            >
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                8
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Event Approvals
              </Text>
              <Button
                mt={3}
                size="sm"
                bg="blue.500"
                color="white"
                _hover={{ bg: "blue.600" }}
              >
                Review
              </Button>
            </Box>
            <Box
              p={5}
              bg="purple.50"
              rounded="lg"
              borderWidth="1px"
              borderColor="purple.200"
            >
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                12
              </Text>
              <Text fontSize="sm" fontWeight="semibold" color="gray.700">
                Support Tickets
              </Text>
              <Button
                mt={3}
                size="sm"
                bg="purple.500"
                color="white"
                _hover={{ bg: "purple.600" }}
              >
                Review
              </Button>
            </Box>
          </SimpleGrid>
        </Box>
      </Container>
    </Box>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <DashboardContent />
    </ProtectedRoute>
  );
}
