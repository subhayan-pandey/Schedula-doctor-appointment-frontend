import type {
  ChatIntent,
  IntentMatch,
} from "@/types/chatbot";

const INTENT_RULES: Array<{
  intent: ChatIntent;
  patterns: RegExp[];
}> = [
  {
    intent: "logout",
    patterns: [
      /\blog ?out\b/,
      /\bsign ?out\b/,
      /\bleave.*account\b/,
      /\bexit.*account\b/,
    ],
  },
  {
    intent: "signup",
    patterns: [
      /\bsign ?up\b/,
      /\bcreate.*account\b/,
      /\bmake.*account\b/,
      /\bnew.*account\b/,
      /\bregister.*account\b/,
    ],
  },
  {
    intent: "doctor_registration",
    patterns: [
      /\bdoctor registration\b/,
      /\bregister.*doctor\b/,
      /\bdoctor sign ?up\b/,
      /\bcreate.*doctor.*account\b/,
      /\bbecome.*doctor\b/,
    ],
  },
  {
    intent: "login",
    patterns: [
      /\blog ?in\b/,
      /\bsign ?in\b/,
      /\bdoctor login\b/,
      /\bpatient login\b/,
      /\baccess.*account\b/,
    ],
  },
  {
    intent: "find_doctor",
    patterns: [
      /\bfind.*doctor\b/,
      /\bsearch.*doctor\b/,
      /\bbrowse.*doctor\b/,
      /\bcheck.*doctor\b/,
      /\bsee.*doctor\b/,
      /\bview.*doctor\b/,
      /\bshow.*doctor\b/,
      /\blook.*doctor\b/,
      /\bavailable.*doctor\b/,
      /\bdoctor.*list\b/,
      /\blist.*doctor\b/,
    ],
  },
  {
    intent: "doctor_details",
    patterns: [
      /\bdoctor.*detail\b/,
      /\bdetails.*doctor\b/,
      /\babout.*doctor\b/,
      /\bdoctor.*information\b/,
      /\bdoctor.*specialty\b/,
      /\bdoctor.*location\b/,
    ],
  },
  {
    intent: "book_appointment",
    patterns: [
      /\bbook.*appointment\b/,
      /\bmake.*appointment\b/,
      /\bschedule.*appointment\b/,
      /\bappointment.*book\b/,
      /\bbook.*doctor\b/,
      /\bconsult.*doctor\b/,
    ],
  },
  {
    intent: "appointment_slots",
    patterns: [
      /\bappointment.*slot\b/,
      /\bavailable.*slot\b/,
      /\btime.*slot\b/,
      /\bbooking.*slot\b/,
      /\bavailable.*time\b/,
      /\bslot.*work\b/,
    ],
  },
  {
    intent: "reschedule_appointment",
    patterns: [
      /\breschedule\b/,
      /\bchange.*appointment\b/,
      /\bchange.*booking\b/,
      /\bchange.*time\b/,
      /\bchange.*date\b/,
      /\bmove.*appointment\b/,
      /\bmove.*booking\b/,
      /\bdifferent.*slot\b/,
      /\banother.*slot\b/,
    ],
  },
  {
    intent: "cancel_appointment",
    patterns: [
      /\bcancel.*appointment\b/,
      /\bcancel.*booking\b/,
      /\bremove.*appointment\b/,
      /\bdelete.*appointment\b/,
    ],
  },
  {
    intent: "view_appointments",
    patterns: [
      /\bmy appointments?\b/,
      /\bmy bookings?\b/,
      /\bview.*appointments?\b/,
      /\bcheck.*appointments?\b/,
      /\bsee.*appointments?\b/,
      /\bshow.*appointments?\b/,
      /\bwhere.*appointments?\b/,
      /\bupcoming appointments?\b/,
      /\bpast appointments?\b/,
      /\bappointment history\b/,
    ],
  },
  {
    intent: "appointment_status",
    patterns: [
      /\bappointment status\b/,
      /\bbooking status\b/,
      /\bstatus.*appointment\b/,
      /\bstatus.*booking\b/,
      /\bwhat does.*pending\b/,
      /\bwhat does.*confirmed\b/,
      /\bwhat does.*upcoming\b/,
      /\bwhat does.*completed\b/,
      /\bwhat does.*cancelled\b/,
      /\bwhat does.*missed\b/,
      /\bpending.*mean\b/,
      /\bconfirmed.*mean\b/,
      /\bupcoming.*mean\b/,
      /\bcompleted.*mean\b/,
      /\bcancelled.*mean\b/,
      /\bmissed.*mean\b/,
    ],
  },
  {
    intent: "completed_appointment",
    patterns: [
      /\bcompleted appointment\b/,
      /\bcompleted booking\b/,
      /\bappointment.*completed\b/,
      /\bafter.*appointment\b/,
      /\bafter.*consultation\b/,
    ],
  },
  {
    intent: "missed_appointment",
    patterns: [
      /\bmissed appointment\b/,
      /\bmissed booking\b/,
      /\bmiss.*appointment\b/,
      /\bdid not attend\b/,
      /\bdidnt attend\b/,
    ],
  },
  {
    intent: "prescription",
    patterns: [
      /\bprescription\b/,
      /\bprescriptions\b/,
      /\bmedicine\b/,
      /\bmedication\b/,
      /\bdownload.*prescription\b/,
      /\bprescription.*download\b/,
      /\bprescription.*pdf\b/,
    ],
  },
  {
    intent: "review_doctor",
    patterns: [
      /\breview.*doctor\b/,
      /\brate.*doctor\b/,
      /\bleave.*review\b/,
      /\bgive.*review\b/,
      /\bfeedback.*doctor\b/,
    ],
  },
  {
    intent: "rebook_appointment",
    patterns: [
      /\brebook\b/,
      /\bbook.*again\b/,
      /\bappointment.*again\b/,
      /\bsame doctor.*again\b/,
      /\bbook.*same doctor\b/,
    ],
  },
  {
    intent: "patient_profile",
    patterns: [
      /\bmy profile\b/,
      /\bpatient profile\b/,
      /\bupdate.*profile\b/,
      /\bedit.*profile\b/,
      /\bchange.*profile\b/,
      /\bprofile.*information\b/,
      /\bpersonal information\b/,
      /\binsurance\b/,
      /\bemergency contact\b/,
    ],
  },
  {
    intent: "notifications",
    patterns: [
      /\bnotification\b/,
      /\bnotifications\b/,
      /\bnotification bell\b/,
      /\balerts?\b/,
    ],
  },
  {
    intent: "doctor_dashboard",
    patterns: [
      /\bdoctor dashboard\b/,
      /\bdoctor home\b/,
      /\bdoctor overview\b/,
      /\bdashboard\b/,
    ],
  },
  {
    intent: "doctor_appointments",
    patterns: [
      /\bdoctor appointments\b/,
      /\bmanage.*appointments\b/,
      /\bpatient appointments\b/,
      /\bdoctor.*booking\b/,
      /\bappointment management\b/,
    ],
  },
  {
    intent: "doctor_calendar",
    patterns: [
      /\bdoctor calendar\b/,
      /\bcalendar.*doctor\b/,
      /\bcalendar.*work\b/,
      /\bhow.*calendar.*work\b/,
      /\bday view\b/,
      /\bweek view\b/,
      /\bmonth view\b/,
      /\bappointment calendar\b/,
      /\bview.*calendar\b/,
    ],
  },
  {
    intent: "doctor_availability",
    patterns: [
      /\bavailability\b/,
      /\bmanage.*availability\b/,
      /\bdoctor availability\b/,
      /\bmanage slots?\b/,
      /\bcreate slots?\b/,
      /\bset.*availability\b/,
      /\bwhen.*available\b/,
    ],
  },
  {
    intent: "doctor_profile",
    patterns: [
      /\bdoctor profile\b/,
      /\bupdate.*doctor.*profile\b/,
      /\bedit.*doctor.*profile\b/,
      /\bprofessional profile\b/,
    ],
  },
  {
    intent: "doctor_prescriptions",
    patterns: [
      /\bcreate.*prescription\b/,
      /\bedit.*prescription\b/,
      /\bmanage.*prescription\b/,
      /\bdoctor.*prescription\b/,
      /\bwrite.*prescription\b/,
      /\bprescribe\b/,
    ],
  },
  {
    intent: "how_schedula_works",
    patterns: [
      /\bhow.*schedula.*work\b/,
      /\bhow.*application.*work\b/,
      /\bhow.*app.*work\b/,
      /\bhow does this work\b/,
      /\bwhat.*schedula\b/,
      /\bwhat can.*schedula\b/,
      /\bfeatures.*schedula\b/,
      /\bwhat.*app.*do\b/,
    ],
  },
];

