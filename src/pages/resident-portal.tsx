// src/pages/resident-portal.tsx
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
  Input,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";

type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  availableTickets: number;
  price: number;
  isFree?: boolean;
  category: string;
};

const EventCard = ({ event }: { event: EventItem }) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const handleBooking = () => {
    setIsBooking(true);
    // Simulate booking
    setTimeout(() => {
      alert(`Successfully booked ${ticketCount} ticket(s) for ${event.title}!`);
      setIsBooking(false);
      setTicketCount(1);
    }, 1000);
  };

  return (
    <Box
      bg="white"
      borderWidth="2px"
      borderColor="navy.200"
      rounded="xl"
      shadow="lg"
      p={{ base: 5, md: 6 }}
      transition="all 0.3s"
      _hover={{
        shadow: "xl",
        borderColor: "navy.400",
      }}
    >
      <Stack gap={4}>
        {/* Header */}
        <Flex justify="space-between" align="start" gap={3} flexWrap="wrap">
          <Box flex="1">
            <Heading size={{ base: "sm", md: "md" }} color="navy.700" mb={2}>
              {event.title}
            </Heading>
            <HStack gap={2} flexWrap="wrap">
              <Box
                as="span"
                px={2}
                py={0.5}
                bg={event.isFree ? "green.100" : "blue.100"}
                color={event.isFree ? "green.700" : "blue.700"}
                rounded="full"
                fontSize="xs"
                fontWeight="bold"
              >
                {event.isFree ? "Free" : `$${event.price}`}
              </Box>
              <Box
                as="span"
                px={2}
                py={0.5}
                bg="navy.100"
                color="navy.700"
                rounded="full"
                fontSize="xs"
                fontWeight="bold"
              >
                {event.category}
              </Box>
            </HStack>
          </Box>
        </Flex>

        {/* Event Details */}
        <Stack gap={2} fontSize={{ base: "xs", sm: "sm" }} color="gray.600">
          <HStack gap={2}>
            <Text fontWeight="semibold">📅</Text>
            <Text>{event.date}</Text>
          </HStack>
          <HStack gap={2}>
            <Text fontWeight="semibold">🕐</Text>
            <Text>{event.time}</Text>
          </HStack>
          <HStack gap={2}>
            <Text fontWeight="semibold">📍</Text>
            <Text>{event.location}</Text>
          </HStack>
        </Stack>

        <Text
          color="gray.700"
          fontSize={{ base: "sm", md: "md" }}
          lineHeight="1.6"
        >
          {event.description}
        </Text>

        {/* Availability */}
        <Flex
          align="center"
          justify="space-between"
          p={3}
          bg="gray.50"
          rounded="lg"
          fontSize={{ base: "xs", sm: "sm" }}
        >
          <Text fontWeight="medium" color="gray.700">
            Available tickets
          </Text>
          <Text
            fontWeight="bold"
            color={event.availableTickets < 10 ? "red.600" : "green.600"}
          >
            {event.availableTickets} left
          </Text>
        </Flex>

        {/* Booking Section */}
        <Stack gap={3}>
          <Flex gap={2} align="center">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Quantity:
            </Text>
            <HStack gap={2}>
              <Button
                size="sm"
                onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                bg="gray.200"
                color="gray.700"
                _hover={{ bg: "gray.300" }}
              >
                -
              </Button>
              <Input
                value={ticketCount}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setTicketCount(
                    Math.max(1, Math.min(event.availableTickets, val))
                  );
                }}
                w="60px"
                textAlign="center"
                size="sm"
              />
              <Button
                size="sm"
                onClick={() =>
                  setTicketCount(
                    Math.min(event.availableTickets, ticketCount + 1)
                  )
                }
                bg="gray.200"
                color="gray.700"
                _hover={{ bg: "gray.300" }}
              >
                +
              </Button>
            </HStack>
          </Flex>

          <Button
            onClick={handleBooking}
            disabled={isBooking || event.availableTickets === 0}
            loading={isBooking}
            bg="navy.500"
            color="white"
            size="lg"
            width="full"
            _hover={{
              bg: "navy.600",
            }}
            _disabled={{
              opacity: 0.5,
              cursor: "not-allowed",
            }}
          >
            {event.availableTickets === 0
              ? "Sold Out"
              : event.isFree
              ? "Reserve Tickets"
              : `Book for $${event.price * ticketCount}`}
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};

