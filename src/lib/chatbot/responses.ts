import type {
  ChatIntent,
  ChatResponse,
  ChatSuggestion,
  ChatUserRole,
} from "@/types/chatbot";

type SupportedIntent = Exclude<
  ChatIntent,
  "out_of_scope" | "unknown"
>;

const RESPONSES: Record<
  SupportedIntent,
  ChatResponse
> = {
  login: {
    content:
      "If you already have a patient account, use Log in in the navigation bar. Doctors use the separate Doctor Login page for their doctor account.",
    action: {
      label: "Log in",
      href: "/login",
    },
  },

  logout: {
    content:
      "Use the Log out button in the top-right area of the navigation bar. Logging out clears your current session and redirects you to the Schedula home page.",
    action: {
      label: "Go to home",
      href: "/",
    },
  },

  signup: {
    content:
      "If you're new to Schedula as a patient, use Get started in the navigation bar to create an account.",
    action: {
      label: "Get started",
      href: "/signup",
    },
  },

  doctor_registration: {
    content:
      "If you're joining Schedula as a doctor, register for a doctor account first. After registration, you can use Doctor Login to access the doctor tools.",
    action: {
      label: "Register as a doctor",
      href: "/doctor/register",
    },
  },

  find_doctor: {
    content:
      "You can browse and check doctors from the Find Doctors page. Open a doctor's profile to view their available information and appointment options.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  doctor_details: {
    content:
      "To view a doctor's details, open Find Doctors and select the doctor. Their page contains the information available for that doctor, including professional details and appointment availability.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  book_appointment: {
    content:
      "To book an appointment, open Find Doctors, select a doctor, choose an available date and time slot, and complete the booking flow. I can't book it for you, but I can explain each step.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  appointment_slots: {
    content:
      "Appointment slots are the times made available by doctors. Open a doctor's page to check available slots, then select a suitable date and time during booking.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  reschedule_appointment: {
    content:
      "To reschedule an eligible appointment, open My Appointments and select the appointment you want to change. You can then choose another available date or time slot when the rescheduling option is available.",
    action: {
      label: "My appointments",
      href: "/appointments",
    },
  },

  cancel_appointment: {
    content:
      "I can't cancel an appointment for you, but you can manage an eligible appointment from My Appointments. Open the appointment and use the cancellation option available for its current status.",
    action: {
      label: "My appointments",
      href: "/appointments",
    },
  },

  view_appointments: {
    content:
      "You can check your appointments from My Appointments in the navigation bar after logging in. This is where you can view appointment details and manage the actions available for each appointment.",
    action: {
      label: "My appointments",
      href: "/appointments",
    },
  },

  appointment_status: {
    content:
      "Schedula uses appointment statuses to show the current stage of an appointment. The available statuses are pending, confirmed, upcoming, completed, cancelled, and missed. The actions available depend on the appointment's status.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  completed_appointment: {
    content:
      "After an appointment is completed, open it from My Appointments. Depending on the available features, you can access prescription information, review the doctor, or rebook another appointment.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  missed_appointment: {
    content:
      "A missed appointment means the appointment was not completed as scheduled. You can check its details from My Appointments and book another appointment if needed.",
    action: {
      label: "My appointments",
      href: "/appointments",
    },
  },

  prescription: {
    content:
      "Prescriptions are connected to appointments. When a prescription is available, open the relevant appointment to access its prescription information and download it when a download option is provided.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  review_doctor: {
    content:
      "I can't submit a review for you. After an appointment is completed, open the appointment and use the available Review Doctor option to submit your own feedback.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  rebook_appointment: {
    content:
      "When rebooking is available for an appointment, open the completed appointment and use the rebooking option to start another appointment with that doctor.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  patient_profile: {
    content:
      "You can access My Profile from the navigation bar after logging in. The profile page contains the patient account information that can be viewed or managed in Schedula.",
    action: {
      label: "My profile",
      href: "/profile",
    },
  },

  notifications: {
    content:
      "When you're logged in, the notification bell appears in the navigation bar. Select it to check the notifications currently available for your account.",
  },

  doctor_dashboard: {
    content:
      "The Doctor Dashboard is the main overview page for doctors. It provides access to doctor-side information and quick navigation to appointments, calendar, availability, profile, and other doctor tools.",
    action: {
      label: "Doctor dashboard",
      href: "/doctor/dashboard",
    },
  },

  doctor_appointments: {
    content:
      "Doctors can manage patient appointments from the Doctor Appointments page. The page provides appointment information, status-based details, search and filtering, and the management actions supported by the application.",
    action: {
      label: "Doctor appointments",
      href: "/doctor/appointments",
    },
  },

  doctor_calendar: {
    content:
      "The Doctor Calendar provides a calendar view of appointments and scheduling information. Use the calendar controls to navigate between the available day, week, or month views and inspect appointments on the relevant dates.",
    action: {
      label: "Doctor calendar",
      href: "/doctor/calendar",
    },
  },

  doctor_availability: {
    content:
      "Doctors manage appointment availability from the slot management page. The available slots you create or manage are the times patients can select when booking appointments.",
    action: {
      label: "Manage availability",
      href: "/doctor/slot",
    },
  },

  doctor_profile: {
    content:
      "Doctors can access their professional profile from the Profile link in the doctor navigation. This page contains the doctor information that can be viewed or updated within the application.",
    action: {
      label: "Doctor profile",
      href: "/doctor/profile",
    },
  },

  doctor_prescriptions: {
    content:
      "Doctors manage prescriptions from the Prescriptions page. The prescription workflow allows doctors to work with appointment-related prescription information, including the medical details supported by the application.",
    action: {
      label: "Manage prescriptions",
      href: "/doctor/prescriptions",
    },
  },

  how_schedula_works: {
    content:
      "Schedula has separate patient and doctor workflows. Patients can find doctors, book and manage appointments, access appointment-related information, prescriptions, reviews, and their profile. Doctors can use the dashboard, manage appointments, calendar, availability, profile, and prescriptions.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },
};

const OUT_OF_SCOPE_RESPONSE: ChatResponse = {
  content:
    "Schedula Guide is focused only on this application. I can explain how to use Schedula, including accounts, finding doctors, appointments, booking, prescriptions, profiles, notifications, doctor dashboards, calendars, availability, and doctor tools.",
};

const UNKNOWN_RESPONSE: ChatResponse = {
  content:
    "I can help you navigate Schedula and explain its features. You can ask where to find something, how a feature works, or how to complete a workflow. For example: logging in or out, finding doctors, booking appointments, appointment statuses, prescriptions, profiles, doctor calendars, availability, and doctor tools.",
};

export function getResponseForIntent(
  intent: ChatIntent,
  role: ChatUserRole,
): ChatResponse {
  if (intent === "out_of_scope") {
    return OUT_OF_SCOPE_RESPONSE;
  }

  if (intent === "unknown") {
    return UNKNOWN_RESPONSE;
  }

  if (
    role === "guest" &&
    intent === "doctor_dashboard"
  ) {
    return {
      content:
        "The Doctor Dashboard is available after signing in with a doctor account. If you already have one, use Doctor Login. New doctors need to register first.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  if (
    role === "guest" &&
    intent === "doctor_appointments"
  ) {
    return {
      content:
        "Doctor appointment management is available after signing in with a doctor account. Register as a doctor first if you don't already have a doctor account.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  if (
    role === "guest" &&
    intent === "doctor_calendar"
  ) {
    return {
      content:
        "The Doctor Calendar is available to logged-in doctors. Use Doctor Login if you already have a doctor account or register first if you're new.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  if (
    role === "guest" &&
    intent === "doctor_availability"
  ) {
    return {
      content:
        "Appointment availability and slot management are doctor features. Sign in with a doctor account to access these tools.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  if (
    role === "guest" &&
    intent === "doctor_profile"
  ) {
    return {
      content:
        "The Doctor Profile is available after signing in with a doctor account.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  if (
    role === "guest" &&
    intent === "doctor_prescriptions"
  ) {
    return {
      content:
        "Prescription management is available to logged-in doctors. Use Doctor Login to access doctor tools.",
      action: {
        label: "Doctor login",
        href: "/doctor/login",
      },
    };
  }

  return RESPONSES[intent];
}

export function getGuestAccessResponse(
  response: ChatResponse,
  intent: ChatIntent,
): ChatResponse {
  const accountRequiredIntents: ChatIntent[] =
    [
      "reschedule_appointment",
      "cancel_appointment",
      "view_appointments",
      "completed_appointment",
      "missed_appointment",
      "prescription",
      "review_doctor",
      "rebook_appointment",
      "patient_profile",
      "notifications",
    ];

  if (
    !accountRequiredIntents.includes(
      intent,
    )
  ) {
    return response;
  }

  return {
    content: `${response.content} To access your own appointment or account information, log in first. If you're new to Schedula as a patient, create an account before logging in.`,
    action: {
      label: "Log in",
      href: "/login",
    },
  };
}

export function getInitialSuggestions(
  pathname: string,
  role: ChatUserRole,
): ChatSuggestion[] {
  if (pathname === "/") {
    return [
      {
        label: "How Schedula works",
        message:
          "How does Schedula work?",
      },
      {
        label: "Find doctors",
        message:
          "How can I check doctors?",
      },
      {
        label: "Getting started",
        message:
          "How do I create an account?",
      },
    ];
  }

  if (
    pathname === "/doctors"
  ) {
    return [
      {
        label: "Browse doctors",
        message:
          "How can I check doctors?",
      },
      {
        label: "Doctor details",
        message:
          "How can I see doctor details?",
      },
      {
        label: "Book an appointment",
        message:
          "How do I book an appointment?",
      },
    ];
  }

  if (
    pathname === "/appointments"
  ) {
    return [
      {
        label: "My appointments",
        message:
          "How can I check my appointments?",
      },
      {
        label: "Reschedule",
        message:
          "How do I reschedule my appointment?",
      },
      {
        label: "Appointment status",
        message:
          "What do appointment statuses mean?",
      },
    ];
  }

  if (
    pathname === "/profile"
  ) {
    return [
      {
        label: "My profile",
        message:
          "How do I update my profile?",
      },
      {
        label: "My appointments",
        message:
          "How can I check my appointments?",
      },
      {
        label: "Prescriptions",
        message:
          "How do prescriptions work?",
      },
    ];
  }

  if (
    pathname === "/doctor/dashboard"
  ) {
    return [
      {
        label: "Manage appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
      {
        label: "Use the calendar",
        message:
          "How does the doctor calendar work?",
      },
      {
        label: "Manage availability",
        message:
          "How do I manage appointment availability?",
      },
    ];
  }

  if (
    pathname === "/doctor/appointments"
  ) {
    return [
      {
        label: "Appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
      {
        label: "Appointment statuses",
        message:
          "What do appointment statuses mean?",
      },
      {
        label: "Prescriptions",
        message:
          "How does prescription management work?",
      },
    ];
  }

  if (
    pathname === "/doctor/calendar"
  ) {
    return [
      {
        label: "Using the calendar",
        message:
          "How does the doctor calendar work?",
      },
      {
        label: "Calendar views",
        message:
          "How do day, week and month views work?",
      },
      {
        label: "Availability",
        message:
          "How do I manage appointment availability?",
      },
    ];
  }

  if (
    pathname === "/doctor/slot"
  ) {
    return [
      {
        label: "Manage availability",
        message:
          "How do I manage appointment availability?",
      },
      {
        label: "Appointment slots",
        message:
          "How do appointment slots work?",
      },
      {
        label: "Doctor calendar",
        message:
          "How does the doctor calendar work?",
      },
    ];
  }

  if (
    pathname === "/doctor/profile"
  ) {
    return [
      {
        label: "Doctor profile",
        message:
          "How do I update my doctor profile?",
      },
      {
        label: "Availability",
        message:
          "How do I manage appointment availability?",
      },
      {
        label: "Appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
    ];
  }

  if (
    pathname === "/doctor/prescriptions"
  ) {
    return [
      {
        label: "Prescriptions",
        message:
          "How does prescription management work?",
      },
      {
        label: "Prescription details",
        message:
          "What information can a prescription include?",
      },
      {
        label: "Appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
    ];
  }

  if (role === "doctor") {
    return [
      {
        label: "Doctor dashboard",
        message:
          "How does the Doctor Dashboard work?",
      },
      {
        label: "Appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
      {
        label: "Calendar",
        message:
          "How does the doctor calendar work?",
      },
    ];
  }

  return [
    {
      label: "Find doctors",
      message:
        "How can I check doctors?",
    },
    {
      label: "Book appointments",
      message:
        "How do I book an appointment?",
    },
    {
      label: "Using Schedula",
      message:
        "How does Schedula work?",
    },
  ];
}