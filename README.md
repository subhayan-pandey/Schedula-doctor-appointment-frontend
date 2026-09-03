# Schedula

Schedula is a healthcare appointment management web application designed to provide separate and structured workflows for patients and doctors.

The application allows patients to discover doctors, book and manage appointments, access prescriptions, manage their profiles, and receive application-related guidance through the integrated **Schedula Assistant**.

Doctors have access to a dedicated workspace where they can manage appointments, availability, calendars, professional profiles, and prescriptions.

---

# Features

## Patient Features

* Create a patient account and log in.
* Browse and discover doctors.
* View doctor profiles and available information.
* View available appointment dates and time slots.
* Book appointments with doctors.
* View appointments from the **My Appointments** section.
* Access individual appointment details.
* Manage appointments based on their current status.
* Access prescription information.
* Download prescriptions when available.
* Review doctors after eligible appointments.
* Rebook appointments where applicable.
* Manage patient profile information.
* Access notifications.

### Appointment Statuses

Schedula supports the following appointment statuses:

* Pending
* Confirmed
* Upcoming
* Completed
* Cancelled
* Missed

The actions available to users may depend on the current appointment status.

---

## Doctor Features

Doctors have a separate workflow and dedicated set of tools.

Doctors can:

* Register for a doctor account.
* Log in through the dedicated Doctor Login page.
* Access the Doctor Dashboard.
* View and manage patient appointments.
* Access appointment information and statuses.
* Manage appointment availability.
* Create and manage appointment slots.
* Use the Doctor Calendar.
* Navigate through available calendar views.
* Manage professional profile information.
* Create and manage prescriptions.

Doctors can also use patient-side functionality when applicable, including booking appointments with other doctors.

---

# Appointment Workflow

Schedula provides a structured appointment booking process.

### Step 1: Find a Doctor

Navigate to:

```text
Find Doctors
```

Browse the available doctors and select one to view their profile.

### Step 2: Select an Appointment

From the doctor's page:

1. Select an available date.
2. Choose an available time slot.
3. Continue through the booking process.

### Step 3: Appointment Confirmation

After completing the booking process, the application displays appointment confirmation information.

### Step 4: Manage the Appointment

Navigate to:

```text
My Appointments
```

Users can view appointment details and access the actions available for that appointment.

---

# Patient Guide

## Creating an Account

New users can create a patient account using:

```text
Get Started
```

After registration, users can log in and access patient-specific features.

---

## Finding Doctors

Navigate to:

```text
Find Doctors
```

Users can browse doctors and open individual doctor profiles to view available information.

---

## Viewing Appointments

Navigate to:

```text
My Appointments
```

This section allows patients to access their appointments and view appointment-related details.

---

## Managing the Patient Profile

Navigate to:

```text
My Profile
```

The profile page provides access to patient information available within the application.

---

# Doctor Guide

## Step 1: Register as a Doctor

New doctors can create an account through:

```text
Doctor Register
```

---

## Step 2: Doctor Login

Existing doctors can access their account through:

```text
Doctor Login
```

---

## Step 3: Doctor Dashboard

After logging in, doctors can access:

```text
Doctor Dashboard
```

The dashboard acts as the primary entry point for doctor-side features.

---

## Step 4: Manage Appointments

Navigate to:

```text
Doctor Appointments
```

Doctors can access appointment-related information and management features available within the application.

---

## Step 5: Manage Availability

Navigate to:

```text
Manage Availability
```

Doctors can manage appointment slots and availability for patients.

---

## Step 6: Doctor Calendar

Navigate to:

```text
Doctor Calendar
```

The calendar provides a structured view of scheduled appointments and supports the available calendar navigation options.

---

## Step 7: Manage Prescriptions

Navigate to:

```text
Prescriptions
```

Doctors can access and manage appointment-related prescription information.

---

## Step 8: Doctor Profile

Navigate to:

```text
Doctor Profile
```

Doctors can access and manage their professional information available within the application.

---

# Schedula Assistant

Schedula includes an integrated application-specific assistant called **Schedula Guide**.

The assistant is designed specifically to help users understand and navigate the Schedula application.

It is not intended to function as a general-purpose chatbot.

---

## What the Schedula Assistant Can Explain

### Authentication

The assistant can explain:

* How to log in.
* How to log out.
* How to create a patient account.
* How doctors can register.
* How doctors can log in.

---

### Finding Doctors

The assistant can explain:

* How to find doctors.
* How to browse doctors.
* How to view doctor details.
* How to access doctor information.

---

### Appointments

The assistant can explain:

* How to book an appointment.
* How appointment slots work.
* How to check appointments.
* How appointment statuses work.
* How to reschedule an appointment.
* How to cancel an appointment.
* What happens after an appointment is completed.
* What happens when an appointment is missed.
* How rebooking works.

---

### Patient Features

The assistant can explain:

* How to access the patient profile.
* How prescriptions work.
* How to access available prescriptions.
* How doctor reviews work.
* How notifications work.

---

### Doctor Features

The assistant can explain:

* How the Doctor Dashboard works.
* How doctors manage appointments.
* How the Doctor Calendar works.
* How the available calendar views work.
* How doctors manage appointment availability.
* How appointment slots work.
* How doctors manage their profiles.
* How prescription management works.

---

# Assistant Limitations

The Schedula Assistant is focused exclusively on the Schedula application.

It:

