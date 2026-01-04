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
  NativeSelectRoot,
  NativeSelectField,
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
  startTime: string;
  endTime: string;
  location: string;
  description: string;
  availableTickets: number;
  price: number;
  isFree?: boolean;
  category: string[];
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

type ClubhouseReservation = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  deposit: number;
  isAvailable: boolean;
  reservedBy?: string;
  reservedByEmail?: string;
  reservedByName?: string;
  reservedAt?: string;
  paymentMethod?: string;
  status?: string;
};

// Helper function to check if a reservation date has passed
const isReservationPast = (reservation: ClubhouseReservation): boolean => {
  const reservationDate = new Date(reservation.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return reservationDate < today;
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
        eventStartTime: event.startTime,
        eventEndTime: event.endTime,
        userId: user?.uid,
        userEmail: user?.email,
        userName: user?.displayName || user?.email?.split("@")[0] || "Guest",
        ticketCount: ticketCount,
        paymentMethod: paymentMethod,
        totalAmount: event.isFree ? 0 : event.price * ticketCount,
        status: event.isFree ? "confirmed" : "pending payment",
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
        eventStartTime: event.startTime,
        eventEndTime: event.endTime,
        paymentMethod,
        totalAmount: event.isFree ? 0 : event.price * ticketCount,
        isFree: event.isFree,
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
                bg={event.isFree ? "green.100" : "purple.100"}
                color={event.isFree ? "green.700" : "purple.700"}
                rounded="full"
                fontSize="xs"
                fontWeight="bold"
              >
                {event.isFree ? "Free" : `$${event.price}`}
              </Box>
              {/* Display multiple categories */}
              {event.category &&
                event.category.length > 0 &&
                (Array.isArray(event.category)
                  ? event.category
                  : [event.category]
                )
                  .filter((cat) => typeof cat === "string" && cat.trim() !== "")
                  .map((cat, index) => (
                    <Box
                      key={`${cat}-${index}`}
                      as="span"
                      px={2}
                      py={0.5}
                      bg="navy.100"
                      color="navy.700"
                      rounded="full"
                      fontSize="xs"
                      fontWeight="bold"
                    >
                      {cat}
                    </Box>
                  ))}
            </HStack>
          </Box>
        </Flex>

        {/* Event Details */}
        <Stack gap={2} fontSize={{ base: "xs", sm: "sm" }} color="gray.600">
          <HStack gap={2}>
            <Text fontWeight="semibold">Date:</Text>
            <Text>{event.date}</Text>
          </HStack>
          <HStack gap={2}>
            <Text fontWeight="semibold">Time:</Text>
            <Text>
              {event.startTime} - {event.endTime}
            </Text>
          </HStack>
          <HStack gap={2}>
            <Text fontWeight="semibold">Location:</Text>
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
          <Flex gap={2} align="center" justify="space-between">
            <Text fontSize="sm" fontWeight="medium" color="gray.700">
              Quantity:
            </Text>
            <Text fontSize="xs" color="gray.500">
              (Max 5 tickets per booking)
            </Text>
          </Flex>
          <Flex gap={2} align="center">
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
                  const maxAllowed = Math.min(event.availableTickets, 5);
                  setTicketCount(Math.max(1, Math.min(maxAllowed, val)));
                }}
                w="60px"
                textAlign="center"
                size="sm"
              />
              <Button
                size="sm"
                onClick={() => {
                  const maxAllowed = Math.min(event.availableTickets, 5);
                  setTicketCount(Math.min(maxAllowed, ticketCount + 1));
                }}
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
                    {event.date} at {event.startTime} - {event.endTime}
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
                  p={5}
                  bg="orange.50"
                  borderWidth="2px"
                  borderColor="orange.400"
                  rounded="xl"
                  shadow="md"
                >
                  <HStack gap={3} mb={2} align="center">
                    <Text fontSize="2xl">⚠️</Text>
                    <Text fontSize="md" fontWeight="bold" color="orange.800">
                      IMPORTANT - READ CAREFULLY
                    </Text>
                  </HStack>
                  <Text
                    fontSize="md"
                    color="orange.900"
                    fontWeight="medium"
                    lineHeight="1.6"
                  >
                    📸 Please take a screenshot of your payment confirmation and
                    bring it to the event entrance.
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
                    <Text fontSize="4xl" fontWeight="bold" color="green.600">
                      ✓
                    </Text>
                  </Box>
                  <Heading size="lg" color="green.700" mb={2}>
                    {bookingDetails?.isFree
                      ? "Booking Confirmed!"
                      : "Booking Pending Payment"}
                  </Heading>
                  <Text color="gray.600">
                    {bookingDetails?.isFree
                      ? "Your tickets have been successfully reserved"
                      : "Please complete payment. Admin will verify and send confirmation email."}
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
                          {bookingDetails.eventStartTime} -{" "}
                          {bookingDetails.eventEndTime}
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
                  p={5}
                  bg="orange.50"
                  borderWidth="2px"
                  borderColor="orange.400"
                  rounded="xl"
                  shadow="md"
                >
                  <HStack gap={3} mb={2} align="center">
                    <Text fontSize="2xl">⚠️</Text>
                    <Text fontSize="md" fontWeight="bold" color="orange.800">
                      IMPORTANT - READ CAREFULLY
                    </Text>
                  </HStack>
                  <Text
                    fontSize="md"
                    color="orange.900"
                    fontWeight="medium"
                    lineHeight="1.6"
                  >
                    📸 Please take a screenshot of your payment confirmation and
                    bring it to the event entrance.
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

