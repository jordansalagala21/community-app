// src/pages/Home.tsx
import {
  Badge,
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
import {
  Home as HomeIcon,
  Lock,
  Info,
  Bell,
  Calendar,
  Clock,
  Star,
  Menu,
  Ticket,
} from "lucide-react";

type Announcement = {
  id: string;
  title: string;
  body: string;
  date: string; // e.g. "Dec 22, 2025"
  tag?: string;
};

type EventItem = {
  id: string;
  title: string;
  date: string; // e.g. "Sat, Jan 10 • 6:00 PM"
  location: string;
  isFree?: boolean;
};

const announcements: Announcement[] = [
  {
    id: "a1",
    title: "Clubhouse Maintenance",
    body: "The clubhouse kitchen will be unavailable this Friday from 10AM–2PM.",
    date: "Dec 22, 2025",
    tag: "Update",
  },
  {
    id: "a2",
    title: "Parking Reminder",
    body: "Please avoid blocking fire lanes. Towing enforcement is active during night hours.",
    date: "Dec 18, 2025",
    tag: "Notice",
  },
];

const upcomingEvents: EventItem[] = [
  {
    id: "e1",
    title: "Community Game Night",
    date: "Sat, Jan 10 • 6:00 PM",
    location: "Clubhouse",
    isFree: true,
  },
  {
    id: "e2",
    title: "New Year Potluck",
    date: "Sun, Jan 18 • 4:00 PM",
    location: "Main Hall",
    isFree: false,
  },
];

const FeatureCard = ({
  icon: Icon,
  title,
  description,
  ctaLabel,
  to,
  variant = "outline",
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  ctaLabel: string;
  to: string;
  variant?: "solid" | "outline";
}) => {
  return (
    <Box
      bg="white"
      borderWidth="2px"
      borderColor="navy.500"
      shadow="lg"
      rounded="xl"
      h="100%"
      p={{ base: 5, md: 8 }}
      transition="all 0.3s"
      _hover={{
        transform: "translateY(-4px)",
        shadow: "xl",
        borderColor: "navy.600",
      }}
    >
      <Flex
        w={{ base: "48px", md: "56px" }}
        h={{ base: "48px", md: "56px" }}
        rounded="full"
        align="center"
        justify="center"
        bg={variant === "solid" ? "navy.500" : "navy.50"}
        color={variant === "solid" ? "white" : "navy.500"}
        mb={{ base: 3, md: 4 }}
      >
        <Icon size={24} />
      </Flex>
      <Heading
        size={{ base: "sm", md: "md" }}
        mb={{ base: 2, md: 3 }}
        color="navy.700"
      >
        {title}
      </Heading>
      <Text
        color="gray.600"
        mb={{ base: 4, md: 6 }}
        lineHeight="1.7"
        fontSize={{ base: "sm", md: "md" }}
      >
        {description}
      </Text>
      <Button
        onClick={() => (window.location.href = to)}
        bg={variant === "solid" ? "navy.500" : "white"}
        color={variant === "solid" ? "white" : "navy.500"}
        borderWidth={variant === "outline" ? "2px" : "0"}
        borderColor="navy.500"
        width="full"
        size={{ base: "md", md: "lg" }}
        _hover={{
          bg: variant === "solid" ? "navy.600" : "navy.50",
        }}
      >
        {ctaLabel} →
      </Button>
    </Box>
  );
};

export default function Home() {
  return (
    <Box bg="gray.50" minH="100vh">
      {/* NAVIGATION HEADER */}
      <Box bg="navy.700" py={4} shadow="md">
        <Container maxW="7xl" px={{ base: 4, md: 6 }}>
          <Flex justify="space-between" align="center">
            <HStack gap={3}>
              <Flex
                w={{ base: "40px", md: "48px" }}
                h={{ base: "40px", md: "48px" }}
                rounded="lg"
                bg="white"
                alignItems="center"
                justifyContent="center"
                color="navy.600"
              >
                <HomeIcon size={24} />
              </Flex>
              <Heading size={{ base: "sm", md: "md" }} color="white">
                Community Portal
              </Heading>
            </HStack>

            {/* Desktop Navigation */}
            <HStack gap={3} display={{ base: "none", md: "flex" }}>
              <Button
                variant="ghost"
                color="white"
                size="md"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => (window.location.href = "/events")}
              >
                Events
              </Button>
              <Button
                variant="ghost"
                color="white"
                size="md"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => (window.location.href = "/info")}
              >
                Resources
              </Button>
            </HStack>

            {/* Mobile menu button */}
            <Button
              display={{ base: "flex", md: "none" }}
              variant="ghost"
              color="white"
              size="sm"
              _hover={{ bg: "whiteAlpha.200" }}
            >
              <Menu size={20} />
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* HERO SECTION */}
      <Box
        bg="navy.600"
        color="white"
        pt={{ base: 16, md: 20 }}
        pb={{ base: 20, md: 24 }}
      >
        <Container maxW="7xl">
          <VStack gap={{ base: 12, lg: 16 }}>
            <Box textAlign="center" maxW="4xl" mx="auto">
              <Badge
                mb={6}
                px={5}
                py={2}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="full"
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="wide"
                color="white"
              >
                HOA + CLUBHOUSE PORTAL
              </Badge>
              <Heading
                size={{ base: "2xl", sm: "3xl", md: "4xl" }}
                lineHeight="1.1"
                mb={{ base: 6, md: 8 }}
                fontWeight="800"
              >
                Welcome to your community hub
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="whiteAlpha.900"
                mb={10}
                lineHeight="1.8"
                maxW="3xl"
                mx="auto"
              >
                Reserve the clubhouse, stay updated with announcements, and
                register for community events—fast, mobile-friendly, and
                organized.
              </Text>

              {/* Login Options Grid */}
              <SimpleGrid
                columns={{ base: 1, md: 2 }}
                gap={6}
                maxW="3xl"
                mx="auto"
                mb={10}
              >
                {/* Resident Portal */}
                <Box
                  bg="white"
                  color="navy.700"
                  p={8}
                  rounded="2xl"
                  shadow="xl"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    shadow: "2xl",
                  }}
                >
                  <VStack gap={4} align="stretch">
                    <Flex
                      w="64px"
                      h="64px"
                      bg="blue.500"
                      rounded="full"
                      align="center"
                      justify="center"
                      mx="auto"
                      color="white"
                    >
                      <Lock size={32} />
                    </Flex>
                    <Heading size="md" textAlign="center">
                      Resident Portal
                    </Heading>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Reserve the clubhouse, register for events, and manage
                      your account
                    </Text>
                    <Box h="1px" bg="gray.200" my={2} />
                    <VStack gap={2}>
                      <Button
                        onClick={() =>
                          (window.location.href = "/resident/login")
                        }
                        width="full"
                        size="lg"
                        bg="blue.500"
                        color="white"
                        fontWeight="bold"
                        _hover={{
                          bg: "blue.600",
                        }}
                      >
                        Resident Sign In
                      </Button>
                      <Button
                        onClick={() =>
                          (window.location.href = "/resident/signup")
                        }
                        width="full"
                        size="md"
                        variant="ghost"
                        color="blue.600"
                        fontWeight="semibold"
                      >
                        Create Account
                      </Button>
                    </VStack>
                  </VStack>
                </Box>

                {/* Admin Portal */}
                <Box
                  bg="white"
                  color="navy.700"
                  p={8}
                  rounded="2xl"
                  shadow="xl"
                  transition="all 0.3s"
                  _hover={{
                    transform: "translateY(-4px)",
                    shadow: "2xl",
                  }}
                >
                  <VStack gap={4} align="stretch">
                    <Flex
                      w="64px"
                      h="64px"
                      bg="purple.500"
                      rounded="full"
                      align="center"
                      justify="center"
                      mx="auto"
                      color="white"
                    >
                      <Star size={32} />
                    </Flex>
                    <Heading size="md" textAlign="center">
                      Admin Portal
                    </Heading>
                    <Text fontSize="sm" color="gray.600" textAlign="center">
                      Create events, manage registrations, and check in
                      attendees
                    </Text>
                    <Box h="1px" bg="gray.200" my={2} />
                    <Button
                      onClick={() => (window.location.href = "/admin/login")}
                      width="full"
                      size="lg"
                      bg="purple.500"
                      color="white"
                      fontWeight="bold"
                      _hover={{
                        bg: "purple.600",
                      }}
                    >
                      Admin Sign In
                    </Button>
                  </VStack>
                </Box>
              </SimpleGrid>

              <HStack
                justify="center"
                gap={{ base: 4, sm: 8 }}
                color="whiteAlpha.900"
                fontSize={{ base: "sm", md: "md" }}
                flexWrap="wrap"
              >
                <HStack gap={2}>
                  <Calendar size={18} />
                  <Text fontWeight="medium">Room calendar</Text>
                </HStack>
                <HStack gap={2}>
                  <Clock size={18} />
                  <Text fontWeight="medium">Event management</Text>
                </HStack>
                <HStack gap={2}>
                  <Bell size={18} />
                  <Text fontWeight="medium">Announcements</Text>
                </HStack>
              </HStack>
            </Box>

            {/* Contact Card */}
            <Box
              w={{ base: "full", lg: "400px" }}
              rounded="2xl"
              bg="white"
              color="navy.700"
              shadow="2xl"
              p={{ base: 6, md: 8 }}
              borderWidth="1px"
              borderColor="whiteAlpha.300"
            >
              <HStack gap={4} mb={6}>
                <Flex
                  w="56px"
                  h="56px"
                  rounded="full"
                  bg="navy.500"
                  color="white"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Info size={28} />
                </Flex>
                <Box>
                  <Heading size="md" color="navy.700">
                    Need help?
                  </Heading>
                  <Text fontSize="sm" color="gray.600">
                    Contact the clubhouse office
                  </Text>
                </Box>
              </HStack>

              <Box h="1px" bg="gray.200" my={6} />

              <Stack gap={5}>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={1}
                    textTransform="uppercase"
                    fontWeight="semibold"
                  >
                    Email
                  </Text>
                  <Text fontWeight="semibold" color="navy.600">
                    office@yourcommunity.com
                  </Text>
                </Box>
                <Box>
                  <Text
                    fontSize="xs"
                    color="gray.500"
                    mb={1}
                    textTransform="uppercase"
                    fontWeight="semibold"
                  >
                    Hours
                  </Text>
                  <Text fontWeight="semibold" color="navy.600">
                    Mon–Fri • 9:00 AM – 5:00 PM
                  </Text>
                </Box>
                <Button
                  onClick={() => (window.location.href = "/info")}
                  bg="navy.50"
                  color="navy.600"
                  borderWidth="2px"
                  borderColor="navy.500"
                  size="lg"
                  mt={2}
                  _hover={{
                    bg: "navy.100",
                  }}
                >
                  <HStack gap={2}>
                    <Info size={18} />
                    <Text>Community Info</Text>
                  </HStack>
                </Button>
              </Stack>
            </Box>
          </VStack>
        </Container>
      </Box>

      {/* QUICK ACTIONS */}
      <Container maxW="7xl" py={{ base: 10, md: 20 }} px={{ base: 4, md: 6 }}>
        <Box textAlign="center" mb={{ base: 8, md: 12 }}>
          <Heading
            size={{ base: "xl", md: "2xl" }}
            mb={{ base: 3, md: 4 }}
            color="navy.700"
          >
            Quick actions
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="2xl"
            mx="auto"
            px={{ base: 2, md: 0 }}
          >
            Everything you need to stay connected with your community
          </Text>
        </Box>

        <SimpleGrid
          columns={{ base: 1, md: 2, lg: 3 }}
          gap={{ base: 4, md: 6, lg: 8 }}
        >
          <FeatureCard
            icon={Calendar}
            title="Reserve the clubhouse"
            description="Residents can view availability and request a private reservation."
            ctaLabel="View availability"
            to="/reservations"
            variant="solid"
          />
          <FeatureCard
            icon={Ticket}
            title="Register for events"
            description="No account needed to book tickets for upcoming community events."
            ctaLabel="View events"
            to="/resident-portal"
          />
          <FeatureCard
            icon={Info}
            title="Community resources"
            description="Rules, documents, contacts, and important information for residents."
            ctaLabel="Open resources"
            to="/info"
          />
        </SimpleGrid>

        {/* CONTENT GRID */}
        <Box mt={{ base: 10, md: 20 }}>
          <Box textAlign="center" mb={{ base: 8, md: 12 }}>
            <Heading
              size={{ base: "xl", md: "2xl" }}
              mb={{ base: 3, md: 4 }}
              color="navy.700"
            >
              Stay informed
            </Heading>
            <Text
              fontSize={{ base: "md", md: "lg" }}
              color="gray.600"
              maxW="2xl"
              mx="auto"
              px={{ base: 2, md: 0 }}
            >
              Latest updates and upcoming events in your community
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, lg: 2 }} gap={{ base: 4, md: 8 }}>
            {/* Announcements */}
            <Box
              rounded="2xl"
              borderWidth="2px"
              borderColor="navy.200"
              shadow="lg"
              bg="white"
              p={{ base: 5, md: 8 }}
            >
              <Flex
                justify="space-between"
                align="center"
                mb={{ base: 4, md: 6 }}
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 2, sm: 0 }}
              >
                <HStack gap={2}>
                  <Flex
                    w="40px"
                    h="40px"
                    rounded="full"
                    bg="navy.50"
                    color="navy.500"
                    align="center"
                    justify="center"
                  >
                    <Bell size={20} />
                  </Flex>
                  <Heading size={{ base: "md", md: "lg" }} color="navy.700">
                    Announcements
                  </Heading>
                </HStack>
                <Button
                  onClick={() => (window.location.href = "/announcements")}
                  size="sm"
                  variant="ghost"
                  color="navy.500"
                  fontWeight="semibold"
                  _hover={{
                    bg: "navy.50",
                  }}
                >
                  View all →
                </Button>
              </Flex>

              <Stack gap={{ base: 4, md: 6 }}>
                {announcements.map((a) => (
                  <Box
                    key={a.id}
                    p={{ base: 4, md: 5 }}
                    bg="gray.50"
                    rounded="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Stack gap={2} mb={2}>
                      <Flex
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                        direction={{ base: "column", sm: "row" }}
                        gap={{ base: 1, sm: 2 }}
                      >
                        <HStack gap={2} flexWrap="wrap">
                          <Heading
                            size={{ base: "xs", sm: "sm" }}
                            color="navy.700"
                          >
                            {a.title}
                          </Heading>
                          {a.tag ? (
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
                              {a.tag}
                            </Box>
                          ) : null}
                        </HStack>
                        <Text
                          color="gray.500"
                          fontSize="xs"
                          whiteSpace="nowrap"
                          fontWeight="medium"
                        >
                          {a.date}
                        </Text>
                      </Flex>
                    </Stack>
                    <Text
                      color="gray.600"
                      fontSize={{ base: "xs", sm: "sm" }}
                      lineHeight="1.6"
                    >
                      {a.body}
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Upcoming Events */}
            <Box
              rounded="2xl"
              borderWidth="2px"
              borderColor="navy.200"
              shadow="lg"
              bg="white"
              p={{ base: 5, md: 8 }}
            >
              <Flex
                justify="space-between"
                align="center"
                mb={{ base: 4, md: 6 }}
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 2, sm: 0 }}
              >
                <HStack gap={2}>
                  <Flex
                    w="40px"
                    h="40px"
                    rounded="full"
                    bg="navy.50"
                    color="navy.500"
                    align="center"
                    justify="center"
                  >
                    <Calendar size={20} />
                  </Flex>
                  <Heading size={{ base: "md", md: "lg" }} color="navy.700">
                    Upcoming events
                  </Heading>
                </HStack>
                <Button
                  onClick={() => (window.location.href = "/events")}
                  size="sm"
                  variant="ghost"
                  color="navy.500"
                  fontWeight="semibold"
                  _hover={{
                    bg: "navy.50",
                  }}
                >
                  See all →
                </Button>
              </Flex>

              <Stack gap={{ base: 4, md: 6 }}>
                {upcomingEvents.map((e) => (
                  <Box
                    key={e.id}
                    p={{ base: 4, md: 5 }}
                    bg="gray.50"
                    rounded="xl"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Stack gap={3}>
                      <Flex
                        justify="space-between"
                        align={{ base: "start", sm: "center" }}
                        direction={{ base: "column", sm: "row" }}
                        gap={{ base: 3, sm: 4 }}
                      >
                        <Box flex="1">
                          <HStack mb={2} gap={2} flexWrap="wrap">
                            <Heading
                              size={{ base: "xs", sm: "sm" }}
                              color="navy.700"
                            >
                              {e.title}
                            </Heading>
                            <Box
                              as="span"
                              px={2}
                              py={0.5}
                              bg={e.isFree ? "green.100" : "blue.100"}
                              color={e.isFree ? "green.700" : "blue.700"}
                              rounded="full"
                              fontSize="xs"
                              fontWeight="bold"
                            >
                              {e.isFree ? "Free" : "Tickets"}
                            </Box>
                          </HStack>
                          <Text
                            color="gray.600"
                            fontSize={{ base: "xs", sm: "sm" }}
                            fontWeight="medium"
                          >
                            {e.date} • {e.location}
                          </Text>
                        </Box>
                        <Button
                          onClick={() =>
                            (window.location.href = `/events/${e.id}`)
                          }
                          size="sm"
                          bg="navy.500"
                          color="white"
                          width={{ base: "full", sm: "auto" }}
                          _hover={{
                            bg: "navy.600",
                          }}
                          whiteSpace="nowrap"
                        >
                          Details →
                        </Button>
                      </Flex>
                    </Stack>
                  </Box>
                ))}
              </Stack>
            </Box>
          </SimpleGrid>
        </Box>

        {/* FOOTER CTA - Removed as login options are now in hero */}
      </Container>
    </Box>
  );
}
