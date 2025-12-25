import {
  Box,
  Button,
  Flex,
  Heading,
  HStack,
  SimpleGrid,
  Stack,
  Text,
  VStack,
  Input,
  IconButton,
  Textarea,
  Dialog,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { ProtectedRoute } from "../components/ProtectedRoute";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
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

// Events are now loaded from Firestore

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [residentsCount, setResidentsCount] = useState(0);
  const [residents, setResidents] = useState<any[]>([]);
  const [eventForm, setEventForm] = useState({
    title: "",
    date: "",
    time: "",
    location: "",
    description: "",
    availableTickets: 0,
    price: 0,
    category: "Social",
  });

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  // Load events and residents from Firestore
  useEffect(() => {
    loadEvents();
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"));
      const loadedResidents: any[] = [];
      querySnapshot.forEach((doc) => {
        loadedResidents.push({ id: doc.id, ...doc.data() });
      });
      setResidents(loadedResidents);
      setResidentsCount(loadedResidents.length);
    } catch (error) {
      console.error("Error loading residents:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "events"));
      const loadedEvents: EventItem[] = [];
      querySnapshot.forEach((doc) => {
        loadedEvents.push({ id: doc.id, ...doc.data() } as EventItem);
      });
      setEvents(loadedEvents);
    } catch (error) {
      console.error("Error loading events:", error);
    }
  };

  const handleCreateEvent = async () => {
    // Validate required fields
    if (!eventForm.title.trim()) {
      alert("Please enter an event title");
      return;
    }
    if (!eventForm.date.trim()) {
      alert("Please enter an event date");
      return;
    }
    if (!eventForm.time.trim()) {
      alert("Please enter an event time");
      return;
    }
    if (!eventForm.location.trim()) {
      alert("Please enter an event location");
      return;
    }

    setLoading(true);
    try {
      const newEvent = {
        title: eventForm.title.trim(),
        date: eventForm.date.trim(),
        time: eventForm.time.trim(),
        location: eventForm.location.trim(),
        description: eventForm.description.trim(),
        availableTickets: eventForm.availableTickets,
        price: eventForm.price,
        category: eventForm.category,
        isFree: eventForm.price === 0,
        createdAt: new Date().toISOString(),
      };

      if (editingEvent) {
        // Update existing event
        await updateDoc(doc(db, "events", editingEvent.id), newEvent);
        alert("Event updated successfully!");
      } else {
        // Create new event
        await addDoc(collection(db, "events"), newEvent);
        alert("Event created successfully!");
      }

      // Reload events
      await loadEvents();

      // Reset form and close modal
      setEventForm({
        title: "",
        date: "",
        time: "",
        location: "",
        description: "",
        availableTickets: 0,
        price: 0,
        category: "Social",
      });
      setEditingEvent(null);
      setIsEventModalOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      alert(`Failed to create event: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: EventItem) => {
    setEditingEvent(event);
    setEventForm({
      title: event.title,
      date: event.date,
      time: event.time,
      location: event.location,
      description: event.description,
      availableTickets: event.availableTickets,
      price: event.price,
      category: event.category,
    });
    setIsEventModalOpen(true);
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteDoc(doc(db, "events", eventId));
      await loadEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const openNewEventModal = () => {
    setEditingEvent(null);
    setEventForm({
      title: "",
      date: "",
      time: "",
      location: "",
      description: "",
      availableTickets: 0,
      price: 0,
      category: "Social",
    });
    setIsEventModalOpen(true);
  };

  // Calculate dynamic stats from database
  const totalRevenue = events.reduce((sum, event) => {
    return sum + event.price * (100 - event.availableTickets); // Approximate sold tickets
  }, 0);

  const stats = [
    {
      label: "Total Residents",
      value: residentsCount.toString(),
      icon: "👥",
      change: residentsCount === 0 ? "No residents yet" : "Registered users",
      color: "blue",
    },
    {
      label: "Active Events",
      value: events.length.toString(),
      icon: "🎉",
      change: events.length === 0 ? "No events created" : "Community events",
      color: "purple",
    },
    {
      label: "Pending Reservations",
      value: "0",
      icon: "📅",
      change: "Feature coming soon",
      color: "orange",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: "💰",
      change: totalRevenue === 0 ? "No sales yet" : "Event ticket sales",
      color: "green",
    },
  ];

  const menuItems = [
    { id: "overview", icon: "📊", label: "Overview" },
    { id: "events", icon: "🎉", label: "Events" },
    { id: "residents", icon: "👥", label: "Residents" },
    { id: "reservations", icon: "📅", label: "Reservations" },
    { id: "announcements", icon: "📢", label: "Announcements" },
    { id: "settings", icon: "⚙️", label: "Settings" },
  ];

  // Sidebar Component
  const Sidebar = ({ isMobile = false }) => (
    <Box
      w={{ base: "full", md: "260px" }}
      bg="navy.800"
      minH={{ base: "auto", md: "100vh" }}
      color="white"
      position={{ base: "relative", md: "fixed" }}
      left="0"
      top="0"
      overflowY="auto"
    >
      <Box p={6} borderBottomWidth="1px" borderBottomColor="whiteAlpha.200">
        <Heading size="md" color="white">
          🏠 HOA Admin
        </Heading>
        <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
          Management Portal
        </Text>
      </Box>

      <VStack gap={1} p={4} align="stretch">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              if (isMobile) setIsSidebarOpen(false);
            }}
            variant="ghost"
            color={activeTab === item.id ? "white" : "whiteAlpha.700"}
            bg={activeTab === item.id ? "navy.600" : "transparent"}
            justifyContent="flex-start"
            px={4}
            py={6}
            fontWeight={activeTab === item.id ? "bold" : "normal"}
            _hover={{
              bg: activeTab === item.id ? "navy.600" : "whiteAlpha.100",
              color: "white",
            }}
          >
            <HStack gap={3}>
              <Text fontSize="xl">{item.icon}</Text>
              <Text>{item.label}</Text>
            </HStack>
          </Button>
        ))}
      </VStack>

      <Box p={4} mt="auto" borderTopWidth="1px" borderTopColor="whiteAlpha.200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          color="red.300"
          width="full"
          justifyContent="flex-start"
          _hover={{ bg: "red.900", color: "white" }}
        >
          <HStack gap={3}>
            <Text fontSize="xl">🚪</Text>
            <Text>Logout</Text>
          </HStack>
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box bg="gray.50" minH="100vh">
      {/* Mobile Sidebar Drawer */}
      {isSidebarOpen && (
        <Box
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg="blackAlpha.600"
          zIndex="999"
          display={{ base: "block", md: "none" }}
          onClick={() => setIsSidebarOpen(false)}
        >
          <Box
            w="260px"
            h="100vh"
            bg="navy.800"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar isMobile={true} />
          </Box>
        </Box>
      )}

      {/* Desktop Sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <Sidebar />
      </Box>

      {/* Main Content Area */}
      <Box ml={{ base: 0, md: "260px" }} minH="100vh">
        {/* Top Navbar */}
        <Box
          bg="white"
          borderBottomWidth="1px"
          borderBottomColor="gray.200"
          px={{ base: 4, md: 6 }}
          py={4}
          position="sticky"
          top="0"
          zIndex="10"
          shadow="sm"
        >
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <IconButton
                display={{ base: "flex", md: "none" }}
                aria-label="Menu"
                onClick={() => setIsSidebarOpen(true)}
                variant="ghost"
                fontSize="24px"
              >
                ☰
              </IconButton>
              <Box>
                <Heading size={{ base: "sm", md: "md" }} color="navy.700">
                  {menuItems.find((item) => item.id === activeTab)?.label ||
                    "Dashboard"}
                </Heading>
                <Text
                  fontSize="xs"
                  color="gray.500"
                  display={{ base: "none", sm: "block" }}
                >
                  Welcome back, {user?.email}
                </Text>
              </Box>
            </HStack>

            <HStack gap={{ base: 2, md: 4 }}>
              <Button
                size={{ base: "sm", md: "md" }}
                onClick={() => (window.location.href = "/")}
                variant="ghost"
                color="navy.600"
                display={{ base: "none", sm: "flex" }}
              >
                View Site
              </Button>
              <Button
                size={{ base: "sm", md: "md" }}
                bg="navy.600"
                color="white"
                _hover={{ bg: "navy.700" }}
                onClick={openNewEventModal}
              >
                + New Event
              </Button>
            </HStack>
          </Flex>
        </Box>

        {/* Content */}
        <Box p={{ base: 4, md: 6 }}>
          {activeTab === "overview" && (
            <Stack gap={6}>
              {/* Stats Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                {stats.map((stat) => (
                  <Box
                    key={stat.label}
                    bg="white"
                    p={5}
                    rounded="xl"
                    shadow="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                    transition="all 0.2s"
                    _hover={{
                      shadow: "lg",
                      transform: "translateY(-2px)",
                    }}
                  >
                    <HStack justify="space-between" mb={2}>
                      <Text fontSize="2xl">{stat.icon}</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="navy.700">
                        {stat.value}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      color="gray.700"
                      mb={1}
                    >
                      {stat.label}
                    </Text>
                    <Text fontSize="xs" color="gray.500">
                      {stat.change}
                    </Text>
                  </Box>
                ))}
              </SimpleGrid>

              {/* Quick Actions */}
              <Box
                bg="white"
                rounded="xl"
                shadow="md"
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Heading size="md" color="navy.700" mb={4}>
                  ⚡ Quick Actions
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2, md: 4 }} gap={3}>
                  <Button
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                    size="md"
                  >
                    <HStack gap={2}>
                      <Text fontSize="lg">📢</Text>
                      <Text fontSize="sm">New Announcement</Text>
                    </HStack>
                  </Button>
                  <Button
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                    size="md"
                    onClick={() => setActiveTab("events")}
                  >
                    <HStack gap={2}>
                      <Text fontSize="lg">🎉</Text>
                      <Text fontSize="sm">Manage Events</Text>
                    </HStack>
                  </Button>
                  <Button
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                    size="md"
                    onClick={() => setActiveTab("reservations")}
                  >
                    <HStack gap={2}>
                      <Text fontSize="lg">📅</Text>
                      <Text fontSize="sm">Reservations</Text>
                    </HStack>
                  </Button>
                  <Button
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                    size="md"
                    onClick={() => setActiveTab("residents")}
                  >
                    <HStack gap={2}>
                      <Text fontSize="lg">👥</Text>
                      <Text fontSize="sm">View Residents</Text>
                    </HStack>
                  </Button>
                </SimpleGrid>
              </Box>
            </Stack>
          )}

          {activeTab === "events" && (
            <Stack gap={6}>
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Heading size="lg" color="navy.700">
                  All Community Events
                </Heading>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={openNewEventModal}
                >
                  + Add New Event
                </Button>
              </Flex>

              <SimpleGrid columns={{ base: 1, lg: 2, xl: 3 }} gap={6}>
                {events.map((event) => (
                  <Box
                    key={event.id}
                    bg="white"
                    borderWidth="2px"
                    borderColor="navy.200"
                    rounded="xl"
                    shadow="md"
                    p={5}
                    transition="all 0.2s"
                    _hover={{
                      shadow: "lg",
                      borderColor: "navy.400",
                    }}
                  >
                    <Stack gap={3}>
                      <Flex justify="space-between" align="start">
                        <Heading size="sm" color="navy.700">
                          {event.title}
                        </Heading>
                        <HStack gap={2}>
                          <Box
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
                        </HStack>
                      </Flex>

                      <Stack gap={1} fontSize="sm" color="gray.600">
                        <HStack gap={2}>
                          <Text fontWeight="semibold">📅</Text>
                          <Text fontSize="xs">{event.date}</Text>
                        </HStack>
                        <HStack gap={2}>
                          <Text fontWeight="semibold">🕐</Text>
                          <Text fontSize="xs">{event.time}</Text>
                        </HStack>
                        <HStack gap={2}>
                          <Text fontWeight="semibold">📍</Text>
                          <Text fontSize="xs">{event.location}</Text>
                        </HStack>
                      </Stack>

                      <Text color="gray.700" fontSize="sm" lineHeight="1.5">
                        {event.description}
                      </Text>

                      <Flex
                        align="center"
                        justify="space-between"
                        p={3}
                        bg="gray.50"
                        rounded="lg"
                        fontSize="sm"
                      >
                        <Text fontWeight="medium" color="gray.700">
                          Available
                        </Text>
                        <Text
                          fontWeight="bold"
                          color={
                            event.availableTickets < 10
                              ? "red.600"
                              : "green.600"
                          }
                        >
                          {event.availableTickets} tickets
                        </Text>
                      </Flex>

                      <HStack gap={2}>
                        <Button
                          size="sm"
                          variant="outline"
                          borderColor="navy.600"
                          color="navy.600"
                          flex="1"
                          _hover={{ bg: "navy.50" }}
                          onClick={() => handleEditEvent(event)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          bg="red.500"
                          color="white"
                          flex="1"
                          _hover={{ bg: "red.600" }}
                          onClick={() => handleDeleteEvent(event.id)}
                        >
                          Delete
                        </Button>
                      </HStack>
                    </Stack>
                  </Box>
                ))}
              </SimpleGrid>
            </Stack>
          )}

          {activeTab === "residents" && (
            <Stack gap={6}>
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Heading size="lg" color="navy.700">
                  Resident Management ({residents.length})
                </Heading>
              </Flex>

              {residents.length === 0 ? (
                <Box
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  p={8}
                  borderWidth="1px"
                  borderColor="gray.200"
                  textAlign="center"
                >
                  <Text color="gray.600" fontSize="lg" mb={2}>
                    No residents registered yet
                  </Text>
                  <Text color="gray.500" fontSize="sm">
                    Residents will appear here when they sign up through the
                    portal.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {residents.map((resident) => (
                    <Box
                      key={resident.id}
                      bg="white"
                      borderWidth="2px"
                      borderColor="navy.200"
                      rounded="xl"
                      shadow="md"
                      p={6}
                      transition="all 0.2s"
                      _hover={{
                        shadow: "lg",
                        borderColor: "navy.400",
                      }}
                    >
                      <Stack gap={3}>
                        <Flex align="center" gap={3}>
                          <Box
                            w="50px"
                            h="50px"
                            bg="navy.100"
                            rounded="full"
                            display="flex"
                            alignItems="center"
                            justifyContent="center"
                            fontSize="2xl"
                          >
                            👤
                          </Box>
                          <Box flex="1">
                            <Heading size="sm" color="navy.700">
                              {resident.name || "N/A"}
                            </Heading>
                            <Text fontSize="xs" color="gray.500">
                              {resident.role || "Resident"}
                            </Text>
                          </Box>
                        </Flex>

                        <Stack gap={2} fontSize="sm">
                          <HStack gap={2}>
                            <Text fontWeight="semibold" color="gray.700">
                              📧
                            </Text>
                            <Text color="gray.600" fontSize="xs">
                              {resident.email || "N/A"}
                            </Text>
                          </HStack>
                          <HStack gap={2}>
                            <Text fontWeight="semibold" color="gray.700">
                              🏠
                            </Text>
                            <Text color="gray.600" fontSize="xs">
                              {resident.address || "No address"}
                            </Text>
                          </HStack>
                          <HStack gap={2}>
                            <Text fontWeight="semibold" color="gray.700">
                              📅
                            </Text>
                            <Text color="gray.600" fontSize="xs">
                              Joined:{" "}
                              {resident.createdAt
                                ? new Date(
                                    resident.createdAt
                                  ).toLocaleDateString()
                                : "N/A"}
                            </Text>
                          </HStack>
                        </Stack>

                        {/* <Button
                          size="sm"
                          variant="outline"
                          borderColor="navy.600"
                          color="navy.600"
                          _hover={{ bg: "navy.50" }}
                        >
                          View Details
                        </Button> */}
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          )}

          {activeTab === "reservations" && (
            <Stack gap={6}>
              <Heading size="lg" color="navy.700">
                Facility Reservations
              </Heading>
              <Box
                bg="white"
                rounded="xl"
                shadow="md"
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text color="gray.600">
                  Reservation management system coming soon. Track clubhouse,
                  pool, and amenity bookings.
                </Text>
              </Box>
            </Stack>
          )}

          {activeTab === "announcements" && (
            <Stack gap={6}>
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <Heading size="lg" color="navy.700">
                  Announcements
                </Heading>
                <Button bg="navy.600" color="white" _hover={{ bg: "navy.700" }}>
                  + New Announcement
                </Button>
              </Flex>
              <Box
                bg="white"
                rounded="xl"
                shadow="md"
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text color="gray.600">
                  Create and manage community announcements, newsletters, and
                  important notices.
                </Text>
              </Box>
            </Stack>
          )}

          {activeTab === "settings" && (
            <Stack gap={6}>
              <Heading size="lg" color="navy.700">
                Settings
              </Heading>
              <Box
                bg="white"
                rounded="xl"
                shadow="md"
                p={6}
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Text color="gray.600">
                  Configure system settings, permissions, and preferences.
                </Text>
              </Box>
            </Stack>
          )}
        </Box>
      </Box>

      {/* Event Creation/Edit Modal */}
      <Dialog.Root
        open={isEventModalOpen}
        onOpenChange={(e) => setIsEventModalOpen(e.open)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingEvent ? "Edit Event" : "Create New Event"}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Event Title *
                  </Text>
                  <Input
                    value={eventForm.title}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, title: e.target.value })
                    }
                    placeholder="e.g., Community Game Night"
                  />
                </Stack>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  <Stack gap={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Date *
                    </Text>
                    <Input
                      value={eventForm.date}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, date: e.target.value })
                      }
                      placeholder="e.g., Saturday, January 10, 2025"
                    />
                  </Stack>

                  <Stack gap={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Time *
                    </Text>
                    <Input
                      value={eventForm.time}
                      onChange={(e) =>
                        setEventForm({ ...eventForm, time: e.target.value })
                      }
                      placeholder="e.g., 6:00 PM - 9:00 PM"
                    />
                  </Stack>
                </SimpleGrid>

                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Location *
                  </Text>
                  <Input
                    value={eventForm.location}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, location: e.target.value })
                    }
                    placeholder="e.g., Clubhouse"
                  />
                </Stack>

                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Category
                  </Text>
                  <select
                    value={eventForm.category}
                    onChange={(e) =>
                      setEventForm({ ...eventForm, category: e.target.value })
                    }
                    style={{
                      padding: "8px",
                      borderWidth: "1px",
                      borderColor: "#E2E8F0",
                      borderRadius: "6px",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="Social">Social</option>
                    <option value="Dining">Dining</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Entertainment">Entertainment</option>
                    <option value="Kids">Kids</option>
                    <option value="Service">Service</option>
                  </select>
                </Stack>

                <Stack gap={1}>
                  <Text fontSize="sm" fontWeight="semibold">
                    Description
                  </Text>
                  <Textarea
                    value={eventForm.description}
                    onChange={(e) =>
                      setEventForm({
                        ...eventForm,
                        description: e.target.value,
                      })
                    }
                    placeholder="Describe the event..."
                    rows={4}
                  />
                </Stack>

                <SimpleGrid columns={{ base: 1, sm: 2 }} gap={4}>
                  <Stack gap={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Available Tickets
                    </Text>
                    <Input
                      type="number"
                      value={eventForm.availableTickets}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          availableTickets: parseInt(e.target.value) || 0,
                        })
                      }
                      min="0"
                    />
                  </Stack>

                  <Stack gap={1}>
                    <Text fontSize="sm" fontWeight="semibold">
                      Price ($)
                    </Text>
                    <Input
                      type="number"
                      value={eventForm.price}
                      onChange={(e) =>
                        setEventForm({
                          ...eventForm,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      min="0"
                      step="0.01"
                    />
                  </Stack>
                </SimpleGrid>

                <Text fontSize="xs" color="gray.500">
                  * Required fields
                </Text>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEventModalOpen(false);
                    setEditingEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={handleCreateEvent}
                  loading={loading}
                >
                  {editingEvent ? "Update Event" : "Create Event"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
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