const ACTION_PATTERNS = [
  /\bbook\b/,
  /\bcancel\b/,
  /\breschedule\b/,
  /\bchange\b/,
  /\bmove\b/,
  /\bcreate\b/,
  /\bupdate\b/,
  /\bedit\b/,
  /\bdelete\b/,
  /\bremove\b/,
  /\bwrite\b/,
  /\bsubmit\b/,
  /\bdownload\b/,
];

const SCHEDULA_CONTEXT_WORDS = [
  "schedula",
  "doctor",
  "appointment",
  "booking",
  "book",
  "slot",
  "prescription",
  "medicine",
  "profile",
  "calendar",
  "availability",
  "review",
  "patient",
  "consultation",
  "login",
  "logout",
  "account",
  "dashboard",
  "notification",
];

function normalizeMessage(
  message: string,
) {
  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isActionRequest(
  message: string,
) {
  return ACTION_PATTERNS.some(
    (pattern) => pattern.test(message),
  );
}

function hasSchedulaContext(
  message: string,
) {
  return SCHEDULA_CONTEXT_WORDS.some(
    (word) => message.includes(word),
  );
}

export function detectIntent(
  message: string,
): IntentMatch {
  const normalized =
    normalizeMessage(message);

  if (!normalized) {
    return {
      intent: "unknown",
      isActionRequest: false,
    };
  }

  for (const rule of INTENT_RULES) {
    const matches =
      rule.patterns.some((pattern) =>
        pattern.test(normalized),
      );

    if (matches) {
      return {
        intent: rule.intent,
        isActionRequest:
          isActionRequest(normalized),
      };
    }
  }

  if (!hasSchedulaContext(normalized)) {
    return {
      intent: "out_of_scope",
      isActionRequest: false,
    };
  }

  return {
    intent: "unknown",
    isActionRequest:
      isActionRequest(normalized),
  };
}