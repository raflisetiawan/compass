# BeSpoke Decision Support Tool

A patient-facing web application designed to help patients newly diagnosed with localized prostate cancer make informed decisions about treatment options.

## 📋 Overview

BeSpoke Decision Support Tool provides personalized outcome predictions and side effect information for different prostate cancer treatments, including:
- Active Surveillance
- Focal Therapy
- Prostatectomy (Surgery)
- Radiotherapy

The tool uses validated clinical data to present estimated outcomes based on patient-specific characteristics, helping patients understand how different treatments might affect their cancer outcomes and quality of life.

## 🚀 Tech Stack

### Core
- **React 18** with TypeScript
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing

### UI & Styling
- **Tailwind CSS** - Utility-first CSS framework
- **ShadcnUI** - Re-usable component library
- **Radix UI** - Unstyled, accessible UI primitives
- **Lucide React** - Icon library
- **Framer Motion** - Animation library

### State Management
- **Zustand** - Lightweight state management

### Backend & Data
- **Firebase Authentication** - User authentication
- **Firestore** - NoSQL database
- **Static JSON Data** - Clinical outcome probabilities
- **reCAPTCHA v2** - Bot protection for login

### Visualization & Export
- **D3.js** - Custom charts and icon plots
- **jsPDF** - PDF generation
- **jsPDF AutoTable** - Table generation in PDFs

### Validation
- **Zod** - TypeScript-first schema validation

## 🎯 Key Features

### 1. Multi-Step Questionnaire
- Clinical data input (Age, PSA, Gleason Score, T-Stage, etc.)
- Baseline functional assessment (urinary, erectile, bowel function)
- **Optional functional sections**: Urinary, Erectile, and Bowel function questions can be skipped
- "Skip Section" button for optional sections
- Form validation with immediate feedback

### 2. Personalized Results Dashboard
- **Survival Outcomes**: 5-year survival predictions with oncological outcomes
- **Functional Outcomes**: Predictions for:
  - Urinary function (leakage, pad usage, bother)
  - Erectile function (with/without medication)
  - Sexual bother
  - Bowel function and urgency
- **Risk & Retreatment Equations**: Treatment-specific probability calculations for:
  - Active Surveillance (probability of no treatment needed)
  - Focal Therapy (repeat focal, radical treatment probabilities)
  - Surgery & Radiotherapy (salvage treatment probabilities)

### 3. Interactive Visualizations
- Icon plots showing outcomes for 100 men with similar characteristics
- Color-coded predictions for different severity levels
- Responsive data tables
- **Conditional display**: Shows informative message when functional data is not provided

### 4. PDF Export
- Comprehensive summary of patient data and predictions
- **VCE Results**: Treatment preferences and importance ratings
- **Optional VCE inclusion**: Checkbox option to include/exclude VCE results in PDF
- Includes all visualizations and outcomes
- Optimized for clinical consultation

### 5. User Authentication
- Secure access via unique access codes
- Role-based access (clinician/patient)
- Session management with Firebase

### 6. Value Clarification Exercise (VCE)
- Multi-step questionnaire to help patients reflect on treatment preferences
- **Placement**: VCE now appears **after the main questionnaire** (not before)
- **Question 1**: Treatment philosophy choice (active treatment vs. monitoring)
- **Question 2**: Side effects importance ratings (5 items: urinary leakage, frequency, bowel issues, energy, erectile)
- **Question 3**: Logistics importance ratings (3 items: daily travel, distant travel, time away from activities)
- **Most Important Side Effect Dropdown**: Additional question to select the single most important side effect to avoid
- **VCE Results Page**: Read-only summary of all answers sorted by importance level
- Answers automatically saved to Firestore session
- VCE answers included in PDF export with simplified, document-friendly layout

### 7. Security
- **reCAPTCHA v2** checkbox protection on login to prevent automated access
- "I'm not a robot" verification with optional puzzle challenges
- Google Privacy Policy and Terms of Service attribution included

### 8. Baseline Function Sidebar
- Displays patient's baseline urinary, erectile, and bowel function
- Shows "Not answered" for skipped optional questions
- Includes all functional parameters: leakage, pad usage, urinary bother, erectile function, sexual medication, erectile bother, bowel urgency, and bowel bother

### 9. Navigation Sidebar
- **Global navigation panel** available on all pages (except Login and Select Patient)
- Collapsible accordion sections matching the tool's information architecture
- **Active page highlighting** with left border indicator
- **Desktop**: Expanded by default, collapsible via "Hide menu" toggle
- **Mobile**: Accessible via floating action button (hamburger menu) that opens a slide-out drawer
- **Accessibility-optimized** for elderly users: large fonts (16px), minimum 44px touch targets, high-contrast text

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account with project setup

### Setup

1. **Clone the repository**
```bash
git clone <repository-url>
cd compass
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_RECAPTCHA_SITE_KEY=your_recaptcha_v2_site_key
```