export default function ResidentPortal() {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();

  const categories = [
    "All",
    "Social",
    "Dining",
    "Fitness",
    "Entertainment",
    "Kids",
    "Service",
  ];

  // Load events from Firestore
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "events"));
      const loadedEvents: EventItem[] = [];
      querySnapshot.forEach((doc) => {
        loadedEvents.push({ id: doc.id, ...doc.data() } as EventItem);
      });
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents =
    filterCategory === "All"
      ? events
      : events.filter((e) => e.category === filterCategory);

  // Get user's display name or email
  const userName =
    user?.displayName || user?.email?.split("@")[0] || "Resident";

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Box bg="gray.50" minH="100vh">
      {/* NAVIGATION HEADER */}
      <Box bg="navy.700" py={3}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center">
            <HStack gap={2}>
              <Box
                w={{ base: "32px", md: "40px" }}
                h={{ base: "32px", md: "40px" }}
                rounded="lg"
                bg="white"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize={{ base: "md", md: "xl" }}
              >
                🏠
              </Box>
              <Heading size={{ base: "sm", md: "md" }} color="white">
                Resident Portal
              </Heading>
            </HStack>

            <HStack gap={3} display={{ base: "none", md: "flex" }}>
              <Text color="whiteAlpha.900" fontSize="sm" fontWeight="medium">
                Welcome, {userName}
              </Text>
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
                bg="red.500"
                color="white"
                size="sm"
                fontWeight="bold"
                _hover={{ bg: "red.600" }}
                onClick={handleLogout}
              >
                🚪 Logout
              </Button>
            </HStack>

            {/* Mobile Navigation */}
            <HStack gap={2} display={{ base: "flex", md: "none" }}>
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
                bg="red.500"
                color="white"
                size="sm"
                fontWeight="semibold"
                _hover={{ bg: "red.600" }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>
          </Flex>
        </Container>
      </Box>

      {/* HERO SECTION */}
      <Box bg="navy.600" color="white" py={{ base: 12, md: 16 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 4, md: 6 }} textAlign="center">
            <Heading
              size={{ base: "xl", sm: "2xl", md: "3xl" }}
              fontWeight="800"
              lineHeight="1.1"
            >
              Your Community Hub
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="whiteAlpha.900"
              maxW="3xl"
              mx="auto"
            >
              Book tickets for upcoming events, reserve the clubhouse, and stay
              connected with your neighborhood. Everything you need in one
              place.
            </Text>
          </Stack>
        </Container>
      </Box>

      {/* UPCOMING EVENTS SECTION */}
      <Container maxW="7xl" py={{ base: 10, md: 16 }} px={{ base: 4, md: 6 }}>
        <Box textAlign="center" mb={{ base: 8, md: 12 }}>
          <Heading
            size={{ base: "xl", md: "2xl" }}
            mb={{ base: 3, md: 4 }}
            color="navy.700"
          >
            🎫 Upcoming Events
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="2xl"
            mx="auto"
            px={{ base: 2, md: 0 }}
          >
            Browse and book tickets for community events
          </Text>
        </Box>

        {/* Category Filter */}
        <Flex
          gap={2}
          mb={{ base: 6, md: 8 }}
          justify="center"
          flexWrap="wrap"
          px={{ base: 2, md: 0 }}
        >
          {categories.map((cat) => (
            <Button
              key={cat}
              size="sm"
              onClick={() => setFilterCategory(cat)}
              bg={filterCategory === cat ? "navy.500" : "white"}
              color={filterCategory === cat ? "white" : "navy.600"}
              borderWidth="2px"
              borderColor="navy.500"
              _hover={{
                bg: filterCategory === cat ? "navy.600" : "navy.50",
              }}
            >
              {cat}
            </Button>
          ))}
        </Flex>

        {/* Events Grid */}
        {loading ? (
          <Box textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.600">
              Loading events...
            </Text>
          </Box>
        ) : (
          <>
            <SimpleGrid
              columns={{ base: 1, lg: 2 }}
              gap={{ base: 4, md: 6, lg: 8 }}
            >
              {filteredEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </SimpleGrid>

            {filteredEvents.length === 0 && !loading && (
              <Box textAlign="center" py={12}>
                <Text fontSize="lg" color="gray.500">
                  {events.length === 0
                    ? "No events available yet. Check back soon!"
                    : "No events found in this category."}
                </Text>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* CLUBHOUSE RESERVATION CTA */}
      <Container maxW="7xl" py={{ base: 10, md: 16 }} px={{ base: 4, md: 6 }}>
        <Box
          bg="navy.600"
          color="white"
          p={{ base: 6, md: 12 }}
          rounded={{ base: "2xl", md: "3xl" }}
          shadow="2xl"
        >
          <Flex
            direction={{ base: "column", md: "row" }}
            align={{ base: "stretch", md: "center" }}
            justify="space-between"
            gap={{ base: 4, md: 6 }}
            textAlign={{ base: "center", md: "left" }}
          >
            <Box>
              <Heading
                size={{ base: "lg", md: "xl" }}
                mb={{ base: 2, md: 3 }}
                fontWeight="bold"
              >
                Need to reserve the clubhouse?
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.900">
                View availability and book your private event today.
              </Text>
            </Box>
            <Button
              onClick={() => (window.location.href = "/reservations")}
              size="lg"
              bg="white"
              color="navy.600"
              px={{ base: 6, md: 8 }}
              py={6}
              fontSize="md"
              fontWeight="bold"
              flexShrink={0}
              width={{ base: "full", md: "auto" }}
              _hover={{
                bg: "whiteAlpha.900",
              }}
            >
              📅 View Calendar
            </Button>
          </Flex>
        </Box>
      </Container>

      {/* FOOTER */}
      <Box bg="navy.800" color="white" py={{ base: 8, md: 12 }}>
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Stack gap={{ base: 6, md: 8 }}>
            <Flex
              justify="space-between"
              align={{ base: "start", md: "center" }}
              direction={{ base: "column", md: "row" }}
              gap={{ base: 4, md: 0 }}
            >
              <Box>
                <Heading size={{ base: "md", md: "lg" }} mb={2}>
                  Community Portal
                </Heading>
                <Text
                  fontSize={{ base: "sm", md: "md" }}
                  color="whiteAlpha.800"
                >
                  Your neighborhood, connected.
                </Text>
              </Box>
              <HStack gap={4} flexWrap="wrap">
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
                  onClick={() => (window.location.href = "/admin/login")}
                >
                  Organizer Login
                </Button>
              </HStack>
            </Flex>
            <Box
              pt={{ base: 4, md: 6 }}
              borderTopWidth="1px"
              borderTopColor="whiteAlpha.300"
              textAlign="center"
            >
              <Text fontSize={{ base: "xs", md: "sm" }} color="whiteAlpha.700">
                © 2025 Community Portal. All rights reserved.
              </Text>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
