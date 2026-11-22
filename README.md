# Tamheed (تمهيد)

Tamheed is a web platform where university students practice real workplace situations. A student reads a work brief, writes how she would respond, and gets AI feedback from the Gemini API. The feedback is scored against a fixed rubric for each scenario.

CPIT405 group project, King Abdulaziz University.

| Name | Student ID |
| --- | --- |
| Jana Bawazir | 2305775 |
| Asalah Munahir | 2305872 |
| Reham Alwegdani | 2308074 |
| Atheer Alsulami | 2307149 |

## Features and course requirements

| Course requirement | Where it is in the app |
| --- | --- |
| User authentication | Sign up, log in and log out with Firebase Authentication (`src/contexts/AuthContext.jsx`) |
| Profile management | Change name and password on the Profile page |
| Protected routes | `ProtectedRoute` sends logged-out users to `/login`. `AdminRoute` opens the admin panel only for admins |
| Role-based access | Student and Admin roles, saved in the database and checked by the Firestore security rules |
| External API | Gemini API evaluates answers (`src/services/gemini.js`) with loading, error messages and result display |
| Form validation | Every form (`src/utils/validation.js`) |
| Search and filtering | Simulations page, dashboard results, admin users list |
| Loading indicators and messages | `Loader`, `Alert` and toast messages on every request |
| Data persistence | Cloud Firestore (Firebase's database), see `src/services/db.js` |
| Responsive design | Works from 360 px phones up to desktop |
| Accessibility | Labels on all inputs, keyboard focus, skip link, screen reader roles, reduced motion |

### Interface

- Full Arabic and English interface. Arabic switches the whole layout to right to left.
- Light and dark mode. The chosen language and theme are saved in the browser.
- Score colors are the same everywhere and in both themes: red 0 to 49 (Needs improvement), yellow 50 to 74 (Developing), green 75 to 100 (Good / Excellent).
- Dashboard charts: average score per skill and progress over time (plain SVG, no chart library).
- Gemini writes the feedback in the language the student is using. Students can answer in Arabic or English.

### Admin panel (`/admin`)

- **Overview:** number of users, active users, evaluations and suspended accounts, evaluations per day, results by level, most practiced simulations, platform skills, latest evaluations and the admin activity log.
- **Users:** search, filter by role and status, sort, and export users or results as CSV files.
- **One user:** profile, numbers, skills and results. Actions: suspend or reactivate, make admin or student, reset the daily limit, send a password reset email, delete all results.
- **Simulations:** add, edit, hide and remove simulations for everyone. Reset brings a built-in simulation back to its original text.
- **Settings:** the daily AI limit per student and an announcement shown on every student's dashboard.

## Setup

You need Node.js 20 or newer.

### 1. Install

```
npm install
```

### 2. Firebase Authentication

1. Go to https://console.firebase.google.com and create a project (the free Spark plan is enough).
2. Open Project settings, scroll to "Your apps" and register a web app.
3. Open Authentication, click "Get started" and enable Email/Password.
4. Copy `.env.example` to a new file named `.env`.
5. Copy each value of the `firebaseConfig` object into the matching `VITE_FIREBASE_...` line.

### 3. Cloud Firestore (the database)

1. In the Firebase console open **Build > Firestore Database** and click **Create database**.
2. Choose a location near you and start in **production mode**.
3. Open the **Rules** tab, delete what is there, paste the whole content of `firestore.rules` from this project and click **Publish**.

Without step 3 every page shows a permission error.

### 4. Gemini API key

1. Go to https://aistudio.google.com and sign in.
2. Open **Dashboard > API keys** and create a key. Do not add billing.
3. Check that the **Billing Tier** column says **Free tier**.
4. Put the key in `.env` as `VITE_GEMINI_API_KEY`.
5. Set `VITE_GEMINI_MODEL` to a model your key can use. New accounts should use `gemini-3.1-flash-lite`.

### 5. First admin account

The email `admin@tamheed.com` becomes an admin the first time it logs in. To use another email, change it in **both** places:

- `src/data/admins.js`
- `firestore.rules` (the `isStartingAdmin` function), then publish the rules again

After that, an admin can make other users admins from the admin panel.

### 6. Run

```
npm run dev
```

Open http://localhost:5173/tamheed/

## Deploy to GitHub Pages

1. Create a GitHub repository. If its name is not `tamheed`, change `base` in `vite.config.js` to `'/your-repo-name/'`.
2. Push the code to the `main` branch.
3. Run `npm run deploy`. This builds the app and publishes the `dist` folder to the `gh-pages` branch.
4. In the repository settings, open Pages and choose the `gh-pages` branch.
5. In Firebase, open Authentication > Settings > Authorized domains and add `your-username.github.io`.

The live site uses the values in your `.env` file at build time, so run the deploy from a computer that has the `.env` file.

## Folder structure

```
firestore.rules        Database security rules (paste into the Firebase console)
src/
  firebase.js          Firebase setup: Authentication + Firestore
  App.jsx              All routes, including the nested /admin routes
  main.jsx             Entry point
  contexts/            AuthContext.jsx (user, profile, role, settings)
                       PreferencesContext.jsx (language, theme, t() for translations)
                       ToastContext.jsx (success messages)
  i18n/                en.js and ar.js: every interface text in both languages
  services/            db.js (all Firestore work), gemini.js (prompt and Gemini request)
  components/          Shared parts: routes guards, navbar, logo, score bars and ring,
                       charts, cards, loaders, alerts, form fields, useAsync hook
  pages/               Student pages
  pages/admin/         AdminLayout, AdminOverview, AdminUsers, AdminUserDetail,
                       AdminSimulations, AdminSettings
  utils/               validation.js, scoring.js, localize.js, csv.js, AppError.js
  data/                simulations.js (12 scenarios), simulations-ar.js (Arabic text), admins.js
  styles/              global.css (colors for both themes), layout.css, components.css, pages.css
```

## Known limits

- Deleting a Firebase login account needs a server, which the free plan does not offer. The admin panel suspends accounts instead. To delete an account completely, use the Firebase console: Authentication > Users.
- The daily AI limit is checked in the app. The security rules stop suspended users from saving results.
- The Gemini key is inside the built JavaScript, so a visitor could find it. This is the same as the external API example in the React lecture. The key is on the free tier with no billing, so the worst case is that someone uses the daily quota. You can create a new key in AI Studio at any time.
- On the free tier, Google may use the prompts to improve its products. The app sends only the scenario, the rubric and the answer, never names or emails.
- Simulations that the admin adds or edits are shown in the language the admin wrote them in.
- AI feedback is educational guidance, not an official job assessment.
