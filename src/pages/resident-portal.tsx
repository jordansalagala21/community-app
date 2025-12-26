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
  Dialog,
  RadioGroup,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
  query,
  where,
} from "firebase/firestore";
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

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  priority: string;
  date: string;
  status?: string;
  createdAt?: any;
};

const EventCard = ({ event, user }: { event: EventItem; user: any }) => {
  const [ticketCount, setTicketCount] = useState(1);
  const [isBooking, setIsBooking] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  const [hasBooked, setHasBooked] = useState(false);
  const [checkingBooking, setCheckingBooking] = useState(true);

  // Check if user has already booked this event
  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user?.uid) {
        setCheckingBooking(false);
        return;
      }

      try {
        const bookingsQuery = query(
          collection(db, "bookings"),
          where("eventId", "==", event.id),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(bookingsQuery);
        setHasBooked(!querySnapshot.empty);
      } catch (error) {
        console.error("Error checking booking:", error);
      } finally {
        setCheckingBooking(false);
      }
    };

    checkExistingBooking();
  }, [event.id, user?.uid]);

  const handleOpenBookingModal = () => {
    setIsBookingModalOpen(true);
  };

  const handleBooking = async () => {
    try {
      setIsBooking(true);

      // Create booking record
      await addDoc(collection(db, "bookings"), {
        eventId: event.id,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split("@")[0] || "Guest",
        ticketCount: ticketCount,
        paymentMethod: paymentMethod,
        totalAmount: event.isFree ? 0 : event.price * ticketCount,
        status: "confirmed",
        bookedAt: new Date().toISOString(),
      });

      // Update available tickets
      const eventRef = doc(db, "events", event.id);
      await updateDoc(eventRef, {
        availableTickets: event.availableTickets - ticketCount,
      });

      // Store booking details for success modal
      setBookingDetails({
        ticketCount,
        eventTitle: event.title,
        eventDate: event.date,
        eventTime: event.time,
        paymentMethod,
        totalAmount: event.isFree ? 0 : event.price * ticketCount,
      });

      setIsBookingModalOpen(false);
      setIsSuccessModalOpen(true);
      setTicketCount(1);
      setPaymentMethod("cash");
    } catch (error) {
      console.error("Booking error:", error);
      alert("Failed to complete booking. Please try again.");
    } finally {
      setIsBooking(false);
    }
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
            onClick={handleOpenBookingModal}
            disabled={
              event.availableTickets === 0 || hasBooked || checkingBooking
            }
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
            {checkingBooking
              ? "Checking..."
              : hasBooked
              ? "✓ Already Booked"
              : event.availableTickets === 0
              ? "Sold Out"
              : event.isFree
              ? "Reserve Tickets"
              : `Book for $${event.price * ticketCount}`}
          </Button>
        </Stack>
      </Stack>

      {/* Booking Modal */}
      <Dialog.Root
        open={isBookingModalOpen}
        onOpenChange={(e) => setIsBookingModalOpen(e.open)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Complete Booking</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text fontWeight="bold" fontSize="lg" color="navy.700">
                    {event.title}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    {event.date} at {event.time}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    📍 {event.location}
                  </Text>
                </Box>

                <Box
                  p={3}
                  bg="gray.50"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Flex justify="space-between" mb={2}>
                    <Text fontSize="sm">Tickets:</Text>
                    <Text fontSize="sm" fontWeight="bold">
                      {ticketCount} × ${event.isFree ? 0 : event.price}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text fontWeight="bold">Total:</Text>
                    <Text fontWeight="bold" color="navy.600" fontSize="lg">
                      ${event.isFree ? 0 : event.price * ticketCount}
                    </Text>
                  </Flex>
                </Box>

                {!event.isFree && (
                  <Box>
                    <Text fontWeight="medium" mb={2}>
                      Payment Method *
                    </Text>
                    <RadioGroup.Root
                      value={paymentMethod}
                      onValueChange={(details: any) =>
                        setPaymentMethod(details.value)
                      }
                    >
                      <Stack gap={3}>
                        <RadioGroup.Item value="cash">
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>
                            <HStack gap={2}>
                              <Text fontSize="md">💵</Text>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  Cash (Pay at entrance)
                                </Text>
                              </Box>
                            </HStack>
                          </RadioGroup.ItemText>
                          <RadioGroup.ItemHiddenInput />
                        </RadioGroup.Item>
                        <RadioGroup.Item value="zelle">
                          <RadioGroup.ItemControl />
                          <RadioGroup.ItemText>
                            <HStack gap={2}>
                              <Text fontSize="md">📱</Text>
                              <Box>
                                <Text fontSize="sm" fontWeight="medium">
                                  Zelle
                                </Text>
                              </Box>
                            </HStack>
                          </RadioGroup.ItemText>
                          <RadioGroup.ItemHiddenInput />
                        </RadioGroup.Item>
                      </Stack>
                    </RadioGroup.Root>
                  </Box>
                )}

                <Box
                  p={4}
                  bg="blue.50"
                  borderWidth="1px"
                  borderColor="blue.200"
                  rounded="lg"
                >
                  <Text fontSize="sm" fontWeight="bold" color="blue.700" mb={1}>
                    📸 Important Notice
                  </Text>
                  <Text fontSize="sm" color="gray.700">
                    Please keep a screenshot of your payment confirmation to
                    show at the event entrance.
                  </Text>
                </Box>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  onClick={() => setIsBookingModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={handleBooking}
                  loading={isBooking}
                >
                  Confirm Booking
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Booking Success Modal */}
      <Dialog.Root
        open={isSuccessModalOpen}
        onOpenChange={(e) => {
          if (!e.open) {
            setIsSuccessModalOpen(false);
            window.location.reload();
          }
        }}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content maxW="500px">
            <Dialog.Body>
              <Stack gap={5} py={4}>
                {/* Success Icon */}
                <Box textAlign="center">
                  <Box
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    w="80px"
                    h="80px"
                    bg="green.100"
                    rounded="full"
                    mb={4}
                  >
                    <Text fontSize="4xl">✅</Text>
                  </Box>
                  <Heading size="lg" color="green.700" mb={2}>
                    Booking Confirmed!
                  </Heading>
                  <Text color="gray.600">
                    Your tickets have been successfully reserved
                  </Text>
                </Box>

                {/* Booking Details */}
                {bookingDetails && (
                  <Box
                    bg="gray.50"
                    p={5}
                    rounded="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Stack gap={3}>
                      <Flex justify="space-between" align="start">
                        <Text fontSize="sm" color="gray.600">
                          Event
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="navy.700"
                          textAlign="right"
                        >
                          {bookingDetails.eventTitle}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Date & Time
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="medium"
                          color="gray.700"
                        >
                          {bookingDetails.eventDate} at{" "}
                          {bookingDetails.eventTime}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Tickets
                        </Text>
                        <Text fontSize="sm" fontWeight="bold" color="gray.700">
                          {bookingDetails.ticketCount}
                        </Text>
                      </Flex>
                      <Flex justify="space-between">
                        <Text fontSize="sm" color="gray.600">
                          Payment Method
                        </Text>
                        <Text
                          fontSize="sm"
                          fontWeight="bold"
                          color="green.600"
                          textTransform="uppercase"
                        >
                          {bookingDetails.paymentMethod}
                        </Text>
                      </Flex>
                      <Box
                        pt={3}
                        borderTopWidth="1px"
                        borderTopColor="gray.300"
                      >
                        <Flex justify="space-between" align="center">
                          <Text
                            fontSize="md"
                            fontWeight="bold"
                            color="gray.700"
                          >
                            Total Amount
                          </Text>
                          <Text
                            fontSize="xl"
                            fontWeight="bold"
                            color="navy.700"
                          >
                            ${bookingDetails.totalAmount}
                          </Text>
                        </Flex>
                      </Box>
                    </Stack>
                  </Box>
                )}

                {/* Important Notice */}
                <Box
                  bg="blue.50"
                  p={4}
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <HStack gap={2} mb={2}>
                    <Text fontSize="lg">📸</Text>
                    <Text fontSize="sm" fontWeight="bold" color="blue.700">
                      Important Reminder
                    </Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.700">
                    Please keep a screenshot of your payment confirmation to
                    show at the event entrance.
                  </Text>
                </Box>

                {/* Action Button */}
                <Button
                  bg="navy.600"
                  color="white"
                  size="lg"
                  width="full"
                  _hover={{ bg: "navy.700" }}
                  onClick={() => {
                    setIsSuccessModalOpen(false);
                    window.location.reload();
                  }}
                >
                  Got it, Thanks!
                </Button>
              </Stack>
            </Dialog.Body>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
};

export default function ResidentPortal() {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
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

  // Load events and announcements from Firestore
  useEffect(() => {
    loadEvents();
    loadAnnouncements();
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

  const loadAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const loadedAnnouncements: AnnouncementItem[] = [];
      querySnapshot.forEach((doc) => {
        const announcement = { id: doc.id, ...doc.data() } as AnnouncementItem;
        // Only show active announcements to residents
        if (!announcement.status || announcement.status === "active") {
          loadedAnnouncements.push(announcement);
        }
      });
      // Sort by date, most recent first
      loadedAnnouncements.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAnnouncements(loadedAnnouncements);
    } catch (error) {
      console.error("Error loading announcements:", error);
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

  const handleDeactivateAccount = async () => {
    if (!user?.uid) return;

    try {
      setIsDeactivating(true);

      // Update user status to deactivated in Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        status: "deactivated",
        deactivatedAt: new Date().toISOString(),
      });

      // Logout and redirect
      await logout();
      alert("Your account has been deactivated successfully.");
      window.location.href = "/";
    } catch (error) {
      console.error("Deactivation error:", error);
      alert("Failed to deactivate account. Please try again.");
      setIsDeactivating(false);
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
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => setIsDeactivateModalOpen(true)}
              >
                ⚙️ Settings
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
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => setIsDeactivateModalOpen(true)}
              >
                ⚙️
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

      {/* ANNOUNCEMENTS SECTION */}
      {announcements.length > 0 && (
        <Box
          bg="gradient-to-b"
          bgGradient="linear(to-b, gray.50, white)"
          py={{ base: 10, md: 14 }}
        >
          <Container maxW="7xl" px={{ base: 4, md: 6 }}>
            <Flex
              justify="space-between"
              align="center"
              mb={{ base: 6, md: 8 }}
            >
              <HStack gap={3}>
                <Box
                  fontSize={{ base: "2xl", md: "3xl" }}
                  bg="navy.100"
                  p={3}
                  rounded="xl"
                >
                  📢
                </Box>
                <Box>
                  <Heading size={{ base: "lg", md: "xl" }} color="navy.700">
                    Community Announcements
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    {announcements.length} active announcement
                    {announcements.length !== 1 ? "s" : ""}
                  </Text>
                </Box>
              </HStack>
            </Flex>

            <SimpleGrid columns={{ base: 1, md: 2 }} gap={{ base: 4, md: 6 }}>
              {announcements.slice(0, 4).map((announcement) => (
                <Box
                  key={announcement.id}
                  bg="white"
                  p={{ base: 5, md: 6 }}
                  rounded="2xl"
                  shadow="sm"
                  borderWidth="1px"
                  borderColor="gray.200"
                  position="relative"
                  overflow="hidden"
                  _hover={{ shadow: "md", transform: "translateY(-2px)" }}
                  transition="all 0.3s"
                >
                  {/* Priority Indicator Strip */}
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    h="4px"
                    bg={
                      announcement.priority === "High"
                        ? "red.500"
                        : announcement.priority === "Medium"
                        ? "orange.400"
                        : announcement.priority === "Low"
                        ? "blue.400"
                        : "navy.400"
                    }
                  />

                  <Stack gap={3}>
                    <Flex justify="space-between" align="start" gap={3}>
                      <Heading size="sm" color="navy.700" flex="1">
                        {announcement.title}
                      </Heading>
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        px={2.5}
                        py={1}
                        rounded="md"
                        bg={
                          announcement.priority === "High"
                            ? "red.50"
                            : announcement.priority === "Medium"
                            ? "orange.50"
                            : announcement.priority === "Low"
                            ? "blue.50"
                            : "gray.50"
                        }
                        color={
                          announcement.priority === "High"
                            ? "red.700"
                            : announcement.priority === "Medium"
                            ? "orange.700"
                            : announcement.priority === "Low"
                            ? "blue.700"
                            : "gray.700"
                        }
                        flexShrink={0}
                      >
                        {announcement.priority}
                      </Text>
                    </Flex>

                    <Text color="gray.700" fontSize="sm" lineHeight="tall">
                      {announcement.content}
                    </Text>

                    <Flex align="center" gap={2} pt={2}>
                      <Text fontSize="xs" color="gray.500">
                        📅{" "}
                        {new Date(announcement.date).toLocaleDateString(
                          "en-US",
                          {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          }
                        )}
                      </Text>
                    </Flex>
                  </Stack>
                </Box>
              ))}
            </SimpleGrid>
          </Container>
        </Box>
      )}

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
                <EventCard key={event.id} event={event} user={user} />
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

      {/* Deactivate Account Modal */}
      <Dialog.Root
        open={isDeactivateModalOpen}
        onOpenChange={(e) => setIsDeactivateModalOpen(e.open)}
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Account Settings</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={6}>
                <Box>
                  <Heading size="sm" mb={2} color="navy.700">
                    Profile Information
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Email:</strong> {user?.email}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    <strong>Name:</strong> {userName}
                  </Text>
                </Box>

                <Box
                  p={4}
                  bg="red.50"
                  borderWidth="1px"
                  borderColor="red.200"
                  rounded="lg"
                >
                  <Heading size="sm" mb={2} color="red.700">
                    ⚠️ Deactivate Account
                  </Heading>
                  <Text fontSize="sm" color="gray.700" mb={3}>
                    Deactivating your account will:
                  </Text>
                  <Stack gap={1} fontSize="sm" color="gray.600" ml={4}>
                    <Text>• Disable access to the resident portal</Text>
                    <Text>• Cancel all upcoming event bookings</Text>
                    <Text>• Remove you from community notifications</Text>
                  </Stack>
                  <Text
                    fontSize="sm"
                    color="red.600"
                    mt={3}
                    fontWeight="medium"
                  >
                    This action can be reversed by contacting an administrator.
                  </Text>
                  <Button
                    mt={4}
                    bg="red.600"
                    color="white"
                    size="sm"
                    width="full"
                    _hover={{ bg: "red.700" }}
                    onClick={handleDeactivateAccount}
                    loading={isDeactivating}
                  >
                    Deactivate My Account
                  </Button>
                </Box>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => setIsDeactivateModalOpen(false)}
              >
                Close
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Box>
  );
}