> **Note**: To get a reCAPTCHA v2 site key, visit [Google reCAPTCHA Admin Console](https://www.google.com/recaptcha/admin) and create a new site with reCAPTCHA v2 ("I'm not a robot" Checkbox). Add `localhost` for development and your production domain.

4. **Run development server**
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 🗂️ Project Structure

```
compass/
├── src/
│   ├── assets/              # JSON data files for clinical outcomes
│   │   ├── bowel_bother.json
│   │   ├── erectile_function_with_assist.json
│   │   ├── survival_calculation.json
│   │   └── ...
│   ├── components/          # Reusable UI components
│   │   ├── NavigationSidebar.tsx  # Global navigation sidebar
│   │   └── ui/             # ShadcnUI components
│   ├── features/
│   │   ├── questionnaire/  # Questionnaire-specific components
│   │   └── results/        # Results page components
│   ├── hooks/              # Custom React hooks
│   ├── layouts/            # Page layout components
│   ├── lib/                # Utility functions
│   │   └── pdf.ts         # PDF generation logic
│   ├── pages/              # Page components
│   │   ├── IntroductionPage.tsx
│   │   ├── PatientInfoPage.tsx
│   │   ├── VCEIntroPage.tsx        # VCE introduction
│   │   ├── VCEQuestionsPage.tsx    # VCE multi-step questions
│   │   ├── VCEResultsPage.tsx      # VCE results summary
│   │   ├── ResultsPage.tsx
│   │   └── [functional outcome pages]
│   ├── services/           # External service integrations
│   │   ├── firebase.ts     # Firebase config & Firestore operations
│   │   ├── recaptcha.ts    # reCAPTCHA v2 verification
│   │   └── prediction.ts   # Clinical prediction logic
│   ├── stores/             # Zustand state stores
│   │   ├── questionnaireStore.ts
│   │   ├── userStore.ts
│   │   └── vceStore.ts     # Value Clarification Exercise state
│   ├── types/              # TypeScript type definitions
│   └── App.tsx
├── public/
├── .env.example
├── package.json
└── README.md
```

## 🔥 Firebase Setup

### Firestore Schema

#### Users Collection
```typescript
users/{accessCode}
  - uid: string
  - role: 'clinician' | 'patient'
  - accessCode: string
  - lastLoginAt: Timestamp
```

#### Questionnaire Sessions (Subcollection)
```typescript
questionnaireSessions/{accessCode}/sessions/{sessionId}
  - answers: object
  - vceAnswers: {
      treatmentPhilosophy: 'active' | 'monitoring',
      sideEffectsImportance: object,
      logisticsImportance: object
    }
  - createdAt: Timestamp
  - updatedAt: Timestamp
```

### Security Rules
Ensure proper Firestore security rules are configured to restrict access based on authentication and access codes.

## 🎨 Development Workflow

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Code Standards

- **TypeScript**: Strict mode enabled
- **Formatting**: Consistent code style
- **Components**: Functional components with hooks
- **State**: Zustand for global state, local state for component-specific data

## 📊 Clinical Data

The application uses validated clinical data from research studies. Data is stored in JSON format in the `src/assets/` directory:

- `survival_calculation.json` - 5-year survival outcomes
- `erectile_function_with_assist.json` - Erectile function predictions
- `bowel_bother.json` - Bowel function outcomes
- `urinary_bother.json` - Urinary function outcomes
- `risk_retreatment_equations.json` - Risk & retreatment probability data
- And more...

### Data Structure Example
```json
{
  "Treatment Type": {
    "Baseline Status": {
      "Outcome Category": {
        "N": number,
        "Outcome 1": percentage,
        "Outcome 2": percentage
      }
    }
  }
}
```

## 🔒 Authentication Flow

1. User enters unique access code on login page
2. User completes **reCAPTCHA v2** checkbox verification
3. Firebase Authentication creates/retrieves user session
4. Access code is validated against Firestore
5. User role (clinician/patient) determines available features
6. Session persists via localStorage

## 📱 Responsive Design

The application is fully responsive with specific optimizations for:
- **Mobile** (< 640px): Simplified layouts, bottom sheets for modals, navigation via floating hamburger button with slide-out drawer
- **Tablet** (640px - 1024px): Adaptive grid layouts, navigation drawer
- **Desktop** (> 1024px): Full sidebar navigation (expanded by default, collapsible), multi-column layouts

## 🎯 User Journey

1. **Landing Page** - Introduction to the tool
2. **Login** - Access code authentication with reCAPTCHA
3. **Personalized Info Intro** - Brief introduction to personalized information
4. **Treatment Options** - Learn about available treatments (definitions, etc.)
5. **Clinical Data Input** - Multi-step form for patient characteristics
6. **Functional Baseline** - Current quality of life assessment (optional sections)
7. **Value Clarification Exercise (VCE)** - Reflect on treatment preferences
8. **VCE Results** - Summary of importance ratings and side effect preferences
9. **Functional Outcomes** - Sequential pages with Back/Next navigation:
   - Survival after prostate cancer treatment
   - Risk & Retreatment Equations
   - Leaking urine at 1 year
   - Use of urinary pads at 1 year
   - Urinary Bother
   - Erectile function at 1 year
   - Bother with erectile function at 1 year
   - Problem with bowel urgency at 1 year
   - Bowel bother at 1 year
   - Final Summary Table
10. **PDF Export** - Download comprehensive summary (with optional VCE inclusion)

## 🐛 Known Issues & Limitations

- PDF generation may take 1-2 minutes for complete reports
- Some clinical data combinations may not have predictions
- Browser compatibility: Modern browsers only (Chrome, Firefox, Safari, Edge)

## 🤝 Contributing

This is a medical decision support tool. Any contributions should:
1. Maintain clinical accuracy
2. Follow accessibility guidelines (WCAG 2.1 AA)
3. Include proper TypeScript types
4. Be tested across devices and browsers

## 📄 License

[Specify your license]

## 👥 Authors & Acknowledgments

- Developed for prostate cancer patients and clinicians
- Based on validated clinical research data
- Built with modern web technologies for optimal user experience

## 📞 Support

For technical issues or questions about the clinical data, please contact [contact information].

---

**Note**: This is a medical decision support tool intended to aid in shared decision-making between patients and healthcare providers. It should not replace professional medical advice.
