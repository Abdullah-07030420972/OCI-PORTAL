# Oasis Computer Institute — Student Portal (backend version)

This is the full version with a real database (MongoDB Atlas, free tier) and a
backend (Node/Express) instead of Claude's built-in storage. It's split into
two parts:

- `backend/` — the API server (Node/Express + MongoDB)
- `frontend/index.html` — the website your students use (single file, no build step)

Follow the steps below in order. None of them cost money on the free tiers used here.

---

## 1. Create your free MongoDB Atlas database

1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. When asked to create a cluster, choose the **M0 (Free)** tier. This gives you
   512MB of storage forever, no time limit — more than enough for a student
   portal like this (thousands of students' records would fit easily).
3. Under **Database Access**, create a database user with a username and password
   (write these down — you'll need them in step 3).
4. Under **Network Access**, add `0.0.0.0/0` ("allow access from anywhere") so
   your backend (wherever you host it) can connect. This is fine for a small
   project like this.
5. Click **Connect** on your cluster → **Drivers** → copy the connection string.
   It looks like:
   `mongodb+srv://<username>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority`
   Replace `<username>` and `<password>` with the ones from step 3.

---

## 2. Set up the backend locally (to test before deploying)

You'll need Node.js installed on your computer (https://nodejs.org).

```bash
cd backend
npm install
cp .env.example .env
```

Open the new `.env` file and fill in:
- `MONGODB_URI` — the connection string from step 1 (add `/oci-portal` before the `?` so it uses a database named oci-portal, e.g. `...mongodb.net/oci-portal?retryWrites=true...`)
- `JWT_SECRET` — any long random string (mash your keyboard, or use a password generator)
- `ADMIN_PASSWORD` — the password you'll use to access the admin panel

Then run it:

```bash
npm start
```

You should see `MongoDB connected.` and `Server running on port 5000`. The first
time it runs, it automatically creates your first 40 lesson numbers
(`OCI-26-001` to `OCI-26-040`).

---

## 3. Test it locally

Open `frontend/index.html` directly in your browser (just double-click it).
It's already set to talk to `http://localhost:5000/api`, which matches your
local backend from step 2. Try registering a test account with lesson number
`OCI-26-001` to confirm everything works end to end, then delete that test
account later by removing it directly in Atlas if you want a clean start.

---

## 4. Deploy the backend for free (so it's online, not just on your computer)

**Render** (recommended, free tier available):
1. Push the `backend/` folder to a GitHub repository.
2. Go to https://render.com, sign up, click **New → Web Service**, and connect
   your repository.
3. Set:
   - Build command: `npm install`
   - Start command: `npm start`
4. Under **Environment**, add the same variables from your `.env` file
   (`MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`, `LESSON_PREFIX`, `LESSON_START_COUNT`).
5. Deploy. Render will give you a URL like `https://oci-backend.onrender.com`.

Note: Render's free tier "sleeps" the server after 15 minutes of no traffic —
the first request after a while takes ~30 seconds to wake up. That's normal
and fine for a small class portal; students just see a slightly slower first
load occasionally.

(Railway.app works similarly if you'd rather try that instead.)

---

## 5. Point the frontend at your deployed backend

Open `frontend/index.html` in a text editor, find this line near the top of
the `<script>` section:

```js
const API_BASE = "http://localhost:5000/api";
```

Change it to your Render URL plus `/api`, for example:

```js
const API_BASE = "https://oci-backend.onrender.com/api";
```

Save the file.

---

## 6. Put the website online for students to use

`frontend/index.html` is a single static file — host it anywhere free:
- **Netlify** (drag-and-drop the file at https://app.netlify.com/drop) — easiest
- **GitHub Pages** — free if you already use GitHub
- **Vercel** — also free and simple

Whichever you use, you'll get a link like `https://your-portal.netlify.app`
that you can share with students.

---

## How the admin side works

Go to your site → **Admin** → enter the `ADMIN_PASSWORD` you set in `.env`.
From there you can:
- See how many lesson numbers are unused, and generate more (in batches of 20)
- See every registered student and their average
- Click a student to enter/edit their scores for each of the 5 courses
- See student requests (grade review / questions) and mark them resolved

## Grading

Distinction (75+), Credit (60–74), Pass (50–59), Fail (below 50) — each shown
to the student with a short encouraging note.

## A note on cost

Every piece of this (MongoDB Atlas M0, Render free web service, Netlify
static hosting) has a genuinely free tier with no card required to start, and
all comfortably cover a small class's worth of students and traffic. The one
thing to keep an eye on is Render's free tier sleeping after inactivity — if
that becomes annoying, look at Railway's free tier as an alternative, or a
small paid tier (a few dollars a month) later if the portal grows.