// Calendar View Component
const CalendarView = ({
  reservations,
  currentMonth,
  onMonthChange,
  onRequestReservation,
}: {
  reservations: ClubhouseReservation[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onRequestReservation: () => void;
}) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days in month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getReservationsForDate = (date: Date | null) => {
    if (!date) return [];
    const dateStr = date.toISOString().split("T")[0];
    return reservations.filter((r) => r.date === dateStr);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Box
      bg="white"
      rounded="xl"
      shadow="lg"
      p={{ base: 4, md: 6 }}
      borderWidth="1px"
      borderColor="gray.200"
    >
      {/* Calendar Header */}
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        gap={3}
      >
        <Button
          size="sm"
          variant="ghost"
          onClick={goToPreviousMonth}
          _hover={{ bg: "gray.100" }}
        >
          ← Previous
        </Button>
        <Heading size="md" color="navy.700">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </Heading>
        <Button
          size="sm"
          variant="ghost"
          onClick={goToNextMonth}
          _hover={{ bg: "gray.100" }}
        >
          Next →
        </Button>
      </Flex>

      {/* Request Reservation Button */}
      <Flex justify="center" mb={6}>
        <Button
          onClick={onRequestReservation}
          bg="navy.600"
          color="white"
          size="md"
          _hover={{ bg: "navy.700" }}
          px={6}
        >
          + Request Reservation
        </Button>
      </Flex>

      {/* Weekday Headers */}
      <SimpleGrid columns={7} gap={2} mb={2}>
        {weekDays.map((day) => (
          <Box
            key={day}
            textAlign="center"
            fontWeight="bold"
            fontSize="sm"
            color="gray.600"
            py={2}
          >
            {day}
          </Box>
        ))}
      </SimpleGrid>

      {/* Calendar Grid */}
      <SimpleGrid columns={7} gap={2}>
        {days.map((date, index) => {
          const dayReservations = getReservationsForDate(date);
          const isToday =
            date && date.toDateString() === new Date().toDateString();
          const isPast =
            date && date < new Date(new Date().setHours(0, 0, 0, 0));

          return (
            <Box
              key={index}
              minH={{ base: "80px", md: "100px" }}
              bg={date ? (isToday ? "blue.50" : "gray.50") : "transparent"}
              rounded="lg"
              p={2}
              borderWidth={date ? "1px" : "0"}
              borderColor={isToday ? "blue.300" : "gray.200"}
              position="relative"
              opacity={isPast ? 0.5 : 1}
            >
              {date && (
                <>
                  <Text
                    fontSize="sm"
                    fontWeight={isToday ? "bold" : "medium"}
                    color={isToday ? "blue.700" : "gray.700"}
                    mb={1}
                  >
                    {date.getDate()}
                  </Text>
                  {dayReservations.length > 0 && (
                    <Stack gap={1}>
                      {dayReservations.slice(0, 2).map((res, idx) => (
                        <Box
                          key={idx}
                          bg="green.100"
                          color="green.700"
                          fontSize="xs"
                          px={1.5}
                          py={0.5}
                          rounded="md"
                          fontWeight="semibold"
                          whiteSpace="nowrap"
                          overflow="hidden"
                          textOverflow="ellipsis"
                          title={`${res.startTime} - ${res.endTime}: ${res.purpose}`}
                        >
                          {res.startTime}
                        </Box>
                      ))}
                      {dayReservations.length > 2 && (
                        <Text fontSize="xs" color="gray.600" fontWeight="bold">
                          +{dayReservations.length - 2} more
                        </Text>
                      )}
                    </Stack>
                  )}
                </>
              )}
            </Box>
          );
        })}
      </SimpleGrid>

      {/* Legend */}
      <Flex gap={4} mt={4} flexWrap="wrap" justify="center">
        <HStack gap={2} fontSize="sm">
          <Box w={3} h={3} bg="blue.100" rounded="sm" />
          <Text color="gray.600">Today</Text>
        </HStack>
        <HStack gap={2} fontSize="sm">
          <Box w={3} h={3} bg="green.100" rounded="sm" />
          <Text color="gray.600">Reserved</Text>
        </HStack>
      </Flex>

      {/* Reservations List for Selected Month */}
      {reservations.filter((r) => {
        const resDate = new Date(r.date);
        return (
          resDate.getMonth() === currentMonth.getMonth() &&
          resDate.getFullYear() === currentMonth.getFullYear()
        );
      }).length > 0 && (
        <Box mt={6} pt={6} borderTopWidth="1px" borderColor="gray.200">
          <Heading size="sm" color="navy.700" mb={4}>
            Reservations This Month
          </Heading>
          <Stack gap={3}>
            {reservations
              .filter((r) => {
                const resDate = new Date(r.date);
                return (
                  resDate.getMonth() === currentMonth.getMonth() &&
                  resDate.getFullYear() === currentMonth.getFullYear()
                );
              })
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((res) => (
                <Flex
                  key={res.id}
                  gap={3}
                  p={3}
                  bg="gray.50"
                  rounded="lg"
                  borderWidth="1px"
                  borderColor="gray.200"
                  align="center"
                  flexWrap="wrap"
                >
                  <Box flex="1" minW="150px">
                    <Text fontSize="sm" fontWeight="bold" color="navy.700">
                      {new Date(res.date).toLocaleDateString("en-US", {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {res.startTime} - {res.endTime}
                    </Text>
                  </Box>
                  <Box flex="2" minW="200px">
                    <Text fontSize="sm" color="gray.700">
                      {res.purpose}
                    </Text>
                  </Box>
                  <Box
                    px={2}
                    py={1}
                    bg="green.100"
                    color="green.700"
                    rounded="full"
                    fontSize="xs"
                    fontWeight="bold"
                  >
                    Booked
                  </Box>
                </Flex>
              ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default function ResidentPortal() {
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [events, setEvents] = useState<EventItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [clubhouseReservations, setClubhouseReservations] = useState<
    ClubhouseReservation[]
  >([]);
  const [isClubhouseModalOpen, setIsClubhouseModalOpen] = useState(false);
  const [clubhousePaymentMethod, setClubhousePaymentMethod] = useState("cash");
  const [isBookingClubhouse, setIsBookingClubhouse] = useState(false);
  const [clubhouseViewMode, setClubhouseViewMode] = useState<
    "list" | "calendar"
  >("list");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [clubhouseForm, setClubhouseForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });
  const [clubhouseErrors, setClubhouseErrors] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "",
  });
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

  // Load events, announcements, and clubhouse from Firestore
  useEffect(() => {
    loadEvents();
    loadAnnouncements();
    loadClubhouseReservations();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "events"));
      const loadedEvents: EventItem[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Ensure category is always an array of strings
        let category: string[] = [];
        if (Array.isArray(data.category)) {
          // Filter to only include valid strings
          category = data.category.filter(
            (item) => typeof item === "string" && item.trim() !== ""
          );
        } else if (
          typeof data.category === "string" &&
          data.category.trim() !== ""
        ) {
          category = [data.category.trim()];
        }

        loadedEvents.push({
          id: doc.id,
          ...data,
          category,
        } as EventItem);
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

  const loadClubhouseReservations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clubhouse"));
      const loadedReservations: ClubhouseReservation[] = [];
      querySnapshot.forEach((doc) => {
        const reservation = {
          id: doc.id,
          ...doc.data(),
        } as ClubhouseReservation;
        // Load all reservations (including past ones for history)
        loadedReservations.push(reservation);
      });
      // Sort by date and time
      loadedReservations.sort((a, b) => {
        const dateCompare =
          new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
      setClubhouseReservations(loadedReservations);
    } catch (error) {
      console.error("Error loading clubhouse reservations:", error);
    }
  };

  const handleBookClubhouse = async () => {
    if (!user) return;

    // Reset errors
    const errors = {
      date: "",
      startTime: "",
      endTime: "",
      purpose: "",
    };
    let hasError = false;

    // Validate date
    if (!clubhouseForm.date) {
      errors.date = "Date is required";
      hasError = true;
    } else {
      const selectedDate = new Date(clubhouseForm.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        errors.date = "Date cannot be in the past";
        hasError = true;
      }
    }

    // Validate start time
    if (!clubhouseForm.startTime) {
      errors.startTime = "Start time is required";
      hasError = true;
    }

    // Validate end time
    if (!clubhouseForm.endTime) {
      errors.endTime = "End time is required";
      hasError = true;
    }

    // Additional time validation only if both times are provided
    if (clubhouseForm.startTime && clubhouseForm.endTime) {
      // Check if end time is after start time
      const startMinutes =
        parseInt(clubhouseForm.startTime.split(":")[0]) * 60 +
        parseInt(clubhouseForm.startTime.split(":")[1]);
      const endMinutes =
        parseInt(clubhouseForm.endTime.split(":")[0]) * 60 +
        parseInt(clubhouseForm.endTime.split(":")[1]);

      if (endMinutes <= startMinutes) {
        errors.endTime = "End time must be after start time";
        hasError = true;
      } else if (endMinutes - startMinutes < 60) {
        errors.endTime = "Reservation must be at least 1 hour";
        hasError = true;
      }
    }

    // Validate purpose
    if (!clubhouseForm.purpose.trim()) {
      errors.purpose = "Purpose/Event type is required";
      hasError = true;
    } else if (clubhouseForm.purpose.trim().length < 3) {
      errors.purpose = "Purpose must be at least 3 characters";
      hasError = true;
    } else if (clubhouseForm.purpose.trim().length > 100) {
      errors.purpose = "Purpose must be less than 100 characters";
      hasError = true;
    }

    setClubhouseErrors(errors);

    if (hasError) {
      return;
    }

    try {
      setIsBookingClubhouse(true);

      // Create new clubhouse reservation request
      await addDoc(collection(db, "clubhouse"), {
        date: clubhouseForm.date,
        startTime: clubhouseForm.startTime,
        endTime: clubhouseForm.endTime,
        purpose: clubhouseForm.purpose.trim(),
        deposit: 100, // Default deposit
        isAvailable: false,
        status: "pending",
        reservedBy: user.uid,
        reservedByEmail: user.email,
        reservedByName:
          user.displayName || user.email?.split("@")[0] || "Guest",
        reservedAt: new Date().toISOString(),
        paymentMethod: clubhousePaymentMethod,
      });

      alert("Reservation request submitted! Please wait for admin approval.");
      setIsClubhouseModalOpen(false);
      setClubhousePaymentMethod("cash");
      setClubhouseForm({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
      });
      setClubhouseErrors({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "",
      });
      await loadClubhouseReservations();
    } catch (error) {
      console.error("Clubhouse booking error:", error);
      alert("Failed to submit reservation request. Please try again.");
    } finally {
      setIsBookingClubhouse(false);
    }
  };

  const isEventPast = (event: EventItem) => {
    // Parse date in local timezone by appending time
    const eventDate = new Date(event.date + "T00:00:00");
    const today = new Date();

    eventDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    // Event is past only if the date is before today (not today itself)
    return eventDate < today;
  };

  const filteredEvents =
    filterCategory === "All"
      ? events.filter((e) => !isEventPast(e))
      : events.filter((e) => {
          const matchesCategory = Array.isArray(e.category)
            ? e.category.includes(filterCategory)
            : e.category === filterCategory;
          return !isEventPast(e) && matchesCategory;
        });

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
                fontWeight="bold"
                color="navy.700"
              >
                H
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
                  fontWeight="bold"
                  color="navy.700"
                >
                  i
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
                        Posted:{" "}
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
            Upcoming Events
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

      {/* CLUBHOUSE RESERVATIONS SECTION */}
      <Container maxW="7xl" py={{ base: 10, md: 16 }} px={{ base: 4, md: 6 }}>
        <Box textAlign="center" mb={{ base: 8, md: 12 }}>
          <Heading
            size={{ base: "xl", md: "2xl" }}
            mb={{ base: 3, md: 4 }}
            color="navy.700"
          >
            Clubhouse Reservations
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="2xl"
            mx="auto"
            px={{ base: 2, md: 0 }}
          >
            Reserve the clubhouse for your private events
          </Text>
          <HStack justify="center" gap={4} mt={4}>
            <Button
              onClick={() => setIsClubhouseModalOpen(true)}
              size="lg"
              bg="navy.600"
              color="white"
              _hover={{ bg: "navy.700" }}
              px={8}
            >
              + Request Reservation
            </Button>
            <HStack
              bg="white"
              rounded="lg"
              p={1}
              shadow="sm"
              borderWidth="1px"
              borderColor="gray.200"
            >
              <Button
                size="md"
                bg={clubhouseViewMode === "list" ? "navy.600" : "transparent"}
                color={clubhouseViewMode === "list" ? "white" : "gray.600"}
                _hover={{
                  bg: clubhouseViewMode === "list" ? "navy.700" : "gray.100",
                }}
                onClick={() => setClubhouseViewMode("list")}
              >
                📋 List
              </Button>
              <Button
                size="md"
                bg={
                  clubhouseViewMode === "calendar" ? "navy.600" : "transparent"
                }
                color={clubhouseViewMode === "calendar" ? "white" : "gray.600"}
                _hover={{
                  bg:
                    clubhouseViewMode === "calendar" ? "navy.700" : "gray.100",
                }}
                onClick={() => setClubhouseViewMode("calendar")}
              >
                📅 Calendar
              </Button>
            </HStack>
          </HStack>
        </Box>

        {/* Calendar View */}
        {clubhouseViewMode === "calendar" && (
          <Box mb={10}>
            <CalendarView
              reservations={clubhouseReservations.filter(
                (r) => r.status === "approved" && !isReservationPast(r)
              )}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              onRequestReservation={() => setIsClubhouseModalOpen(true)}
            />
          </Box>
        )}

        {/* List View */}
        {clubhouseViewMode === "list" && (
          <>
            {/* All Approved Reservations */}
            <Box mb={10}>
              <Heading size="md" color="navy.700" mb={4}>
                Approved Reservations
              </Heading>
              <Text fontSize="sm" color="gray.600" mb={4}>
                See when the clubhouse is booked to avoid scheduling conflicts
              </Text>
              {clubhouseReservations.filter(
                (r) => r.status === "approved" && !isReservationPast(r)
              ).length === 0 ? (
                <Box
                  textAlign="center"
                  py={8}
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" color="gray.600">
                    No approved reservations yet. Be the first to book!
                  </Text>
                </Box>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  gap={{ base: 4, md: 6 }}
                >
                  {clubhouseReservations
                    .filter(
                      (r) => r.status === "approved" && !isReservationPast(r)
                    )
                    .sort(
                      (a, b) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                    )
                    .map((reservation) => (
                      <Box
                        key={reservation.id}
                        bg="white"
                        borderWidth="2px"
                        borderColor="green.200"
                        rounded="xl"
                        shadow="lg"
                        p={{ base: 5, md: 6 }}
                      >
                        <Stack gap={3}>
                          <Flex justify="space-between" align="start">
                            <HStack gap={2}>
                              <Heading size="sm" color="navy.700">
                                Reserved
                              </Heading>
                            </HStack>
                            <Box
                              as="span"
                              px={2}
                              py={0.5}
                              bg="green.100"
                              color="green.700"
                              rounded="full"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              Booked
                            </Box>
                          </Flex>

                          <Stack gap={2} fontSize="sm" color="gray.600">
                            <Text fontWeight="semibold">
                              Date:{" "}
                              {new Date(reservation.date).toLocaleDateString()}
                            </Text>
                            <Text fontWeight="semibold">
                              Time: {reservation.startTime} -{" "}
                              {reservation.endTime}
                            </Text>
                            <Text fontWeight="semibold">
                              Purpose: {reservation.purpose}
                            </Text>
                          </Stack>
                        </Stack>
                      </Box>
                    ))}
                </SimpleGrid>
              )}
            </Box>

            {/* My Reservations */}
            <Box>
              <Heading size="md" color="navy.700" mb={4}>
                My Reservations
              </Heading>
              {clubhouseReservations.filter(
                (r) =>
                  r.reservedBy === user?.uid &&
                  r.status !== "completed" &&
                  !isReservationPast(r)
              ).length === 0 ? (
                <Box
                  textAlign="center"
                  py={8}
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" color="gray.600">
                    You haven't made any reservations yet.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  gap={{ base: 4, md: 6 }}
                >
                  {clubhouseReservations
                    .filter(
                      (r) =>
                        r.reservedBy === user?.uid &&
                        r.status !== "completed" &&
                        !isReservationPast(r)
                    )
                    .map((reservation) => (
                      <Box
                        key={reservation.id}
                        bg="white"
                        borderWidth="2px"
                        borderColor={
                          reservation.status === "approved"
                            ? "green.200"
                            : reservation.status === "completed"
                            ? "gray.200"
                            : reservation.status === "pending"
                            ? "orange.200"
                            : isReservationPast(reservation)
                            ? "gray.200"
                            : "red.200"
                        }
                        rounded="xl"
                        shadow="lg"
                        p={{ base: 5, md: 6 }}
                        transition="all 0.3s"
                      >
                        <Stack gap={4}>
                          {/* Header */}
                          <Flex justify="space-between" align="start" gap={3}>
                            <Box flex="1">
                              <HStack gap={2} mb={2}>
                                <Heading size="md" color="navy.700">
                                  Clubhouse
                                </Heading>
                              </HStack>
                              <HStack gap={2} flexWrap="wrap">
                                <Box
                                  as="span"
                                  px={2}
                                  py={0.5}
                                  bg={
                                    reservation.status === "approved"
                                      ? "green.100"
                                      : reservation.status === "completed"
                                      ? "gray.100"
                                      : reservation.status === "pending"
                                      ? "orange.100"
                                      : isReservationPast(reservation)
                                      ? "gray.100"
                                      : "red.100"
                                  }
                                  color={
                                    reservation.status === "approved"
                                      ? "green.700"
                                      : reservation.status === "completed"
                                      ? "gray.700"
                                      : reservation.status === "pending"
                                      ? "orange.700"
                                      : isReservationPast(reservation)
                                      ? "gray.700"
                                      : "red.700"
                                  }
                                  rounded="full"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  {reservation.status === "approved"
                                    ? "Approved"
                                    : reservation.status === "completed"
                                    ? "Past"
                                    : reservation.status === "pending"
                                    ? "Pending Approval"
                                    : isReservationPast(reservation)
                                    ? "Past"
                                    : "Rejected"}
                                </Box>
                                <Box
                                  as="span"
                                  px={2}
                                  py={0.5}
                                  bg="blue.100"
                                  color="blue.700"
                                  rounded="full"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  ${reservation.deposit || 100} Deposit
                                </Box>
                              </HStack>
                            </Box>
                          </Flex>

                          {/* Details */}
                          <Stack gap={2} fontSize="sm" color="gray.600">
                            <Text fontWeight="semibold">
                              Date:{" "}
                              {new Date(reservation.date).toLocaleDateString()}
                            </Text>
                            <Text fontWeight="semibold">
                              Time: {reservation.startTime} -{" "}
                              {reservation.endTime}
                            </Text>
                            <Text fontWeight="semibold">
                              Purpose: {reservation.purpose}
                            </Text>
                            <Text fontWeight="semibold">
                              Payment: {reservation.paymentMethod || "Cash"}
                            </Text>
                          </Stack>

                          {reservation.reservedAt && (
                            <Text fontSize="xs" color="gray.500">
                              Requested on{" "}
                              {new Date(
                                reservation.reservedAt
                              ).toLocaleDateString()}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    ))}
                </SimpleGrid>
              )}
            </Box>

            {/* Past Reservations */}
            <Box>
              <Heading size="md" color="navy.700" mb={4}>
                Past Reservations
              </Heading>
              {clubhouseReservations.filter(
                (r) =>
                  r.reservedBy === user?.uid &&
                  (r.status === "completed" || isReservationPast(r))
              ).length === 0 ? (
                <Box
                  textAlign="center"
                  py={8}
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="md" color="gray.600">
                    No past reservations.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid
                  columns={{ base: 1, md: 2, lg: 3 }}
                  gap={{ base: 4, md: 6 }}
                >
                  {clubhouseReservations
                    .filter(
                      (r) =>
                        r.reservedBy === user?.uid &&
                        (r.status === "completed" || isReservationPast(r))
                    )
                    .sort(
                      (a, b) =>
                        new Date(b.date).getTime() - new Date(a.date).getTime()
                    )
                    .map((reservation) => (
                      <Box
                        key={reservation.id}
                        bg="white"
                        borderWidth="2px"
                        borderColor="gray.200"
                        rounded="xl"
                        shadow="lg"
                        p={{ base: 5, md: 6 }}
                        transition="all 0.3s"
                        opacity={0.85}
                      >
                        <Stack gap={4}>
                          {/* Header */}
                          <Flex justify="space-between" align="start" gap={3}>
                            <Box flex="1">
                              <HStack gap={2} mb={2}>
                                <Heading size="md" color="gray.700">
                                  Clubhouse
                                </Heading>
                              </HStack>
                              <HStack gap={2} flexWrap="wrap">
                                <Box
                                  as="span"
                                  px={2}
                                  py={0.5}
                                  bg="gray.100"
                                  color="gray.700"
                                  rounded="full"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  Past
                                </Box>
                                <Box
                                  as="span"
                                  px={2}
                                  py={0.5}
                                  bg="blue.100"
                                  color="blue.700"
                                  rounded="full"
                                  fontSize="xs"
                                  fontWeight="bold"
                                >
                                  ${reservation.deposit || 100} Deposit
                                </Box>
                              </HStack>
                            </Box>
                          </Flex>

                          {/* Details */}
                          <Stack gap={2} fontSize="sm" color="gray.600">
                            <Text fontWeight="semibold">
                              Date:{" "}
                              {new Date(reservation.date).toLocaleDateString()}
                            </Text>
                            <Text fontWeight="semibold">
                              Time: {reservation.startTime} -{" "}
                              {reservation.endTime}
                            </Text>
                            <Text fontWeight="semibold">
                              Purpose: {reservation.purpose}
                            </Text>
                            <Text fontWeight="semibold">
                              Payment: {reservation.paymentMethod || "Cash"}
                            </Text>
                          </Stack>

                          {reservation.reservedAt && (
                            <Text fontSize="xs" color="gray.500">
                              Requested on{" "}
                              {new Date(
                                reservation.reservedAt
                              ).toLocaleDateString()}
                            </Text>
                          )}
                        </Stack>
                      </Box>
                    ))}
                </SimpleGrid>
              )}
            </Box>
          </>
        )}

        {/* Clubhouse Booking Modal */}
        <Dialog.Root
          open={isClubhouseModalOpen}
          onOpenChange={(e) => setIsClubhouseModalOpen(e.open)}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner>
            <Dialog.Content maxW="500px">
              <Dialog.Header>
                <Dialog.Title>Request Clubhouse Reservation</Dialog.Title>
                <Dialog.CloseTrigger />
              </Dialog.Header>
              <Dialog.Body>
                <Stack gap={4}>
                  <Box>
                    <Text mb={2} fontWeight="medium">
                      Date *
                    </Text>
                    <Input
                      type="date"
                      value={clubhouseForm.date}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => {
                        setClubhouseForm({
                          ...clubhouseForm,
                          date: e.target.value,
                        });
                        setClubhouseErrors({ ...clubhouseErrors, date: "" });
                      }}
                      borderColor={
                        clubhouseErrors.date ? "red.500" : "gray.200"
                      }
                    />
                    {clubhouseErrors.date && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {clubhouseErrors.date}
                      </Text>
                    )}
                  </Box>

                  <SimpleGrid columns={2} gap={3}>
                    <Box>
                      <Text mb={2} fontWeight="medium">
                        Start Time *
                      </Text>
                      <HStack gap={2}>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={clubhouseForm.startTime.split(":")[0] || ""}
                            onChange={(e) => {
                              const hour = e.target.value;
                              const minute =
                                clubhouseForm.startTime.split(":")[1] || "00";
                              setClubhouseForm({
                                ...clubhouseForm,
                                startTime: `${hour}:${minute}`,
                              });
                              setClubhouseErrors({
                                ...clubhouseErrors,
                                startTime: "",
                              });
                            }}
                            borderColor={
                              clubhouseErrors.startTime ? "red.500" : "gray.200"
                            }
                          >
                            <option value="">Hour</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i).padStart(2, "0")}
                              >
                                {String(i).padStart(2, "0")}
                              </option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                        <Text>:</Text>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={clubhouseForm.startTime.split(":")[1] || ""}
                            onChange={(e) => {
                              const hour =
                                clubhouseForm.startTime.split(":")[0] || "00";
                              const minute = e.target.value;
                              setClubhouseForm({
                                ...clubhouseForm,
                                startTime: `${hour}:${minute}`,
                              });
                              setClubhouseErrors({
                                ...clubhouseErrors,
                                startTime: "",
                              });
                            }}
                            borderColor={
                              clubhouseErrors.startTime ? "red.500" : "gray.200"
                            }
                          >
                            <option value="">Min</option>
                            {["00", "15", "30", "45"].map((min) => (
                              <option key={min} value={min}>
                                {min}
                              </option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </HStack>
                      {clubhouseErrors.startTime && (
                        <Text color="red.500" fontSize="xs" mt={1}>
                          {clubhouseErrors.startTime}
                        </Text>
                      )}
                    </Box>
                    <Box>
                      <Text mb={2} fontWeight="medium">
                        End Time *
                      </Text>
                      <HStack gap={2}>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={clubhouseForm.endTime.split(":")[0] || ""}
                            onChange={(e) => {
                              const hour = e.target.value;
                              const minute =
                                clubhouseForm.endTime.split(":")[1] || "00";
                              setClubhouseForm({
                                ...clubhouseForm,
                                endTime: `${hour}:${minute}`,
                              });
                              setClubhouseErrors({
                                ...clubhouseErrors,
                                endTime: "",
                              });
                            }}
                            borderColor={
                              clubhouseErrors.endTime ? "red.500" : "gray.200"
                            }
                          >
                            <option value="">Hour</option>
                            {Array.from({ length: 24 }, (_, i) => (
                              <option
                                key={i}
                                value={String(i).padStart(2, "0")}
                              >
                                {String(i).padStart(2, "0")}
                              </option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                        <Text>:</Text>
                        <NativeSelectRoot>
                          <NativeSelectField
                            value={clubhouseForm.endTime.split(":")[1] || ""}
                            onChange={(e) => {
                              const hour =
                                clubhouseForm.endTime.split(":")[0] || "00";
                              const minute = e.target.value;
                              setClubhouseForm({
                                ...clubhouseForm,
                                endTime: `${hour}:${minute}`,
                              });
                              setClubhouseErrors({
                                ...clubhouseErrors,
                                endTime: "",
                              });
                            }}
                            borderColor={
                              clubhouseErrors.endTime ? "red.500" : "gray.200"
                            }
                          >
                            <option value="">Min</option>
                            {["00", "15", "30", "45"].map((min) => (
                              <option key={min} value={min}>
                                {min}
                              </option>
                            ))}
                          </NativeSelectField>
                        </NativeSelectRoot>
                      </HStack>
                      {clubhouseErrors.endTime && (
                        <Text color="red.500" fontSize="xs" mt={1}>
                          {clubhouseErrors.endTime}
                        </Text>
                      )}
                    </Box>
                  </SimpleGrid>

                  <Box>
                    <Flex justify="space-between" align="center" mb={2}>
                      <Text fontWeight="medium">Purpose/Event Type *</Text>
                      <Text fontSize="xs" color="gray.500">
                        {clubhouseForm.purpose.length}/100
                      </Text>
                    </Flex>
                    <Input
                      placeholder="e.g., Birthday Party, Family Gathering, Meeting"
                      value={clubhouseForm.purpose}
                      maxLength={100}
                      onChange={(e) => {
                        setClubhouseForm({
                          ...clubhouseForm,
                          purpose: e.target.value,
                        });
                        setClubhouseErrors({
                          ...clubhouseErrors,
                          purpose: "",
                        });
                      }}
                      borderColor={
                        clubhouseErrors.purpose ? "red.500" : "gray.200"
                      }
                    />
                    {clubhouseErrors.purpose && (
                      <Text color="red.500" fontSize="sm" mt={1}>
                        {clubhouseErrors.purpose}
                      </Text>
                    )}
                  </Box>

                  <Box>
                    <Text mb={3} fontWeight="medium">
                      Payment Method for Deposit *
                    </Text>
                    <RadioGroup.Root
                      value={clubhousePaymentMethod}
                      onValueChange={(e) =>
                        setClubhousePaymentMethod(e.value || "cash")
                      }
                    >
                      <Stack gap={3}>
                        <RadioGroup.Item value="cash">
                          <RadioGroup.ItemControl />
                          <HStack gap={2}>
                            <Text fontSize="xl">💵</Text>
                            <RadioGroup.ItemText>Cash</RadioGroup.ItemText>
                          </HStack>
                          <RadioGroup.ItemHiddenInput />
                        </RadioGroup.Item>
                        <RadioGroup.Item value="zelle">
                          <RadioGroup.ItemControl />
                          <HStack gap={2}>
                            <Text fontSize="xl">📱</Text>
                            <RadioGroup.ItemText>Zelle</RadioGroup.ItemText>
                          </HStack>
                          <RadioGroup.ItemHiddenInput />
                        </RadioGroup.Item>
                      </Stack>
                    </RadioGroup.Root>
                  </Box>

                  <Box
                    p={3}
                    bg="blue.50"
                    rounded="md"
                    borderWidth="1px"
                    borderColor="blue.200"
                  >
                    <Text
                      fontSize="sm"
                      fontWeight="medium"
                      color="blue.700"
                      mb={1}
                    >
                      Deposit Required: $100
                    </Text>
                    <Text fontSize="xs" color="gray.700">
                      Refundable deposit. Will be returned after your event if
                      the clubhouse is left in good condition.
                    </Text>
                  </Box>

                  <Box
                    p={3}
                    bg="yellow.50"
                    rounded="md"
                    borderWidth="1px"
                    borderColor="yellow.200"
                  >
                    <Text fontSize="sm" color="gray.700">
                      <strong>Note:</strong> Your reservation request will be
                      sent to the admin for approval. You'll be notified once
                      it's reviewed.
                    </Text>
                  </Box>
                </Stack>
              </Dialog.Body>
              <Dialog.Footer>
                <Stack gap={2} width="full">
                  <Button
                    onClick={handleBookClubhouse}
                    loading={isBookingClubhouse}
                    w="full"
                    size="lg"
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                  >
                    Submit Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsClubhouseModalOpen(false);
                      setClubhouseForm({
                        date: "",
                        startTime: "",
                        endTime: "",
                        purpose: "",
                      });
                      setClubhouseErrors({
                        date: "",
                        startTime: "",
                        endTime: "",
                        purpose: "",
                      });
                    }}
                    w="full"
                  >
                    Cancel
                  </Button>
                </Stack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
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
