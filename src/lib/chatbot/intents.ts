import type {
  ChatIntent,
  IntentMatch,
} from "@/types/chatbot";

const ACTION_PATTERNS = [
  /\bbook\b/,
  /\bcancel\b/,
  /\breschedule\b/,
  /\bchange\b/,
  /\bmove\b/,
  /\bcreate\b/,
  /\bwrite\b/,
  /\bsubmit\b/,
  /\bleave\b/,
  /\breview\b/,
  /\bupdate\b/,
  /\bedit\b/,
  /\bmanage\b/,
  /\bmark\b/,
];

const INTENT_RULES: Array<{
  intent: ChatIntent;
  patterns: RegExp[];
}> = [
  {
    intent: "reschedule_appointment",
    patterns: [
      /\breschedule\b/,
      /\bchange.*appointment\b/,
      /\bchange.*time\b/,
      /\bchange.*date\b/,
      /\bmove.*appointment\b/,
      /\banother.*slot\b/,
    ],
  },
  {
    intent: "cancel_appointment",
    patterns: [
      /\bcancel.*appointment\b/,
      /\bcancel\b/,
      /\bdecline.*appointment\b/,
    ],
  },
  {
    intent: "book_appointment",
    patterns: [
      /\bbook.*appointment\b/,
      /\bmake.*appointment\b/,
      /\bschedule.*appointment\b/,
      /\bappointment.*book\b/,
    ],
  },
  {
    intent: "find_doctor",
    patterns: [
      /\bfind.*doctor\b/,
      /\bsearch.*doctor\b/,
      /\bbrowse.*doctor\b/,
      /\bchoose.*doctor\b/,
      /\blook.*doctor\b/,
    ],
  },
  {
    intent: "view_appointments",
    patterns: [
      /\bmy appointments?\b/,
      /\bview.*appointments?\b/,
      /\bcheck.*appointments?\b/,
      /\bupcoming appointments?\b/,
      /\bpast appointments?\b/,
    ],
  },
  {
    intent: "appointment_status",
    patterns: [
      /\bappointment status\b/,
      /\bwhat does.*pending\b/,
      /\bwhat does.*confirmed\b/,
      /\bwhat does.*upcoming\b/,
      /\bwhat does.*completed\b/,
      /\bwhat does.*missed\b/,
      /\bappointment.*status\b/,
    ],
  },
  {
    intent: "completed_appointment",
    patterns: [
      /\bcompleted appointment\b/,
      /\bafter.*appointment\b/,
      /\bappointment.*completed\b/,
    ],
  },
  {
    intent: "prescription",
    patterns: [
      /\bprescription\b/,
      /\bmedicine\b/,
      /\bmedication\b/,
      /\bdownload.*pdf\b/,
    ],
  },
  {
    intent: "review_doctor",
    patterns: [
      /\breview.*doctor\b/,
      /\brate.*doctor\b/,
      /\bleave.*review\b/,
      /\bgive.*review\b/,
    ],
  },
  {
    intent: "rebook_appointment",
    patterns: [
      /\brebook\b/,
      /\bbook.*again\b/,
      /\bsame doctor.*again\b/,
    ],
  },
  {
    intent: "patient_profile",
    patterns: [
      /\bmy profile\b/,
      /\bprofile\b/,
      /\bmedical information\b/,
      /\ballerg(?:y|ies)\b/,
      /\binsurance\b/,
      /\bemergency contact\b/,
    ],
  },
  {
    intent: "doctor_dashboard",
    patterns: [
      /\bdoctor dashboard\b/,
      /\bdashboard\b/,
    ],
  },
  {
    intent: "doctor_appointments",
    patterns: [
      /\bdoctor appointments\b/,
      /\bmanage.*appointments\b/,
      /\bpatient appointments\b/,
    ],
  },
  {
    intent: "doctor_calendar",
    patterns: [
      /\bcalendar\b/,
      /\bday view\b/,
      /\bweek view\b/,
      /\bmonth view\b/,
    ],
  },
  {
    intent: "doctor_availability",
    patterns: [
      /\bavailability\b/,
      /\bavailable slots?\b/,
      /\bmanage slots?\b/,
      /\bcreate slots?\b/,
      /\bappointment slots?\b/,
      /\brecurring availability\b/,
    ],
  },
  {
    intent: "doctor_profile",
    patterns: [
      /\bdoctor profile\b/,
      /\bupdate.*doctor.*profile\b/,
      /\bedit.*doctor.*profile\b/,
    ],
  },
  {
    intent: "doctor_prescriptions",
    patterns: [
      /\bcreate.*prescription\b/,
      /\bedit.*prescription\b/,
      /\bmanage.*prescription\b/,
      /\bprescription management\b/,
    ],
  },
  {
    intent: "doctor_registration",
    patterns: [
      /\bjoin.*doctor\b/,
      /\bregister.*doctor\b/,
      /\bdoctor registration\b/,
      /\bdoctor account\b/,
    ],
  },
  {
    intent: "login",
    patterns: [
      /\blog in\b/,
      /\blogin\b/,
      /\bsign in\b/,
      /\bsignin\b/,
    ],
  },
  {
    intent: "how_schedula_works",
    patterns: [
      /\bhow.*schedula.*work\b/,
      /\bhow.*application.*work\b/,
      /\bhow.*app.*work\b/,
      /\bhow does this work\b/,
      /\bhow.*booking.*work\b/,
      /\busing schedula\b/,
    ],
  },
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
  "medication",
  "profile",
  "calendar",
  "availability",
  "review",
  "rebook",
  "patient",
  "hospital",
  "healthcare",
  "consultation",
  "visit",
  "login",
  "account",
  "dashboard",
];

function normalizeMessage(
  message: string,
): string {
  return message
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isActionRequest(
  message: string,
): boolean {
  return ACTION_PATTERNS.some(
    (pattern) => pattern.test(message),
  );
}

function hasSchedulaContext(
  message: string,
): boolean {
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
    if (
      rule.patterns.some(
        (pattern) =>
          pattern.test(normalized),
      )
    ) {
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
    isActionRequest: false,
  };
}