* Does not answer general knowledge questions.
* Does not answer questions unrelated to Schedula.
* Cannot book appointments on behalf of users.
* Cannot cancel appointments on behalf of users.
* Cannot reschedule appointments directly.
* Cannot submit doctor reviews.
* Cannot modify user information.
* Cannot perform actions on behalf of users.

Instead, the assistant explains how users can complete actions themselves and provides navigation guidance where appropriate.

For example, if a user asks:

> Cancel my appointment.

The assistant does not cancel the appointment. Instead, it explains where the user can find the appointment and how to access the available cancellation option.

---

# Context-Aware Guidance

The Schedula Assistant provides guidance based on the user's current role.

## Guest Users

Guests can ask about:

* How Schedula works.
* How to create an account.
* How to find doctors.
* How appointment booking works.
* How doctors can register.

When account access is required, the assistant guides the user toward the appropriate login or registration page.

---

## Patient Users

Patients can receive guidance about:

* Finding doctors.
* Booking appointments.
* Managing appointments.
* Appointment statuses.
* Prescriptions.
* Reviews.
* Rebooking.
* Notifications.
* Profile management.

---

## Doctor Users

Doctors can receive guidance about:

* Doctor Dashboard.
* Patient appointments.
* Appointment statuses.
* Doctor Calendar.
* Appointment availability.
* Appointment slots.
* Doctor Profile.
* Prescription management.

Doctors can also receive guidance about patient-side functionality where applicable.

---

# Technology Stack

## Frontend Framework

* Next.js 16
* React 19

## Programming Language

* TypeScript

## Styling

* Tailwind CSS
* PostCSS
* Autoprefixer

## Development Tools

* ESLint
* ESLint Config Next

---

# Project Structure

```text
src/
│
├── app/
│   │
│   ├── api/
│   │   └── appointments/
│   │
│   ├── appointments/
│   │   └── [bookingId]/
│   │
│   ├── doctor/
│   │   ├── appointments/
│   │   ├── calendar/
│   │   ├── dashboard/
│   │   ├── login/
│   │   ├── prescriptions/
│   │   ├── profile/
│   │   ├── register/
│   │   └── slot/
│   │
│   ├── doctors/
│   │   └── [id]/
│   │
│   ├── login/
│   ├── profile/
│   ├── signup/
│   │
│   └── page.tsx
│
├── components/
│   │
│   ├── chatbot/
│   │   ├── Chatbot.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatTrigger.tsx
│   │   └── ChatWindow.tsx
│   │
│   ├── appointments/
│   ├── doctor/
│   ├── doctors/
│   ├── prescriptions/
│   └── ui/
│
├── context/
│   └── ChatContext.tsx
│
├── lib/
│   ├── chatbot/
│   │   ├── intents.ts
│   │   └── responses.ts
│   │
│   ├── appointments-store.ts
│   ├── doctors-store.ts
│   └── storage.ts
│
└── types/
    ├── booking.ts
    ├── chatbot.ts
    └── user.ts
```

---

# Getting Started

## Prerequisites

Make sure the following are installed:

* Node.js
* npm

---

## Installation

### Clone the Repository

```bash
git clone https://github.com/subhayan-pandey/Schedula-doctor-appointment-frontend
```

### Navigate to the Project

```bash
cd Schedula-doctor-appointment-frontend
```

### Install Dependencies

```bash
npm install
```

---

# Running the Application

Start the development server:

```bash
npm run dev
```

Next.js will display a local development URL in the terminal.

Open that URL in your browser to access the application.

---

# Production Build

Create an optimized production build:

```bash
npm run build
```

Run the production version:

```bash
npm run start
```

---

# Available Scripts

## Development Server

```bash
npm run dev
```

Runs the application in development mode.

---

## Production Build

```bash
npm run build
```

Creates an optimized production build of the application.

---

## Production Server

```bash
npm run start
```

Runs the production build.

---

## Linting

```bash
npm run lint
```

Runs ESLint checks on the project.

---

# User Roles

Schedula currently supports three primary user contexts.

## Guest

Guests can:

* Explore the application.
* Browse doctors.
* Learn how Schedula works.
* Use the Schedula Assistant for application guidance.
* Create a patient account.
* Register as a doctor.
* Access the appropriate login pages.

Account-specific information requires authentication.

---

## Patient

Patients can:

* Find doctors.
* Book appointments.
* View appointments.
* Manage eligible appointments.
* Access appointment-related prescriptions.
* Review doctors.
* Rebook appointments when applicable.
* Manage profile information.
* Access notifications.
* Use the Schedula Assistant for application guidance.

---

## Doctor

Doctors can:

* Access the Doctor Dashboard.
* Manage appointments.
* Manage appointment availability.
* Manage appointment slots.
* Use the Doctor Calendar.
* Manage professional profile information.
* Manage prescriptions.
* Use applicable patient-side functionality.
* Use the Schedula Assistant for application guidance.

---

# Future Improvements

The current version focuses primarily on implementing the complete frontend application workflow.

Possible future improvements include:

* Backend integration.
* Database integration.
* Persistent authentication.
* Server-side appointment management.
* Real-time notifications.
* Persistent chatbot conversations.
* Improved mobile navigation.
* Additional accessibility improvements.
* Improved responsive behavior.
* Further UI and interaction polish.

---

# Current Development Status

The core application structure and major workflows have been implemented.

The final development focus is on:

* UI refinement.
* Improving visual consistency.
* Polishing interactions.
* Improving the overall user experience.
* Testing edge cases across patient and doctor workflows.
* Improving responsiveness where necessary.

---

## Author

Developed as a frontend healthcare appointment management application project.
