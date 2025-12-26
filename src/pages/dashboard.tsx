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
  createToaster,
  Toaster,
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
import {
  Users,
  Calendar,
  Clock,
  DollarSign,
  Building2,
  TrendingUp,
  LayoutDashboard,
  CalendarDays,
  UserCircle,
  Home,
  Megaphone,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import emailjs from "@emailjs/browser";

const toaster = createToaster({
  placement: "top-end",
  duration: 4000,
});

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

// Events and Announcements are now loaded from Firestore

function DashboardContent() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [residentsCount, setResidentsCount] = useState(0);
  const [residents, setResidents] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] =
    useState<AnnouncementItem | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedEventForAttendees, setSelectedEventForAttendees] =
    useState<EventItem | null>(null);
  const [editingAttendee, setEditingAttendee] = useState<any | null>(null);
  const [isEditAttendeeModalOpen, setIsEditAttendeeModalOpen] = useState(false);
  const [attendeeForm, setAttendeeForm] = useState({
    ticketCount: 0,
    paymentMethod: "cash",
  });
  const [clubhouseReservations, setClubhouseReservations] = useState<
    ClubhouseReservation[]
  >([]);
  const [isClubhouseModalOpen, setIsClubhouseModalOpen] = useState(false);
  const [editingClubhouse, setEditingClubhouse] =
    useState<ClubhouseReservation | null>(null);
  const [clubhouseForm, setClubhouseForm] = useState({
    date: "",
    startTime: "",
    endTime: "",
    purpose: "General Use",
    deposit: 100,
  });
  const [announcementForm, setAnnouncementForm] = useState({
    title: "",
    content: "",
    priority: "Normal",
    date: "",
  });
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

  // Load events, residents, announcements, bookings, and clubhouse from Firestore
  useEffect(() => {
    loadEvents();
    loadResidents();
    loadAnnouncements();
    loadBookings();
    loadClubhouseReservations();
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

  const loadAnnouncements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "announcements"));
      const loadedAnnouncements: AnnouncementItem[] = [];
      querySnapshot.forEach((doc) => {
        loadedAnnouncements.push({
          id: doc.id,
          ...doc.data(),
        } as AnnouncementItem);
      });
      setAnnouncements(loadedAnnouncements);
    } catch (error) {
      console.error("Error loading announcements:", error);
    }
  };

  const loadBookings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "bookings"));
      const loadedBookings: any[] = [];
      querySnapshot.forEach((doc) => {
        loadedBookings.push({ id: doc.id, ...doc.data() });
      });
      setBookings(loadedBookings);
    } catch (error) {
      console.error("Error loading bookings:", error);
    }
  };

  const loadClubhouseReservations = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "clubhouse"));
      const loadedReservations: ClubhouseReservation[] = [];
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to start of day for accurate comparison

      querySnapshot.forEach((doc) => {
        loadedReservations.push({
          id: doc.id,
          ...doc.data(),
        } as ClubhouseReservation);
      });

      // Auto-update past approved reservations to "completed"
      for (const reservation of loadedReservations) {
        if (reservation.status === "approved") {
          const reservationDate = new Date(reservation.date);
          reservationDate.setHours(0, 0, 0, 0);

          // If reservation date is in the past, mark as completed
          if (reservationDate < today) {
            try {
              await updateDoc(doc(db, "clubhouse", reservation.id), {
                status: "completed",
              });
              reservation.status = "completed";
            } catch (error) {
              console.error("Error updating reservation status:", error);
            }
          }
        }
      }

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

  const handleCreateClubhouse = async () => {
    if (
      !clubhouseForm.date ||
      !clubhouseForm.startTime ||
      !clubhouseForm.endTime
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      if (editingClubhouse) {
        await updateDoc(doc(db, "clubhouse", editingClubhouse.id), {
          date: clubhouseForm.date,
          startTime: clubhouseForm.startTime,
          endTime: clubhouseForm.endTime,
          purpose: clubhouseForm.purpose,
          deposit: clubhouseForm.deposit,
        });
      } else {
        await addDoc(collection(db, "clubhouse"), {
          date: clubhouseForm.date,
          startTime: clubhouseForm.startTime,
          endTime: clubhouseForm.endTime,
          purpose: clubhouseForm.purpose,
          deposit: clubhouseForm.deposit,
          isAvailable: true,
          status: "available",
        });
      }
      await loadClubhouseReservations();
      setIsClubhouseModalOpen(false);
      setEditingClubhouse(null);
      setClubhouseForm({
        date: "",
        startTime: "",
        endTime: "",
        purpose: "General Use",
        deposit: 100,
      });
    } catch (error) {
      console.error("Error saving clubhouse slot:", error);
      alert("Failed to save clubhouse slot");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClubhouse = async (reservationId: string) => {
    if (!confirm("Are you sure you want to delete this clubhouse slot?"))
      return;

    try {
      await deleteDoc(doc(db, "clubhouse", reservationId));
      await loadClubhouseReservations();
    } catch (error) {
      console.error("Error deleting clubhouse slot:", error);
      alert("Failed to delete clubhouse slot");
    }
  };

  const handleCancelReservation = async (reservation: ClubhouseReservation) => {
    if (
      !confirm(
        `Are you sure you want to cancel ${reservation.reservedByName}'s reservation?`
      )
    )
      return;

    try {
      await updateDoc(doc(db, "clubhouse", reservation.id), {
        status: "cancelled",
      });
      await loadClubhouseReservations();
      alert("Reservation cancelled successfully!");
    } catch (error) {
      console.error("Error cancelling reservation:", error);
      alert("Failed to cancel reservation");
    }
  };

  const handleApproveReservation = async (
    reservation: ClubhouseReservation
  ) => {
    try {
      await updateDoc(doc(db, "clubhouse", reservation.id), {
        status: "approved",
      });
      await loadClubhouseReservations();
      toaster.success({
        title: "Reservation Approved",
        description: "Clubhouse reservation has been approved successfully!",
      });
    } catch (error) {
      console.error("Error approving reservation:", error);
      toaster.error({
        title: "Approval Failed",
        description: "Failed to approve reservation. Please try again.",
      });
    }
  };

  const handleRejectReservation = async (reservation: ClubhouseReservation) => {
    if (
      !confirm(
        `Are you sure you want to reject ${reservation.reservedByName}'s reservation request?`
      )
    )
      return;

    try {
      await updateDoc(doc(db, "clubhouse", reservation.id), {
        status: "rejected",
      });
      await loadClubhouseReservations();
      toaster.success({
        title: "Reservation Rejected",
        description: "Clubhouse reservation has been rejected.",
      });
    } catch (error) {
      console.error("Error rejecting reservation:", error);
      toaster.error({
        title: "Rejection Failed",
        description: "Failed to reject reservation. Please try again.",
      });
    }
  };

  const handleApproveAccount = async (resident: any) => {
    try {
      await updateDoc(doc(db, "users", resident.id), {
        isApproved: true,
        status: "approved",
        approvedAt: new Date().toISOString(),
      });

      // Send approval email notification
      await sendApprovalEmail(resident);

      await loadResidents();
      toaster.success({
        title: "Account Approved",
        description: `${resident.name}'s account has been approved and notification email sent!`,
      });
    } catch (error) {
      console.error("Error approving account:", error);
      toaster.error({
        title: "Approval Failed",
        description: "Failed to approve account. Please try again.",
      });
    }
  };

  const sendApprovalEmail = async (resident: any) => {
    try {
      const SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID;
      const TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
      const PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

      console.log("EmailJS Config Check:");
      console.log("- Service ID:", SERVICE_ID ? "✓ Set" : "✗ Missing");
      console.log("- Template ID:", TEMPLATE_ID ? "✓ Set" : "✗ Missing");
      console.log("- Public Key:", PUBLIC_KEY ? "✓ Set" : "✗ Missing");

      if (!SERVICE_ID || !TEMPLATE_ID || !PUBLIC_KEY) {
        console.error(
          "EmailJS not configured properly. Please check your .env file and restart the dev server."
        );
        toaster.warning({
          title: "Email Service Not Configured",
          description:
            "Email notification could not be sent. Please contact administrator.",
        });
        return;
      }

      const templateParams = {
        to_email: resident.email,
        to_name: resident.name,
        from_name: "HOA Administration",
        reply_to: resident.email,
        message: `

Great news! Your account for the HOA Community Portal has been approved.

You can now log in and access all portal features:
- View community events and book tickets
- Reserve the clubhouse
- View community announcements
- And more!

Login here: ${window.location.origin}/resident/login

Welcome to our community!

`,
        login_link: `${window.location.origin}/resident/login`,
      };

      console.log("Sending email with params:", templateParams);
      console.log("Recipient email:", resident.email);
      console.log("Using Service ID:", SERVICE_ID);

      const response = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY
      );

      console.log("✓ Email sent successfully!", response);
      console.log("Status:", response.status);
      console.log("Text:", response.text);
    } catch (error) {
      console.error("Error sending approval email:", error);
      // Don't throw error - account is still approved even if email fails
    }
  };

  const handleRejectAccount = async (resident: any) => {
    if (
      !confirm(
        `Are you sure you want to reject ${resident.name}'s account? This will permanently delete their account.`
      )
    )
      return;

    try {
      // Delete the user document from Firestore
      await deleteDoc(doc(db, "users", resident.id));
      await loadResidents();
      toaster.success({
        title: "Account Rejected",
        description: `${resident.name}'s account has been rejected and deleted.`,
      });
    } catch (error) {
      console.error("Error rejecting account:", error);
      toaster.error({
        title: "Rejection Failed",
        description: "Failed to reject account. Please try again.",
      });
    }
  };

  const handleDeleteResident = async (resident: any) => {
    if (
      !confirm(
        `Are you sure you want to permanently delete ${resident.name}'s account? This action cannot be undone.`
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "users", resident.id));
      await loadResidents();
      toaster.success({
        title: "Resident Deleted",
        description: `${resident.name}'s account has been permanently deleted.`,
      });
    } catch (error) {
      console.error("Error deleting resident:", error);
      toaster.error({
        title: "Deletion Failed",
        description: "Failed to delete resident. Please try again.",
      });
    }
  };

  const viewEventAttendees = (event: EventItem) => {
    setSelectedEventForAttendees(event);
    setActiveTab("event-detail");
  };

  const getEventAttendees = (eventId: string) => {
    return bookings.filter((booking) => booking.eventId === eventId);
  };

  const downloadAttendeesList = () => {
    if (!selectedEventForAttendees) return;

    const attendees = getEventAttendees(selectedEventForAttendees.id);
    const csvContent = [
      [
        "Name",
        "Email",
        "Tickets",
        "Payment Method",
        "Total",
        "Booking Date",
      ].join(","),
      ...attendees.map((booking) =>
        [
          booking.userName,
          booking.userEmail,
          booking.ticketCount,
          booking.paymentMethod || "Cash",
          `$${booking.totalAmount}`,
          new Date(booking.bookedAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedEventForAttendees.title.replace(
      /\s+/g,
      "_"
    )}_attendees.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const deleteAttendee = async (booking: any) => {
    if (
      !confirm(`Are you sure you want to remove ${booking.userName}'s booking?`)
    ) {
      return;
    }

    try {
      // Delete the booking
      await deleteDoc(doc(db, "bookings", booking.id));

      // Update available tickets
      if (selectedEventForAttendees) {
        const eventRef = doc(db, "events", selectedEventForAttendees.id);
        await updateDoc(eventRef, {
          availableTickets:
            selectedEventForAttendees.availableTickets + booking.ticketCount,
        });
      }

      // Reload data
      await loadBookings();
      await loadEvents();

      alert("Booking removed successfully!");
    } catch (error) {
      console.error("Error deleting booking:", error);
      alert("Failed to delete booking. Please try again.");
    }
  };

  const openEditAttendeeModal = (booking: any) => {
    setEditingAttendee(booking);
    setAttendeeForm({
      ticketCount: booking.ticketCount,
      paymentMethod: booking.paymentMethod || "cash",
    });
    setIsEditAttendeeModalOpen(true);
  };

  const handleSaveAttendee = async () => {
    if (!editingAttendee || !selectedEventForAttendees) return;

    try {
      setLoading(true);

      const ticketDifference =
        attendeeForm.ticketCount - editingAttendee.ticketCount;
      const newTotalAmount = selectedEventForAttendees.isFree
        ? 0
        : selectedEventForAttendees.price * attendeeForm.ticketCount;

      // Update booking
      await updateDoc(doc(db, "bookings", editingAttendee.id), {
        ticketCount: attendeeForm.ticketCount,
        paymentMethod: attendeeForm.paymentMethod,
        totalAmount: newTotalAmount,
      });

      // Update available tickets if ticket count changed
      if (ticketDifference !== 0) {
        const eventRef = doc(db, "events", selectedEventForAttendees.id);
        await updateDoc(eventRef, {
          availableTickets:
            selectedEventForAttendees.availableTickets - ticketDifference,
        });
      }

      // Reload data
      await loadBookings();
      await loadEvents();

      setIsEditAttendeeModalOpen(false);
      setEditingAttendee(null);
      alert("Booking updated successfully!");
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("Failed to update booking. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const printAttendeesList = () => {
    if (!selectedEventForAttendees) return;

    const attendees = getEventAttendees(selectedEventForAttendees.id);
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const totalTickets = attendees.reduce(
      (sum, booking) => sum + booking.ticketCount,
      0
    );
    const totalRevenue = attendees.reduce(
      (sum, booking) => sum + booking.totalAmount,
      0
    );

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${selectedEventForAttendees.title} - Attendees List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1a365d; }
            .header { margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1a365d; }
            .summary { background: #f7fafc; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
            th { background-color: #1a365d; color: white; }
            tr:hover { background-color: #f7fafc; }
            .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${selectedEventForAttendees.title}</h1>
            <p><strong>Date:</strong> ${selectedEventForAttendees.date} at ${
      selectedEventForAttendees.time
    }</p>
            <p><strong>Location:</strong> ${
              selectedEventForAttendees.location
            }</p>
          </div>
          <div class="summary">
            <p><strong>Total Attendees:</strong> ${attendees.length}</p>
            <p><strong>Total Tickets Booked:</strong> ${totalTickets}</p>
            <p><strong>Total Revenue:</strong> $${totalRevenue}</p>
          </div>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Tickets</th>
                <th>Payment</th>
                <th>Amount</th>
                <th>Booking Date</th>
              </tr>
            </thead>
            <tbody>
              ${attendees
                .map(
                  (booking) => `
                <tr>
                  <td>${booking.userName}</td>
                  <td>${booking.userEmail}</td>
                  <td>${booking.ticketCount}</td>
                  <td>${booking.paymentMethod || "Cash"}</td>
                  <td>$${booking.totalAmount}</td>
                  <td>${new Date(booking.bookedAt).toLocaleDateString()}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div class="footer">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const openNewAnnouncementModal = () => {
    setEditingAnnouncement(null);
    setAnnouncementForm({
      title: "",
      content: "",
      priority: "Normal",
      date: "",
    });
    setIsAnnouncementModalOpen(true);
  };

  const handleCreateAnnouncement = async () => {
    try {
      setLoading(true);

      // Validation
      if (!announcementForm.title.trim()) {
        alert("Please enter an announcement title");
        setLoading(false);
        return;
      }
      if (!announcementForm.content.trim()) {
        alert("Please enter announcement content");
        setLoading(false);
        return;
      }
      if (!announcementForm.date) {
        alert("Please select a date");
        setLoading(false);
        return;
      }

      if (editingAnnouncement) {
        // Update existing announcement
        const announcementRef = doc(
          db,
          "announcements",
          editingAnnouncement.id
        );
        await updateDoc(announcementRef, {
          title: announcementForm.title,
          content: announcementForm.content,
          priority: announcementForm.priority,
          date: announcementForm.date,
        });
      } else {
        // Create new announcement
        await addDoc(collection(db, "announcements"), {
          title: announcementForm.title,
          content: announcementForm.content,
          priority: announcementForm.priority,
          date: announcementForm.date,
          status: "active",
          createdAt: new Date().toISOString(),
        });
      }

      await loadAnnouncements();
      setIsAnnouncementModalOpen(false);
      setEditingAnnouncement(null);
      setAnnouncementForm({
        title: "",
        content: "",
        priority: "Normal",
        date: "",
      });
    } catch (error) {
      console.error("Error saving announcement:", error);
      alert("Failed to save announcement. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAnnouncementStatus = async (
    id: string,
    currentStatus?: string
  ) => {
    const isActive = currentStatus === "active";
    const action = isActive ? "deactivate" : "reactivate";

    if (!confirm(`Are you sure you want to ${action} this announcement?`))
      return;

    try {
      const announcementRef = doc(db, "announcements", id);
      await updateDoc(announcementRef, {
        status: isActive ? "deactivated" : "active",
        ...(isActive
          ? { deactivatedAt: new Date().toISOString() }
          : { reactivatedAt: new Date().toISOString() }),
      });
      await loadAnnouncements();
    } catch (error) {
      console.error("Error updating announcement status:", error);
      alert("Failed to update announcement status");
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
  const eventRevenue = bookings.reduce((sum, booking) => {
    return sum + (booking.totalAmount || 0);
  }, 0);

  const clubhouseRevenue = clubhouseReservations
    .filter((res) => res.status === "approved")
    .reduce((sum, res) => {
      return sum + (res.deposit || 0);
    }, 0);

  const totalRevenue = eventRevenue + clubhouseRevenue;

  const pendingReservationsCount = clubhouseReservations.filter(
    (res) => res.status === "pending"
  ).length;

  const pendingAccountsCount = residents.filter(
    (res) => res.isApproved === false || res.status === "pending"
  ).length;

  const stats = [
    {
      label: "Total Residents",
      value: residentsCount.toString(),
      icon: Users,
      change: residentsCount === 0 ? "No residents yet" : "Registered users",
      color: "blue",
    },
    {
      label: "Active Events",
      value: events.length.toString(),
      icon: Calendar,
      change: events.length === 0 ? "No events created" : "Community events",
      color: "purple",
    },
    {
      label: "Pending Accounts",
      value: pendingAccountsCount.toString(),
      icon: UserCircle,
      change:
        pendingAccountsCount === 0
          ? "No pending approvals"
          : "Awaiting approval",
      color: "yellow",
    },
    {
      label: "Pending Reservations",
      value: pendingReservationsCount.toString(),
      icon: Clock,
      change:
        pendingReservationsCount === 0
          ? "No pending requests"
          : "Awaiting approval",
      color: "orange",
    },
    {
      label: "Event Revenue",
      value: `$${eventRevenue.toFixed(2)}`,
      icon: DollarSign,
      change: eventRevenue === 0 ? "No ticket sales" : "From ticket bookings",
      color: "teal",
    },
    {
      label: "Clubhouse Revenue",
      value: `$${clubhouseRevenue.toFixed(2)}`,
      icon: Building2,
      change:
        clubhouseRevenue === 0 ? "No deposits" : "From approved reservations",
      color: "cyan",
    },
    {
      label: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      change: totalRevenue === 0 ? "No revenue yet" : "Events + Clubhouse",
      color: "green",
    },
  ];

  const menuItems = [
    { id: "overview", icon: LayoutDashboard, label: "Overview" },
    { id: "events", icon: CalendarDays, label: "Events" },
    { id: "residents", icon: UserCircle, label: "Residents" },
    { id: "reservations", icon: Home, label: "Reservations" },
    { id: "announcements", icon: Megaphone, label: "Announcements" },
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  // Sidebar Component
  const Sidebar = ({ isMobile = false }) => {
    const sidebarWidth = isMobile ? "260px" : isCollapsed ? "80px" : "260px";

    return (
      <Box
        w={{ base: "full", md: sidebarWidth }}
        bg="navy.800"
        minH={{ base: "auto", md: "100vh" }}
        color="white"
        position={{ base: "relative", md: "fixed" }}
        left="0"
        top="0"
        overflowY="auto"
        transition="width 0.3s ease"
      >
        <Box
          p={isCollapsed && !isMobile ? 4 : 6}
          borderBottomWidth="1px"
          borderBottomColor="whiteAlpha.200"
        >
          {!isCollapsed || isMobile ? (
            <>
              <Heading size="md" color="white">
                HOA Admin
              </Heading>
              <Text fontSize="xs" color="whiteAlpha.700" mt={1}>
                Management Portal
              </Text>
            </>
          ) : (
            <Heading size="md" color="white" textAlign="center">
              HA
            </Heading>
          )}
        </Box>

        {/* Toggle button - only on desktop */}
        {!isMobile && (
          <Box p={2} borderBottomWidth="1px" borderBottomColor="whiteAlpha.200">
            <Button
              onClick={() => setIsCollapsed(!isCollapsed)}
              variant="ghost"
              color="whiteAlpha.700"
              width="full"
              size="sm"
              justifyContent={isCollapsed ? "center" : "flex-start"}
              _hover={{ bg: "whiteAlpha.100", color: "white" }}
            >
              {isCollapsed ? (
                <Box as={ChevronRight} width="20px" height="20px" />
              ) : (
                <HStack gap={2}>
                  <Box as={ChevronLeft} width="20px" height="20px" />
                  <Text fontSize="sm">Collapse</Text>
                </HStack>
              )}
            </Button>
          </Box>
        )}

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
              justifyContent={
                isCollapsed && !isMobile ? "center" : "flex-start"
              }
              px={4}
              py={6}
              fontWeight={activeTab === item.id ? "bold" : "normal"}
              _hover={{
                bg: activeTab === item.id ? "navy.600" : "whiteAlpha.100",
                color: "white",
              }}
              title={isCollapsed && !isMobile ? item.label : undefined}
            >
              {!isCollapsed || isMobile ? (
                <HStack gap={3}>
                  <Box as={item.icon} width="20px" height="20px" />
                  <Text>{item.label}</Text>
                </HStack>
              ) : (
                <Box as={item.icon} width="20px" height="20px" />
              )}
            </Button>
          ))}
        </VStack>

        <Box
          p={4}
          mt="auto"
          borderTopWidth="1px"
          borderTopColor="whiteAlpha.200"
        >
          <Button
            onClick={handleLogout}
            variant="ghost"
            color="red.300"
            width="full"
            justifyContent={isCollapsed && !isMobile ? "center" : "flex-start"}
            _hover={{ bg: "red.900", color: "white" }}
            title={isCollapsed && !isMobile ? "Logout" : undefined}
          >
            {!isCollapsed || isMobile ? (
              <HStack gap={3}>
                <Box as={LogOut} width="20px" height="20px" />
                <Text>Logout</Text>
              </HStack>
            ) : (
              <Box as={LogOut} width="20px" height="20px" />
            )}
          </Button>
        </Box>
      </Box>
    );
  };

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
      <Box
        ml={{ base: 0, md: isCollapsed ? "80px" : "260px" }}
        minH="100vh"
        transition="margin-left 0.3s ease"
      >
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
                Menu
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
              {/* Welcome Banner */}
              <Box
                bgGradient="to-r"
                gradientFrom="navy.600"
                gradientTo="navy.800"
                rounded="2xl"
                shadow="xl"
                p={{ base: 6, md: 8 }}
                color="white"
              >
                <Heading size={{ base: "lg", md: "xl" }} mb={2}>
                  Welcome back, Admin!
                </Heading>
                <Text fontSize={{ base: "sm", md: "md" }} opacity={0.9}>
                  Here's what's happening in your community today
                </Text>
              </Box>

              {/* Stats Grid */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} gap={5}>
                {stats.map((stat, index) => (
                  <Box
                    key={stat.label}
                    bg="white"
                    p={6}
                    rounded="2xl"
                    shadow="lg"
                    borderWidth="1px"
                    borderColor="gray.100"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.3s"
                    _hover={{
                      shadow: "2xl",
                      transform: "translateY(-4px)",
                      borderColor: "navy.200",
                    }}
                    _before={{
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      height: "4px",
                      bg:
                        index % 6 === 0
                          ? "blue.500"
                          : index % 6 === 1
                          ? "purple.500"
                          : index % 6 === 2
                          ? "orange.500"
                          : index % 6 === 3
                          ? "teal.500"
                          : index % 6 === 4
                          ? "cyan.500"
                          : "green.500",
                    }}
                  >
                    <Flex direction="column" gap={3}>
                      <Flex justify="space-between" align="start">
                        <Box
                          bg={
                            index % 6 === 0
                              ? "blue.50"
                              : index % 6 === 1
                              ? "purple.50"
                              : index % 6 === 2
                              ? "orange.50"
                              : index % 6 === 3
                              ? "teal.50"
                              : index % 6 === 4
                              ? "cyan.50"
                              : "green.50"
                          }
                          p={3}
                          rounded="xl"
                        >
                          <Box as={stat.icon} width="28px" height="28px" />
                        </Box>
                        <Box textAlign="right">
                          <Text
                            fontSize="3xl"
                            fontWeight="bold"
                            color="navy.700"
                            lineHeight="1"
                          >
                            {stat.value}
                          </Text>
                        </Box>
                      </Flex>
                      <Box>
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
                    </Flex>
                  </Box>
                ))}
              </SimpleGrid>

              {/* Two Column Layout */}
              <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                {/* Quick Actions */}
                <Box
                  bg="white"
                  rounded="2xl"
                  shadow="lg"
                  p={6}
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Flex align="center" gap={3} mb={5}>
                    <Heading size="md" color="navy.700">
                      Quick Actions
                    </Heading>
                  </Flex>
                  <SimpleGrid columns={{ base: 1, sm: 2 }} gap={3}>
                    <Button
                      bg="navy.600"
                      color="white"
                      _hover={{ bg: "navy.700", transform: "scale(1.02)" }}
                      size="lg"
                      height="auto"
                      py={4}
                      transition="all 0.2s"
                      onClick={openNewAnnouncementModal}
                    >
                      <VStack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          New Announcement
                        </Text>
                      </VStack>
                    </Button>
                    <Button
                      bg="purple.600"
                      color="white"
                      _hover={{ bg: "purple.700", transform: "scale(1.02)" }}
                      size="lg"
                      height="auto"
                      py={4}
                      transition="all 0.2s"
                      onClick={() => setActiveTab("events")}
                    >
                      <VStack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          Manage Events
                        </Text>
                      </VStack>
                    </Button>
                    <Button
                      bg="orange.600"
                      color="white"
                      _hover={{ bg: "orange.700", transform: "scale(1.02)" }}
                      size="lg"
                      height="auto"
                      py={4}
                      transition="all 0.2s"
                      onClick={() => setActiveTab("reservations")}
                    >
                      <VStack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          Reservations
                        </Text>
                      </VStack>
                    </Button>
                    <Button
                      bg="teal.600"
                      color="white"
                      _hover={{ bg: "teal.700", transform: "scale(1.02)" }}
                      size="lg"
                      height="auto"
                      py={4}
                      transition="all 0.2s"
                      onClick={() => setActiveTab("residents")}
                    >
                      <VStack gap={1}>
                        <Text fontSize="sm" fontWeight="semibold">
                          View Residents
                        </Text>
                      </VStack>
                    </Button>
                  </SimpleGrid>
                </Box>

                {/* Recent Activity */}
                <Box
                  bg="white"
                  rounded="2xl"
                  shadow="lg"
                  p={6}
                  borderWidth="1px"
                  borderColor="gray.100"
                >
                  <Flex align="center" gap={3} mb={5}>
                    <Heading size="md" color="navy.700">
                      Quick Stats
                    </Heading>
                  </Flex>
                  <Stack gap={4}>
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color="gray.600">
                          Active Announcements
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="navy.700">
                          {
                            announcements.filter((a) => a.status === "active")
                              .length
                          }
                        </Text>
                      </Flex>
                      <Box bg="gray.100" h="2" rounded="full" overflow="hidden">
                        <Box
                          bg="blue.500"
                          h="full"
                          w={`${
                            (announcements.filter((a) => a.status === "active")
                              .length /
                              Math.max(announcements.length, 1)) *
                            100
                          }%`}
                          transition="all 0.3s"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color="gray.600">
                          Total Bookings
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="navy.700">
                          {bookings.length}
                        </Text>
                      </Flex>
                      <Box bg="gray.100" h="2" rounded="full" overflow="hidden">
                        <Box
                          bg="purple.500"
                          h="full"
                          w={bookings.length > 0 ? "75%" : "0%"}
                          transition="all 0.3s"
                        />
                      </Box>
                    </Box>
                    <Box>
                      <Flex justify="space-between" align="center" mb={2}>
                        <Text fontSize="sm" color="gray.600">
                          Approved Reservations
                        </Text>
                        <Text fontSize="lg" fontWeight="bold" color="navy.700">
                          {
                            clubhouseReservations.filter(
                              (r) => r.status === "approved"
                            ).length
                          }
                        </Text>
                      </Flex>
                      <Box bg="gray.100" h="2" rounded="full" overflow="hidden">
                        <Box
                          bg="green.500"
                          h="full"
                          w={`${
                            (clubhouseReservations.filter(
                              (r) => r.status === "approved"
                            ).length /
                              Math.max(clubhouseReservations.length, 1)) *
                            100
                          }%`}
                          transition="all 0.3s"
                        />
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </SimpleGrid>
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
                    cursor="pointer"
                    onClick={() => viewEventAttendees(event)}
                    _hover={{
                      shadow: "lg",
                      borderColor: "navy.400",
                      transform: "translateY(-2px)",
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
                        <Text fontSize="xs" fontWeight="semibold">
                          Date: {event.date}
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          Time: {event.time}
                        </Text>
                        <Text fontSize="xs" fontWeight="semibold">
                          Location: {event.location}
                        </Text>
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          bg="green.500"
                          color="white"
                          flex="1"
                          _hover={{ bg: "green.600" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            viewEventAttendees(event);
                          }}
                        >
                          Attendees ({getEventAttendees(event.id).length})
                        </Button>
                        <Button
                          size="sm"
                          bg="red.500"
                          color="white"
                          flex="1"
                          _hover={{ bg: "red.600" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event.id);
                          }}
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
                            fontWeight="bold"
                            color="navy.700"
                          >
                            U
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
                          <Text
                            fontWeight="semibold"
                            color="gray.700"
                            fontSize="xs"
                          >
                            Email: {resident.email || "N/A"}
                          </Text>
                          <Text
                            fontWeight="semibold"
                            color="gray.700"
                            fontSize="xs"
                          >
                            Address: {resident.address || "No address"}
                          </Text>
                          <Text
                            fontWeight="semibold"
                            color="gray.700"
                            fontSize="xs"
                          >
                            Joined:{" "}
                            {resident.createdAt
                              ? new Date(
                                  resident.createdAt
                                ).toLocaleDateString()
                              : "N/A"}
                          </Text>
                        </Stack>

                        {/* Approval/Status section */}
                        {resident.status === "pending" ||
                        resident.isApproved === false ? (
                          <Stack gap={2}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="orange.600"
                            >
                              Status: Pending Approval
                            </Text>
                            <HStack gap={2}>
                              <Button
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleApproveAccount(resident)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                colorScheme="red"
                                variant="outline"
                                onClick={() => handleRejectAccount(resident)}
                              >
                                Reject
                              </Button>
                            </HStack>
                          </Stack>
                        ) : resident.isActive === false ? (
                          <Stack gap={2}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="red.600"
                            >
                              Status: Deactivated
                            </Text>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleDeleteResident(resident)}
                            >
                              Delete Account
                            </Button>
                          </Stack>
                        ) : (
                          <Stack gap={2}>
                            <Text
                              fontSize="xs"
                              fontWeight="bold"
                              color="green.600"
                            >
                              Status: Active
                            </Text>
                            <Button
                              size="sm"
                              colorScheme="red"
                              variant="outline"
                              onClick={() => handleDeleteResident(resident)}
                            >
                              Delete Account
                            </Button>
                          </Stack>
                        )}

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
                Clubhouse Reservations
              </Heading>

              {/* Summary Cards */}
              <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={4}>
                <Box
                  bg="white"
                  p={5}
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Total Bookings
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="navy.700">
                    {clubhouseReservations.length}
                  </Text>
                </Box>
                <Box
                  bg="white"
                  p={5}
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Pending
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="orange.600">
                    {
                      clubhouseReservations.filter(
                        (r) => r.status === "pending"
                      ).length
                    }
                  </Text>
                </Box>
                <Box
                  bg="white"
                  p={5}
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Approved
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.600">
                    {
                      clubhouseReservations.filter(
                        (r) => r.status === "approved"
                      ).length
                    }
                  </Text>
                </Box>
                <Box
                  bg="white"
                  p={5}
                  rounded="xl"
                  shadow="md"
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text fontSize="sm" color="gray.600" mb={2}>
                    Total Deposits
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.600">
                    $
                    {clubhouseReservations
                      .filter((r) => r.status === "approved")
                      .reduce((sum, r) => sum + (r.deposit || 100), 0)}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Reservations List */}
              {clubhouseReservations.length === 0 ? (
                <Box
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  p={8}
                  borderWidth="1px"
                  borderColor="gray.200"
                  textAlign="center"
                >
                  <Text color="gray.600" fontSize="lg">
                    No clubhouse reservations yet. Residents can create booking
                    requests from the portal.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
                  {clubhouseReservations.map((reservation) => (
                    <Box
                      key={reservation.id}
                      bg="white"
                      p={6}
                      rounded="xl"
                      shadow="md"
                      borderWidth="2px"
                      borderColor={
                        reservation.isAvailable ? "green.200" : "orange.200"
                      }
                      _hover={{ shadow: "lg" }}
                      transition="all 0.2s"
                    >
                      <Stack gap={4}>
                        {/* Header */}
                        <Flex justify="space-between" align="start">
                          <Box flex="1">
                            <HStack gap={2} mb={2}>
                              <Heading size="md" color="navy.700">
                                Clubhouse
                              </Heading>
                            </HStack>
                            <HStack gap={2}>
                              <Box
                                as="span"
                                px={3}
                                py={1}
                                bg={
                                  reservation.status === "pending"
                                    ? "orange.100"
                                    : reservation.status === "approved"
                                    ? "green.100"
                                    : "red.100"
                                }
                                color={
                                  reservation.status === "pending"
                                    ? "orange.700"
                                    : reservation.status === "approved"
                                    ? "green.700"
                                    : "red.700"
                                }
                                rounded="full"
                                fontSize="xs"
                                fontWeight="bold"
                              >
                                {reservation.status === "pending"
                                  ? "Pending"
                                  : reservation.status === "approved"
                                  ? "Approved"
                                  : "Rejected"}
                              </Box>
                              <Box
                                as="span"
                                px={3}
                                py={1}
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
                        <Stack gap={2} fontSize="sm" color="gray.700">
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

                        {/* Reservation Info */}
                        {reservation.reservedByName && (
                          <Box
                            p={3}
                            bg="gray.50"
                            rounded="md"
                            borderWidth="1px"
                            borderColor="gray.200"
                          >
                            <Text fontSize="xs" color="gray.600" mb={1}>
                              Requested by
                            </Text>
                            <Text fontWeight="bold" color="navy.700">
                              {reservation.reservedByName}
                            </Text>
                            <Text fontSize="sm" color="gray.600">
                              {reservation.reservedByEmail}
                            </Text>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                              Payment: {reservation.paymentMethod || "Cash"}
                            </Text>
                            {reservation.reservedAt && (
                              <Text fontSize="xs" color="gray.500">
                                Requested on{" "}
                                {new Date(
                                  reservation.reservedAt
                                ).toLocaleDateString()}
                              </Text>
                            )}
                          </Box>
                        )}

                        {/* Actions */}
                        <HStack gap={2} justify="flex-end" flexWrap="wrap">
                          {reservation.status === "pending" && (
                            <>
                              <Button
                                size="sm"
                                bg="green.500"
                                color="white"
                                _hover={{ bg: "green.600" }}
                                onClick={() =>
                                  handleApproveReservation(reservation)
                                }
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                bg="red.500"
                                color="white"
                                _hover={{ bg: "red.600" }}
                                onClick={() =>
                                  handleRejectReservation(reservation)
                                }
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          {reservation.status === "approved" && (
                            <Button
                              size="sm"
                              bg="orange.500"
                              color="white"
                              _hover={{ bg: "orange.600" }}
                              onClick={() =>
                                handleCancelReservation(reservation)
                              }
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            bg="red.500"
                            color="white"
                            _hover={{ bg: "red.600" }}
                            onClick={() =>
                              handleDeleteClubhouse(reservation.id)
                            }
                          >
                            Delete
                          </Button>
                        </HStack>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
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
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={openNewAnnouncementModal}
                >
                  + New Announcement
                </Button>
              </Flex>

              {announcements.length === 0 ? (
                <Box
                  bg="white"
                  rounded="xl"
                  shadow="md"
                  p={6}
                  borderWidth="1px"
                  borderColor="gray.200"
                >
                  <Text color="gray.600" textAlign="center">
                    No announcements yet. Create your first announcement to get
                    started.
                  </Text>
                </Box>
              ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                  {announcements.map((announcement) => (
                    <Box
                      key={announcement.id}
                      bg="white"
                      p={6}
                      rounded="xl"
                      shadow="md"
                      borderWidth="1px"
                      borderColor="gray.200"
                      _hover={{ shadow: "lg" }}
                      transition="all 0.2s"
                      opacity={announcement.status === "deactivated" ? 0.6 : 1}
                    >
                      <Stack gap={3}>
                        <Flex justify="space-between" align="start">
                          <Box flex="1">
                            <HStack gap={2} mb={2}>
                              <Text
                                fontSize="xs"
                                fontWeight="bold"
                                px={2}
                                py={1}
                                rounded="md"
                                bg={
                                  announcement.priority === "High"
                                    ? "red.100"
                                    : announcement.priority === "Medium"
                                    ? "orange.100"
                                    : "blue.100"
                                }
                                color={
                                  announcement.priority === "High"
                                    ? "red.700"
                                    : announcement.priority === "Medium"
                                    ? "orange.700"
                                    : "blue.700"
                                }
                              >
                                {announcement.priority}
                              </Text>
                              {announcement.status === "deactivated" && (
                                <Text
                                  fontSize="xs"
                                  fontWeight="bold"
                                  px={2}
                                  py={1}
                                  rounded="md"
                                  bg="gray.200"
                                  color="gray.700"
                                >
                                  Deactivated
                                </Text>
                              )}
                            </HStack>
                            <Heading size="sm" color="navy.700" mb={2}>
                              {announcement.title}
                            </Heading>
                          </Box>
                        </Flex>
                        <Text fontSize="sm" color="gray.600" lineClamp={3}>
                          {announcement.content}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          Posted:{" "}
                          {new Date(announcement.date).toLocaleDateString()}
                        </Text>
                        <HStack gap={2} mt={2}>
                          <IconButton
                            aria-label="Edit announcement"
                            size="sm"
                            variant="ghost"
                            colorScheme="blue"
                            onClick={() => {
                              setEditingAnnouncement(announcement);
                              setAnnouncementForm({
                                title: announcement.title,
                                content: announcement.content,
                                priority: announcement.priority,
                                date: announcement.date,
                              });
                              setIsAnnouncementModalOpen(true);
                            }}
                          >
                            Edit
                          </IconButton>
                          <IconButton
                            aria-label={
                              announcement.status === "active"
                                ? "Deactivate announcement"
                                : "Reactivate announcement"
                            }
                            size="sm"
                            variant="ghost"
                            colorScheme={
                              announcement.status === "active"
                                ? "orange"
                                : "green"
                            }
                            onClick={() =>
                              handleToggleAnnouncementStatus(
                                announcement.id,
                                announcement.status
                              )
                            }
                          >
                            {announcement.status === "active"
                              ? "Deactivate"
                              : "Activate"}
                          </IconButton>
                        </HStack>
                      </Stack>
                    </Box>
                  ))}
                </SimpleGrid>
              )}
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

          {activeTab === "event-detail" && selectedEventForAttendees && (
            <Stack gap={6}>
              <Flex
                justify="space-between"
                align="center"
                flexWrap="wrap"
                gap={4}
              >
                <HStack gap={3}>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setActiveTab("events");
                      setSelectedEventForAttendees(null);
                    }}
                  >
                    ← Back to Events
                  </Button>
                  <Heading size="lg" color="navy.700">
                    {selectedEventForAttendees.title}
                  </Heading>
                </HStack>
                <HStack gap={2}>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="blue.600"
                    color="blue.600"
                    _hover={{ bg: "blue.50" }}
                    onClick={() => handleEditEvent(selectedEventForAttendees)}
                  >
                    Edit Event
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="red.600"
                    color="red.600"
                    _hover={{ bg: "red.50" }}
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this event?")
                      ) {
                        handleDeleteEvent(selectedEventForAttendees.id);
                        setActiveTab("events");
                        setSelectedEventForAttendees(null);
                      }
                    }}
                  >
                    Delete Event
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    borderColor="navy.600"
                    color="navy.600"
                    _hover={{ bg: "navy.50" }}
                    onClick={downloadAttendeesList}
                  >
                    Download CSV
                  </Button>
                  <Button
                    size="sm"
                    bg="navy.600"
                    color="white"
                    _hover={{ bg: "navy.700" }}
                    onClick={printAttendeesList}
                  >
                    Print List
                  </Button>
                </HStack>
              </Flex>

              {/* Event Info Card */}
              <Box
                bg="white"
                p={6}
                rounded="xl"
                shadow="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} gap={6}>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Date
                    </Text>
                    <Text fontWeight="bold" color="navy.700">
                      {selectedEventForAttendees.date}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Time
                    </Text>
                    <Text fontWeight="bold" color="navy.700">
                      {selectedEventForAttendees.time}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Location
                    </Text>
                    <Text fontWeight="bold" color="navy.700">
                      {selectedEventForAttendees.location}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Price
                    </Text>
                    <Text fontWeight="bold" color="navy.700">
                      {selectedEventForAttendees.isFree
                        ? "Free"
                        : `$${selectedEventForAttendees.price}`}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color="gray.600" mb={1}>
                      Available Tickets
                    </Text>
                    <Text
                      fontWeight="bold"
                      color={
                        selectedEventForAttendees.availableTickets === 0
                          ? "red.600"
                          : selectedEventForAttendees.availableTickets < 10
                          ? "orange.600"
                          : "green.600"
                      }
                    >
                      {selectedEventForAttendees.availableTickets} left
                    </Text>
                  </Box>
                </SimpleGrid>
                <Box mt={4}>
                  <Text fontSize="sm" color="gray.600" mb={1}>
                    Description
                  </Text>
                  <Text color="gray.700">
                    {selectedEventForAttendees.description}
                  </Text>
                </Box>
              </Box>

              {/* Attendees Stats */}
              <SimpleGrid columns={{ base: 1, md: 3 }} gap={6}>
                <Box
                  bg="gradient-to-br"
                  bgGradient="linear(to-br, blue.50, blue.100)"
                  p={6}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="blue.200"
                >
                  <Text fontSize="sm" color="blue.700" mb={1}>
                    Total Bookings
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="blue.700">
                    {getEventAttendees(selectedEventForAttendees.id).length}
                  </Text>
                </Box>
                <Box
                  bg="gradient-to-br"
                  bgGradient="linear(to-br, green.50, green.100)"
                  p={6}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="green.200"
                >
                  <Text fontSize="sm" color="green.700" mb={1}>
                    Total Tickets Sold
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="green.700">
                    {getEventAttendees(selectedEventForAttendees.id).reduce(
                      (sum, booking) => sum + booking.ticketCount,
                      0
                    )}
                  </Text>
                </Box>
                <Box
                  bg="gradient-to-br"
                  bgGradient="linear(to-br, purple.50, purple.100)"
                  p={6}
                  rounded="xl"
                  borderWidth="1px"
                  borderColor="purple.200"
                >
                  <Text fontSize="sm" color="purple.700" mb={1}>
                    Total Revenue
                  </Text>
                  <Text fontSize="3xl" fontWeight="bold" color="purple.700">
                    $
                    {getEventAttendees(selectedEventForAttendees.id).reduce(
                      (sum, booking) => sum + booking.totalAmount,
                      0
                    )}
                  </Text>
                </Box>
              </SimpleGrid>

              {/* Attendees List */}
              <Box
                bg="white"
                rounded="xl"
                shadow="md"
                borderWidth="1px"
                borderColor="gray.200"
              >
                <Box p={6} borderBottomWidth="1px" borderBottomColor="gray.200">
                  <Heading size="md" color="navy.700">
                    Attendees List
                  </Heading>
                </Box>

                {getEventAttendees(selectedEventForAttendees.id).length ===
                0 ? (
                  <Box p={8} textAlign="center">
                    <Text color="gray.600" fontSize="lg">
                      No bookings yet for this event.
                    </Text>
                  </Box>
                ) : (
                  <Stack gap={0}>
                    {getEventAttendees(selectedEventForAttendees.id).map(
                      (booking, index) => (
                        <Box
                          key={booking.id}
                          p={6}
                          borderBottomWidth={
                            index <
                            getEventAttendees(selectedEventForAttendees.id)
                              .length -
                              1
                              ? "1px"
                              : "0"
                          }
                          borderBottomColor="gray.100"
                          _hover={{ bg: "gray.50" }}
                          transition="all 0.2s"
                        >
                          <Flex
                            direction={{ base: "column", md: "row" }}
                            justify="space-between"
                            align={{ base: "start", md: "center" }}
                            gap={4}
                          >
                            <Flex align="center" gap={4} flex="1">
                              <Box
                                w="50px"
                                h="50px"
                                bg="navy.100"
                                rounded="full"
                                display="flex"
                                alignItems="center"
                                justifyContent="center"
                                fontSize="xl"
                                fontWeight="bold"
                                color="navy.700"
                                flexShrink={0}
                              >
                                U
                              </Box>
                              <Box flex="1">
                                <Text
                                  fontWeight="bold"
                                  color="navy.700"
                                  fontSize="lg"
                                >
                                  {booking.userName}
                                </Text>
                                <Text fontSize="sm" color="gray.600">
                                  {booking.userEmail}
                                </Text>
                                <Text fontSize="xs" color="gray.500" mt={1}>
                                  Booked on{" "}
                                  {new Date(
                                    booking.bookedAt
                                  ).toLocaleDateString()}{" "}
                                  at{" "}
                                  {new Date(
                                    booking.bookedAt
                                  ).toLocaleTimeString()}
                                </Text>
                              </Box>
                            </Flex>

                            <Box>
                              <SimpleGrid
                                columns={{ base: 2, sm: 4 }}
                                gap={4}
                                minW={{ md: "400px" }}
                              >
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Tickets
                                  </Text>
                                  <Text
                                    fontWeight="bold"
                                    color="navy.700"
                                    fontSize="lg"
                                  >
                                    {booking.ticketCount}
                                  </Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Payment
                                  </Text>
                                  <Text
                                    fontWeight="bold"
                                    color="green.600"
                                    fontSize="sm"
                                    textTransform="uppercase"
                                  >
                                    {booking.paymentMethod || "Cash"}
                                  </Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Amount
                                  </Text>
                                  <Text
                                    fontWeight="bold"
                                    color="navy.700"
                                    fontSize="lg"
                                  >
                                    ${booking.totalAmount}
                                  </Text>
                                </Box>
                                <Box textAlign="center">
                                  <Text fontSize="xs" color="gray.600" mb={1}>
                                    Status
                                  </Text>
                                  <Box
                                    as="span"
                                    px={2}
                                    py={1}
                                    bg="green.100"
                                    color="green.700"
                                    rounded="full"
                                    fontSize="xs"
                                    fontWeight="bold"
                                  >
                                    {booking.status || "Confirmed"}
                                  </Box>
                                </Box>
                              </SimpleGrid>
                              <HStack gap={2} mt={3} justify="flex-end">
                                <Button
                                  size="sm"
                                  bg="blue.500"
                                  color="white"
                                  _hover={{ bg: "blue.600" }}
                                  onClick={() => openEditAttendeeModal(booking)}
                                >
                                  Edit
                                </Button>
                                <Button
                                  size="sm"
                                  bg="red.500"
                                  color="white"
                                  _hover={{ bg: "red.600" }}
                                  onClick={() => deleteAttendee(booking)}
                                >
                                  Delete
                                </Button>
                              </HStack>
                            </Box>
                          </Flex>
                        </Box>
                      )
                    )}
                  </Stack>
                )}
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

      {/* Announcement Creation/Edit Modal */}
      <Dialog.Root
        open={isAnnouncementModalOpen}
        onOpenChange={(e) => setIsAnnouncementModalOpen(e.open)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingAnnouncement
                  ? "Edit Announcement"
                  : "Create New Announcement"}
              </Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              <Stack gap={4}>
                <Box>
                  <Text mb={2} fontWeight="medium">
                    Title *
                  </Text>
                  <Input
                    placeholder="Enter announcement title"
                    value={announcementForm.title}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        title: e.target.value,
                      })
                    }
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Content *
                  </Text>
                  <Textarea
                    placeholder="Enter announcement content"
                    value={announcementForm.content}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        content: e.target.value,
                      })
                    }
                    rows={5}
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Priority *
                  </Text>
                  <HStack gap={2}>
                    {["Low", "Normal", "Medium", "High"].map((priority) => (
                      <Button
                        key={priority}
                        size="sm"
                        onClick={() =>
                          setAnnouncementForm({
                            ...announcementForm,
                            priority,
                          })
                        }
                        bg={
                          announcementForm.priority === priority
                            ? "navy.600"
                            : "white"
                        }
                        color={
                          announcementForm.priority === priority
                            ? "white"
                            : "gray.700"
                        }
                        borderWidth="1px"
                        borderColor="gray.300"
                        _hover={{
                          bg:
                            announcementForm.priority === priority
                              ? "navy.700"
                              : "gray.100",
                        }}
                      >
                        {priority}
                      </Button>
                    ))}
                  </HStack>
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Date *
                  </Text>
                  <Input
                    type="date"
                    value={announcementForm.date}
                    onChange={(e) =>
                      setAnnouncementForm({
                        ...announcementForm,
                        date: e.target.value,
                      })
                    }
                  />
                </Box>

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
                    setIsAnnouncementModalOpen(false);
                    setEditingAnnouncement(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={handleCreateAnnouncement}
                  loading={loading}
                >
                  {editingAnnouncement
                    ? "Update Announcement"
                    : "Create Announcement"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Clubhouse Creation/Edit Modal */}
      <Dialog.Root
        open={isClubhouseModalOpen}
        onOpenChange={(e) => setIsClubhouseModalOpen(e.open)}
        size="lg"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>
                {editingClubhouse
                  ? "Edit Clubhouse Slot"
                  : "Add Clubhouse Time Slot"}
              </Dialog.Title>
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
                    onChange={(e) =>
                      setClubhouseForm({
                        ...clubhouseForm,
                        date: e.target.value,
                      })
                    }
                  />
                </Box>

                <SimpleGrid columns={2} gap={4}>
                  <Box>
                    <Text mb={2} fontWeight="medium">
                      Start Time *
                    </Text>
                    <Input
                      type="time"
                      value={clubhouseForm.startTime}
                      onChange={(e) =>
                        setClubhouseForm({
                          ...clubhouseForm,
                          startTime: e.target.value,
                        })
                      }
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">
                      End Time *
                    </Text>
                    <Input
                      type="time"
                      value={clubhouseForm.endTime}
                      onChange={(e) =>
                        setClubhouseForm({
                          ...clubhouseForm,
                          endTime: e.target.value,
                        })
                      }
                    />
                  </Box>
                </SimpleGrid>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Purpose
                  </Text>
                  <Input
                    placeholder="e.g., General Use, Party, Meeting"
                    value={clubhouseForm.purpose}
                    onChange={(e) =>
                      setClubhouseForm({
                        ...clubhouseForm,
                        purpose: e.target.value,
                      })
                    }
                  />
                </Box>

                <Box>
                  <Text mb={2} fontWeight="medium">
                    Deposit Amount ($) *
                  </Text>
                  <Input
                    type="number"
                    min="0"
                    step="25"
                    value={clubhouseForm.deposit}
                    onChange={(e) =>
                      setClubhouseForm({
                        ...clubhouseForm,
                        deposit: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                </Box>

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
                    setIsClubhouseModalOpen(false);
                    setEditingClubhouse(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={handleCreateClubhouse}
                  loading={loading}
                >
                  {editingClubhouse ? "Update Slot" : "Create Slot"}
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      {/* Edit Attendee Modal */}
      <Dialog.Root
        open={isEditAttendeeModalOpen}
        onOpenChange={(e) => setIsEditAttendeeModalOpen(e.open)}
        size="md"
      >
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit Booking</Dialog.Title>
              <Dialog.CloseTrigger />
            </Dialog.Header>
            <Dialog.Body>
              {editingAttendee && (
                <Stack gap={4}>
                  <Box
                    p={4}
                    bg="gray.50"
                    rounded="md"
                    borderWidth="1px"
                    borderColor="gray.200"
                  >
                    <Text fontWeight="bold" color="navy.700" mb={1}>
                      {editingAttendee.userName}
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {editingAttendee.userEmail}
                    </Text>
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">
                      Ticket Count *
                    </Text>
                    <Input
                      type="number"
                      min="1"
                      value={attendeeForm.ticketCount}
                      onChange={(e) =>
                        setAttendeeForm({
                          ...attendeeForm,
                          ticketCount: parseInt(e.target.value) || 1,
                        })
                      }
                    />
                  </Box>

                  <Box>
                    <Text mb={2} fontWeight="medium">
                      Payment Method *
                    </Text>
                    <HStack gap={2}>
                      <Button
                        flex="1"
                        variant={
                          attendeeForm.paymentMethod === "cash"
                            ? "solid"
                            : "outline"
                        }
                        bg={
                          attendeeForm.paymentMethod === "cash"
                            ? "navy.600"
                            : "white"
                        }
                        color={
                          attendeeForm.paymentMethod === "cash"
                            ? "white"
                            : "navy.600"
                        }
                        borderColor="navy.600"
                        _hover={{
                          bg:
                            attendeeForm.paymentMethod === "cash"
                              ? "navy.700"
                              : "gray.50",
                        }}
                        onClick={() =>
                          setAttendeeForm({
                            ...attendeeForm,
                            paymentMethod: "cash",
                          })
                        }
                      >
                        Cash
                      </Button>
                      <Button
                        flex="1"
                        variant={
                          attendeeForm.paymentMethod === "zelle"
                            ? "solid"
                            : "outline"
                        }
                        bg={
                          attendeeForm.paymentMethod === "zelle"
                            ? "navy.600"
                            : "white"
                        }
                        color={
                          attendeeForm.paymentMethod === "zelle"
                            ? "white"
                            : "navy.600"
                        }
                        borderColor="navy.600"
                        _hover={{
                          bg:
                            attendeeForm.paymentMethod === "zelle"
                              ? "navy.700"
                              : "gray.50",
                        }}
                        onClick={() =>
                          setAttendeeForm({
                            ...attendeeForm,
                            paymentMethod: "zelle",
                          })
                        }
                      >
                        Zelle
                      </Button>
                    </HStack>
                  </Box>

                  {selectedEventForAttendees &&
                    !selectedEventForAttendees.isFree && (
                      <Box
                        p={3}
                        bg="blue.50"
                        rounded="md"
                        borderWidth="1px"
                        borderColor="blue.200"
                      >
                        <Text fontSize="sm" color="gray.700">
                          New Total Amount:
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" color="navy.700">
                          $
                          {selectedEventForAttendees.price *
                            attendeeForm.ticketCount}
                        </Text>
                      </Box>
                    )}
                </Stack>
              )}
            </Dialog.Body>
            <Dialog.Footer>
              <HStack gap={3}>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsEditAttendeeModalOpen(false);
                    setEditingAttendee(null);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  bg="navy.600"
                  color="white"
                  _hover={{ bg: "navy.700" }}
                  onClick={handleSaveAttendee}
                  loading={loading}
                >
                  Save Changes
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
      <Toaster toaster={toaster}>
        {(toast) => (
          <Box
            bg="white"
            p={4}
            rounded="md"
            shadow="lg"
            borderWidth="1px"
            borderColor="gray.200"
          >
            <Text fontWeight="bold">{toast.title}</Text>
            {toast.description && (
              <Text fontSize="sm" color="gray.600">
                {toast.description}
              </Text>
            )}
          </Box>
        )}
      </Toaster>
      <DashboardContent />
    </ProtectedRoute>
  );
}
