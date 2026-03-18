# Server (Backend) - takeYourInterview.ai

Express-based backend for authentication, AI interview generation/evaluation, coupon credits, and Razorpay payment processing.

## Tech Stack

- Runtime: `Node.js` (ES Modules)
- Framework: `Express 5`
- Database: `MongoDB` with `Mongoose`
- Auth: `JWT` + HTTP cookie + optional `Authorization: Bearer`
- AI Provider: `OpenRouter` (`openai/gpt-4o-mini`)
- Resume Parsing: `pdfjs-dist`
- Uploads: `multer`
- Payments: `Razorpay` + HMAC signature verification
- Utilities: `axios`, `dotenv`, `cookie-parser`, `cors`

## Folder Structure

```text
server/
├─ config/
│  ├─ connectDb.js
│  └─ token.js
├─ controllers/
│  ├─ auth.controller.js
│  ├─ coupon.controller.js
│  ├─ interview.controller.js
│  ├─ payment.controller.js
│  └─ user.controller.js
├─ middlewares/
│  ├─ isAuth.js
│  └─ multer.js
├─ models/
│  ├─ coupon.model.js
│  ├─ interview.model.js
│  ├─ payment.model.js
│  └─ user.model.js
├─ routes/
│  ├─ auth.route.js
│  ├─ coupon.route.js
│  ├─ interview.route.js
│  ├─ payment.route.js
│  └─ user.route.js
├─ services/
│  ├─ openRouter.service.js
│  └─ razorpay.service.js
├─ Dockerfile
├─ index.js
└─ package.json
```

## Scripts

- `npm run dev` - start with nodemon (`index.js`)

## Environment Variables

Create `server/.env`:

```env
PORT=6000
MONGODB_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
OPENROUTER_API_KEY=<your-openrouter-key>
RAZORPAY_KEY_ID=<your-razorpay-key-id>
RAZORPAY_KEY_SECRET=<your-razorpay-key-secret>
```

## API Base

- All routes are mounted under `/api`
- Health endpoint: `GET /api/health`

## Authentication Model

- Login/auth routes generate JWT with `7d` expiry (`config/token.js`)
- Token is stored in cookie named `token`
- `isAuth` middleware reads token from:
  - `req.cookies.token`, or
  - `Authorization: Bearer <token>`
- On success, `req.userId` is set from JWT payload

## Data Models

### `User`

- `name` (required)
- `email` (required, unique)
- `password` (optional, hidden by default)
- `role`: `USER | ADMIN` (default `USER`)
- `credits`: number (default `100`)
- timestamps enabled

### `Interview`

- `userId` (ref `User`)
- `role`, `experience`, `mode` (`HR | Technical`)
- `resumeText`
- `questions[]`:
  - `question`, `difficulty`, `timeLimit`, `answer`, `feedback`
  - `score`, `confidence`, `communication`, `correctness`
- `finalScore`
- `status`: `Incompleted | completed`
- timestamps enabled

### `Payment`

- `userId` (ref `User`)
- `planId`, `amount`, `credits`
- `razorpayOrderId`, `razorpayPaymentId`
- `status`: `created | paid | failed`
- timestamps enabled

### `Coupon`

- `coupon` (unique)
- `quantity` (remaining redemptions)
- `credits` (credits granted per redemption)
- `expiryDate`
- timestamps enabled

## Routes and Contracts

### Auth Routes (`/api/auth`)

1. `POST /google`
   - body: `{ name, email }`
   - behavior: find/create user, set JWT cookie, return user
2. `POST /login`
   - body: `{ email, password }`
   - behavior: SHA-256 password check, set JWT cookie, return safe user
3. `GET /logout` (auth required)
   - behavior: clear cookie

### User Routes (`/api/user`)

1. `POST /`
   - body: `{ name, email, password, role? }`
   - behavior: create local account with hashed password
2. `GET /current-user` (auth required)
   - behavior: returns authenticated user
