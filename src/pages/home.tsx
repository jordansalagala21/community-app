// src/pages/Home.tsx
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
} from "@chakra-ui/react";

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
  icon,
  title,
  description,
  ctaLabel,
  to,
  variant = "outline",
}: {
  icon: string;
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
        fontSize={{ base: "xl", md: "2xl" }}
        mb={{ base: 3, md: 4 }}
      >
        {icon}
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
                Community Portal
              </Heading>
            </HStack>

            {/* Desktop Navigation */}
            <HStack gap={3} display={{ base: "none", md: "flex" }}>
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
                variant="ghost"
                color="white"
                size="sm"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={() => (window.location.href = "/info")}
              >
                Resources
              </Button>
              <Button
                bg="white"
                color="navy.600"
                size="sm"
                fontWeight="bold"
                _hover={{ bg: "whiteAlpha.900" }}
                onClick={() => (window.location.href = "/resident/login")}
              >
                🔐 Sign in to Portal
              </Button>
            </HStack>

            {/* Mobile Navigation */}
            <Button
              display={{ base: "flex", md: "none" }}
              bg="white"
              color="navy.600"
              size="sm"
              fontWeight="bold"
              _hover={{ bg: "whiteAlpha.900" }}
              onClick={() => (window.location.href = "/resident/login")}
            >
              🔐 Sign in
            </Button>
          </Flex>
        </Container>
      </Box>

      {/* HERO SECTION */}
      <Box
        bg="navy.600"
        color="white"
        pt={{ base: 12, md: 16 }}
        pb={{ base: 20, md: 24 }}
      >
        <Container maxW="7xl">
          <Stack
            direction={{ base: "column", lg: "row" }}
            gap={{ base: 12, lg: 16 }}
            align="center"
          >
            <Box flex="1" maxW={{ lg: "600px" }}>
              <Box
                w="fit-content"
                mb={5}
                px={4}
                py={2}
                bg="whiteAlpha.200"
                backdropFilter="blur(10px)"
                rounded="full"
                fontSize="sm"
                fontWeight="semibold"
                letterSpacing="wide"
              >
                HOA + CLUBHOUSE PORTAL
              </Box>
              <Heading
                size={{ base: "xl", sm: "2xl", md: "3xl" }}
                lineHeight="1.1"
                mb={{ base: 4, md: 6 }}
                fontWeight="800"
              >
                Welcome to your community hub
              </Heading>
              <Text
                fontSize={{ base: "lg", md: "xl" }}
                color="whiteAlpha.900"
                mb={8}
                lineHeight="1.8"
              >
                Reserve the clubhouse for personal use, stay updated with
                announcements, and register for community events—fast,
                mobile-friendly, and organized.
              </Text>

              <Stack direction={{ base: "column", sm: "row" }} gap={4} mb={8}>
                <Button
                  onClick={() => (window.location.href = "/resident-portal")}
                  size="lg"
                  bg="white"
                  color="navy.600"
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    bg: "whiteAlpha.900",
                    transform: "translateY(-2px)",
                  }}
                >
                  🎫 Browse Events
                </Button>

                <Button
                  onClick={() => (window.location.href = "/resident/login")}
                  size="lg"
                  bg="transparent"
                  color="white"
                  borderWidth="2px"
                  borderColor="white"
                  px={8}
                  py={6}
                  fontSize="md"
                  fontWeight="bold"
                  _hover={{
                    bg: "whiteAlpha.200",
                  }}
                >
                  🔒 Sign in to Reserve
                </Button>
              </Stack>

              <Stack
                direction={{ base: "column", sm: "row" }}
                gap={{ base: 2, sm: 4, md: 6 }}
                color="whiteAlpha.800"
                fontSize={{ base: "xs", sm: "sm" }}
                flexWrap="wrap"
              >
                <HStack gap={2}>
                  <Text fontWeight="medium">📅 Room calendar</Text>
                </HStack>
                <HStack gap={2}>
                  <Text fontWeight="medium">👥 Event management</Text>
                </HStack>
                <HStack gap={2}>
                  <Text fontWeight="medium">🔔 Announcements</Text>
                </HStack>
              </Stack>
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
                  w="48px"
                  h="48px"
                  rounded="full"
                  bg="navy.500"
                  color="white"
                  alignItems="center"
                  justifyContent="center"
                  fontWeight="bold"
                  fontSize="xl"
                >
                  CO
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
                  ℹ️ Community Info
                </Button>
              </Stack>
            </Box>
          </Stack>
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
            icon="📅"
            title="Reserve the clubhouse"
            description="Residents can view availability and request a private reservation."
            ctaLabel="View availability"
            to="/reservations"
            variant="solid"
          />
          <FeatureCard
            icon="🎫"
            title="Register for events"
            description="No account needed to book tickets for upcoming community events."
            ctaLabel="View events"
            to="/resident-portal"
          />
          <FeatureCard
            icon="ℹ️"
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
                <Heading size={{ base: "md", md: "lg" }} color="navy.700">
                  📢 Announcements
                </Heading>
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
                <Heading size={{ base: "md", md: "lg" }} color="navy.700">
                  🎉 Upcoming events
                </Heading>
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

        {/* FOOTER CTA */}
        <Box
          mt={{ base: 10, md: 20 }}
          mb={{ base: 8, md: 16 }}
          p={{ base: 6, md: 12 }}
          rounded={{ base: "2xl", md: "3xl" }}
          bg="navy.600"
          color="white"
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
                Are you an event organizer?
              </Heading>
              <Text fontSize={{ base: "md", md: "lg" }} color="whiteAlpha.900">
                Sign in to create events, manage registrations, and check in
                attendees.
              </Text>
            </Box>
            <Button
              onClick={() => (window.location.href = "/admin/login")}
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
              👥 Organizer portal
            </Button>
          </Flex>
        </Box>
      </Container>
    </Box>
  );
}
