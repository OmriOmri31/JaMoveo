
# JaMoveo

JaMoveo is a web application built for the Moveo band to enhance rehearsal sessions. It enables each band member to log in from their phone, register with their instrument of choice, and join live jam sessions. An admin user can create sessions, search for songs in both English and Hebrew, and control the live display of chords and lyrics during a session.

## Live Demo

Check out the live app at: [https://jamoveomri.netlify.app/](https://jamoveomri.netlify.app/)

## Features

### User Registration & Authentication
- **Sign Up:** Register as a regular user or as an admin.
- **Profile Customization:** Choose or upload an image during registration.

### Session Management
- **Create Sessions:** Admins can create rehearsal sessions with a unique code.
- **Join Sessions:** Users join sessions by entering the session code.
- **Real-Time Updates:** Live updates of active users using Socket.io.

### Song Search & Live Display
- **Search Songs:** Admins can search for songs (supports both English and Hebrew).
- **Search Results:** Display of song name and artist.
- **Live Jam Page:**
  - **Players (non-vocals):** View both chords and lyrics.
  - **Singers:** View only the lyrics.
- **Auto-Scroll:** Automatic scrolling for better performance in smoky environments.
- **Session Closure:** Admins can end a session, redirecting all users back to the main page.

### Bonus
- **Web Crawling:** Uses Puppeteer to crawl external websites for chords and lyrics.

## Tech Stack

- **Frontend:** React, React Router
- **Backend:** Node.js, Express, Socket.io, Puppeteer
- **Database:** MongoDB
- **Authentication:** JWT, Bcrypt

## Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/jamoveo.git
cd jamoveo
```

### 2. Setup Environment Variables
Create a `.env` file in the backend folder with the following content:
```ini
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
REACT_APP_SERVICE_ONE_URL=your_frontend_url
REACT_APP_SERVICE_TWO_URL=your_backend_url
```

## Usage

### Regular Users
- **Sign Up/Log In:** Use the main page to create an account or log in.
- **Join Session:** Enter the session code provided by the admin.
- **Wait to Jam:** The live session will start once the admin selects a song.

### Admin Users
- **Admin Registration:** Sign up via the dedicated admin route (e.g., `/ImTheBoss`).
- **Create Session:** Use the Admin Dashboard to create a new session.
- **Search and Select Song:** Search for a song and select it to broadcast chords/lyrics to all users.
- **End Session:** Click the "Quit" button to end the session and redirect everyone back to the main page.

## Deployment

For production deployment, the project is hosted using:
- **Frontend:** Deployed on [Netlify](https://www.netlify.com/)
- **Backend:** Deployed on [Render](https://render.com/)

Ensure your environment variables are correctly set up on each platform.

---

Enjoy jamming with JaMoveo, and thank you for using our application!
```
