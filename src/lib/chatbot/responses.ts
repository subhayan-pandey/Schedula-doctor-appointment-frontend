import type {
  ChatIntent,
  ChatResponse,
  ChatSuggestion,
  ChatUserRole,
} from "@/types/chatbot";

const RESPONSES: Record<
  Exclude<
    ChatIntent,
    "out_of_scope" | "unknown"
  >,
  ChatResponse
> = {
  book_appointment: {
    content:
      "To book an appointment, browse the available doctors, open a doctor's profile, choose an available date and time slot, and confirm your booking. I can't book it for you, but I can guide you to the right place.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  reschedule_appointment: {
    content:
      "You can reschedule an eligible upcoming appointment without cancelling it first. Go to My Appointments, open the appointment, and choose a new available slot. The appointment is updated when the new slot is confirmed.",
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

  appointment_status: {
    content:
      "Schedula uses appointment statuses to show where a visit is in its lifecycle. Appointments can be pending, confirmed, upcoming, completed, cancelled, or missed. The available actions depend on the current status.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  view_appointments: {
    content:
      "You can check upcoming and past appointments from My Appointments. This is also where you can follow the appointment status and access available appointment actions.",
    action: {
      label: "My appointments",
      href: "/appointments",
    },
  },

  completed_appointment: {
    content:
      "Completed appointments can provide follow-up options such as viewing a prescription when one is available, downloading the prescription PDF, reviewing the doctor, or rebooking with the same doctor.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  prescription: {
    content:
      "Prescriptions are connected to completed appointments. When a doctor has created one, you can view it from the completed appointment and download a PDF copy when that option is available.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  review_doctor: {
    content:
      "I can't submit a review for you. After an appointment is completed, open that appointment and use the Review Doctor option to leave your own feedback.",
    action: {
      label: "Completed appointments",
      href: "/appointments",
    },
  },

  rebook_appointment: {
    content:
      "You can rebook from a completed appointment when the rebooking option is available. Schedula will guide you back to choosing an available appointment slot with the doctor.",
    action: {
      label: "View appointments",
      href: "/appointments",
    },
  },

  patient_profile: {
    content:
      "Your profile is where you can manage personal details and other profile information available in Schedula. I can't change the information for you, but you can update it directly from the profile page.",
    action: {
      label: "My profile",
      href: "/profile",
    },
  },

  find_doctor: {
    content:
      "You can browse doctors by specialty, availability, and location. Open a doctor's profile to see more details and available appointment slots.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },

  doctor_dashboard: {
    content:
      "The Doctor Dashboard provides an overview of upcoming appointments and quick access to the main doctor tools.",
    action: {
      label: "Doctor dashboard",
      href: "/doctor/dashboard",
    },
  },

  doctor_appointments: {
    content:
      "Doctors can manage appointments from the appointments page. It provides appointment details, status-based actions, search, and filtering. I can't change an appointment for you.",
    action: {
      label: "Doctor appointments",
      href: "/doctor/appointments",
    },
  },

  doctor_calendar: {
    content:
      "The doctor calendar supports day, week, and month views for appointments and availability. Appointment changes are subject to slot availability and status restrictions.",
    action: {
      label: "Doctor calendar",
      href: "/doctor/calendar",
    },
  },

  doctor_availability: {
    content:
      "Doctors can manage appointment availability by creating and managing date and time slots. Only available and unbooked slots can be selected by patients.",
    action: {
      label: "Manage availability",
      href: "/doctor/slot",
    },
  },

  doctor_profile: {
    content:
      "Doctors can view and update their professional details from the doctor profile page. Availability is managed separately through the availability tools.",
    action: {
      label: "Doctor profile",
      href: "/doctor/profile",
    },
  },

  doctor_prescriptions: {
    content:
      "Doctors can view, create, and edit prescriptions. A prescription can include a diagnosis, medicines, dosage, duration, and instructions, and it becomes available through the related completed appointment.",
    action: {
      label: "Manage prescriptions",
      href: "/doctor/prescriptions",
    },
  },

  doctor_registration: {
    content:
      "If you're new to Schedula as a doctor, register first. After registration, you can log in and access the doctor dashboard, profile, availability, appointments, calendar, and prescription tools.",
    action: {
      label: "Register as a doctor",
      href: "/doctor/register",
    },
  },

  login: {
    content:
      "Existing patients can log in to access their appointments and profile. New patients can create an account first. Doctors have separate login and registration pages.",
    action: {
      label: "Log in",
      href: "/login",
    },
  },

  how_schedula_works: {
    content:
      "Schedula helps patients find doctors, view available slots, and manage appointments. Doctors can manage their profile, availability, appointments, calendar, and prescriptions.",
    action: {
      label: "Find doctors",
      href: "/doctors",
    },
  },
};

export const OUT_OF_SCOPE_RESPONSE: ChatResponse = {
  content:
    "I can only help with using Schedula. You can ask me about doctors, appointments, booking, prescriptions, profiles, availability, and other features in this application.",
};

export const UNKNOWN_RESPONSE: ChatResponse = {
  content:
    "I'm not able to answer that reliably. I can help you understand and navigate Schedula, including appointments, doctors, prescriptions, profiles, availability, and doctor tools.",
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
        "The Doctor Dashboard is available after signing in with a doctor account. If you're new to Schedula as a doctor, register first.",
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
  const patientOnlyIntents: ChatIntent[] = [
    "book_appointment",
    "reschedule_appointment",
    "cancel_appointment",
    "view_appointments",
    "completed_appointment",
    "prescription",
    "review_doctor",
    "rebook_appointment",
    "patient_profile",
  ];

  if (!patientOnlyIntents.includes(intent)) {
    return response;
  }

  return {
    content: `${response.content} To use account-specific appointment and profile features, log in first. If you're new to Schedula, create an account.`,
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
  if (pathname === "/doctors") {
    return [
      {
        label: "Find the right doctor",
        message:
          "How do I find the right doctor?",
      },
      {
        label: "Check availability",
        message:
          "How do appointment slots work?",
      },
      {
        label: "How booking works",
        message:
          "How does booking an appointment work?",
      },
    ];
  }

  if (pathname === "/appointments") {
    return [
      {
        label: "Reschedule",
        message:
          "How do I reschedule my appointment?",
      },
      {
        label: "Cancel an appointment",
        message:
          "How do I cancel an appointment?",
      },
      {
        label: "Appointment status",
        message:
          "What do appointment statuses mean?",
      },
    ];
  }

  if (pathname === "/profile") {
    return [
      {
        label: "Update my profile",
        message:
          "How do I update my profile?",
      },
      {
        label: "Profile information",
        message:
          "What information can I manage in my profile?",
      },
      {
        label: "My prescriptions",
        message:
          "How do prescriptions work?",
      },
    ];
  }

  if (pathname === "/doctor/calendar") {
    return [
      {
        label: "Using the calendar",
        message:
          "How does the doctor calendar work?",
      },
      {
        label: "Manage availability",
        message:
          "How do I manage appointment availability?",
      },
      {
        label: "Appointment statuses",
        message:
          "What appointment statuses can doctors manage?",
      },
    ];
  }

  if (
    pathname === "/doctor/dashboard" ||
    pathname === "/doctor/appointments"
  ) {
    return [
      {
        label: "Manage appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
      {
        label: "Calendar",
        message:
          "How does the doctor calendar work?",
      },
      {
        label: "Prescriptions",
        message:
          "How does prescription management work?",
      },
    ];
  }

  if (
    pathname === "/doctor/profile" ||
    pathname === "/doctor/slot"
  ) {
    return [
      {
        label: "Update profile",
        message:
          "How do I update my doctor profile?",
      },
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
    ];
  }

  if (
    pathname === "/doctor/prescriptions"
  ) {
    return [
      {
        label: "Create prescriptions",
        message:
          "How does prescription management work?",
      },
      {
        label: "Prescription details",
        message:
          "What information can a prescription include?",
      },
      {
        label: "Patient appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
    ];
  }

  if (role === "doctor") {
    return [
      {
        label: "Doctor appointments",
        message:
          "How do I manage appointments as a doctor?",
      },
      {
        label: "Manage availability",
        message:
          "How do I manage appointment availability?",
      },
      {
        label: "Prescriptions",
        message:
          "How does prescription management work?",
      },
    ];
  }

  return [
    {
      label: "Find a doctor",
      message:
        "How do I find a doctor?",
    },
    {
      label: "How appointments work",
      message:
        "How does booking an appointment work?",
    },
    {
      label: "Using Schedula",
      message:
        "How does Schedula work?",
    },
  ];
}