3. `DELETE /:id` (auth required)
   - behavior: self-delete or admin-delete

### Interview Routes (`/api/interview`)

1. `POST /resume` (auth + multipart)
   - form-data field: `resume` (`PDF`, up to 5MB)
   - behavior:
     - parse PDF text (`pdfjs-dist`)
     - send resume text to AI for structured JSON extraction
     - returns `role`, `experience`, `projects[]`, `skills[]`, `resumeText`
2. `POST /generate-questions` (auth)
   - body: `{ role, experience, mode, resumeText, projects, skills }`
   - behavior:
     - requires `role`, `experience`, `mode`
     - requires at least `50` user credits
     - calls AI to generate exactly 5 question lines
     - deducts `50` credits
     - creates interview with fixed difficulty/time limits:
       - Q1 easy 60s
       - Q2 easy 60s
       - Q3 medium 90s
       - Q4 medium 90s
       - Q5 hard 120s
   - response includes: `interviewId`, `creditsLeft`, `userName`, `questions`
3. `POST /submit-answer` (auth)
   - body: `{ interviewId, questionIndex, answer, timeTaken }`
   - behavior:
     - empty answer -> score `0`, canned feedback
     - exceeded time -> score `0`, canned feedback
     - otherwise AI evaluates answer and returns JSON scores
4. `POST /finish` (auth)
   - body: `{ interviewId }`
   - behavior: computes final averages and marks interview `completed`
5. `GET /get-interview` (auth)
   - behavior: list of current user interviews
6. `GET /report/:id` (auth)
   - behavior: detailed report for one interview

### Payment Routes (`/api/payment`)

1. `POST /order` (auth)
   - body: `{ planId, amount, credits }`
   - behavior:
     - create Razorpay order (`INR`, amount in paise)
     - store `Payment` with `created` status
     - return Razorpay order object
2. `POST /verify` (auth)
   - body: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
   - behavior:
     - verify HMAC signature with `RAZORPAY_KEY_SECRET`
     - mark payment as `paid`
     - increment user credits using payment record

### Coupon Routes (`/api/coupon`)

1. `GET /` (auth)
   - behavior: list active coupons (`not expired`, `credits > 0`, `quantity > 0`)
2. `POST /` (auth)
   - body: `{ coupon, quantity, expiryDate, credits }`
   - behavior: admin-only coupon creation
3. `POST /verify` (auth)
   - body: `{ coupon }`
   - behavior:
     - validate coupon existence, expiry, quantity
     - decrement quantity
     - add coupon credits to user

## AI Integration Details

AI requests are sent through `services/openRouter.service.js`:

- Endpoint: `https://openrouter.ai/api/v1/chat/completions`
- Model: `openai/gpt-4o-mini`
- Input: standard `messages[]` chat format

Used in three backend flows:

1. Resume analysis:
   - System prompt asks for strict JSON:
     - `role`, `experience`, `projects[]`, `skills[]`
2. Interview generation:
   - System prompt enforces:
     - exactly 5 questions
     - conversational tone
     - 15-25 words each
     - easy -> hard progression
3. Answer evaluation:
   - System prompt enforces JSON output with:
     - `confidence`, `communication`, `correctness`, `finalScore`, `feedback`

## CORS and Cookies

Configured allowed origins:

- `http://localhost:5173`
- `https://take-your-interview-front-end.vercel.app`

`credentials: true` is enabled, so client requests should include credentials when needed.

## Local Run

1. Install:
   - `npm install`
2. Configure `.env`
3. Start:
   - `npm run dev`
4. API available at:
   - `http://localhost:6000` (unless `PORT` overridden)

## Docker

`Dockerfile` is multi-stage and runs `node index.js` as non-root user.

Build and run:

```bash
docker build -t interviewiq-server .
docker run --env-file .env -p 6000:6000 interviewiq-server
```

Note: Dockerfile exposes `8000` while app defaults to `6000` unless `PORT` is set.

