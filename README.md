# 🍕 Victor's Pizza Delivery

A full-stack pizza ordering and inventory management platform developed as part of the **Oasis Infobyte Internship Program**.

The application provides separate customer and administrator experiences, secure authentication, custom pizza creation, order processing, payment simulation, inventory management, automated low-stock notifications, and near-real-time order-status tracking.

---

# 📌 Project Overview

Victor's Pizza Delivery is a MERN-stack application designed to simulate a modern pizza ordering platform.

The project combines a customer-facing pizza ordering experience with an administrator portal responsible for menu management, inventory control, order processing, and low-stock monitoring.

## Customer Capabilities

Customers can:

- Register and verify their email address.
- Log in securely.
- Recover forgotten passwords.
- Browse available pizzas.
- Build custom pizzas.
- Add catalog and custom pizzas to their cart.
- Review their order before payment.
- Complete a Razorpay-style test payment.
- Track their order status in near real time.
- Review previous orders.

## Administrator Capabilities

Administrators can:

- Log in through a separate administrator portal.
- View incoming customer orders.
- Update order statuses.
- Manage inventory.
- Configure low-stock thresholds.
- Receive automated low-stock email notifications.
- Create, edit, and delete menu pizzas.
- Upload pizza images.
- Map catalog pizzas to inventory ingredients.

---

# 🛠️ Technology Stack

## Frontend

- React.js
- Vite
- React Router
- Axios
- React Toastify
- CSS

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JSON Web Tokens (JWT)
- bcrypt
- Nodemailer
- Multer
- node-cron

## Database

- MongoDB

---

# 👤 Customer Authentication

## Registration and Email Verification

Customers can create accounts using:

- Full name
- Email address
- Secure password

Passwords must contain:

- At least 8 characters
- An uppercase letter
- A lowercase letter
- A number
- A special character

After registration, the customer receives an email containing a verification link.

The customer must verify the email address before login is permitted.

After successful verification, the backend redirects the customer back to the React login page using `CLIENT_URL`.

The login page detects the verification query parameter and displays:

> Email verified successfully. You can now sign in.

This provides a better user experience than exposing a raw backend JSON response after verification.

During local development, verification links use the local backend URL. After deployment, `SERVER_URL` and `CLIENT_URL` can be replaced with public production URLs so that customers can verify their accounts from other devices.

---

## Secure Login

Customer authentication uses JSON Web Tokens.

After successful login:

- A customer JWT is generated.
- Protected frontend routes become accessible.
- The authenticated customer can access cart, checkout, orders, and other protected customer functionality.

Administrator and customer authentication are intentionally kept separate.

---

# 🔐 Forgot Password and Password Reset

Customers can request a password-reset email.

The backend:

1. Generates a secure reset token.
2. Stores only the SHA-256 hash of the token.
3. Gives the token an expiration time.
4. Sends the original token through the password-reset email.
5. Allows the customer to create a new secure password.
6. Invalidates the token after it is used.

The forgot-password response does not reveal whether an email address exists in the database.

---

# 🍕 Pizza Menu

Pizza information is retrieved from MongoDB rather than from hardcoded frontend arrays.

Menu pizzas support information such as:

- Pizza name
- Description
- Price
- Category
- Rating
- Image
- Featured status
- Popular status
- Availability

Administrators can manage these pizzas through the administrator interface.

---

# 🧑‍🍳 Custom Pizza Builder

Customers can create their own pizzas through a multi-step builder.

## Step 1 — Pizza Base

Customers select one available pizza base.

The project supports the required five pizza-base options.

## Step 2 — Sauce

Customers select one available sauce.

The project supports the required five sauce options.

## Step 3 — Cheese

Customers select one available cheese type.

## Step 4 — Vegetables

Customers may select multiple vegetables.

The available builder options are loaded from the backend inventory rather than being permanently hardcoded into the customer interface.

---

# 💰 Trusted Server-Side Pricing

The frontend never controls the final trusted pizza price.

For custom pizzas, the frontend submits ingredient selections while the backend retrieves the authoritative ingredient prices from MongoDB.

The custom pizza price is calculated as:

```text
Base
+ Sauce
+ Cheese
+ Selected Vegetables
= Custom Pizza Price
```

Catalog pizza prices are also revalidated against MongoDB before an order is created.

This prevents a customer from changing frontend values and submitting manipulated prices to the backend.

---

# 🛒 Shopping Cart

The cart belongs to the authenticated customer.

Customers can:

- Add catalog pizzas.
- Add custom pizzas.
- Increase quantities.
- Decrease quantities.
- Remove individual items.
- Clear the entire cart.

Cart totals are calculated dynamically rather than permanently storing potentially stale totals.

---

# 📦 Order Creation

Before payment, the backend:

1. Validates the customer's delivery details.
2. Loads the authenticated customer's cart.
3. Revalidates catalog pizzas.
4. Revalidates custom pizza ingredients.
5. Recalculates trusted prices.
6. Checks inventory availability.
7. Creates an order snapshot.
8. Sets the initial payment status to `Pending`.
9. Sets the initial order status to `Order Received`.

The order stores the information required to preserve historical order data even if menu information is changed later.

---

# 💳 Payment Implementation

## Internship Requirement

The internship requirement specified a **Razorpay checkout integration using Test Mode**, where the payment flow could be tested using success and failure outcomes.

## Current Implementation

The application implements a **Razorpay-style simulated Test Mode payment flow**.

The current lifecycle is:

```text
Order Created
      ↓
Payment Session Created
      ↓
Payment Pending
      ↓
Customer Selects Success / Failure
      ↓
Backend Finalises Payment
      ↓
Paid / Failed
```

The implementation deliberately follows the structure of a payment-gateway lifecycle rather than simply displaying a fake payment-success message on the frontend.

The simulator includes:

- Unique test payment-session identifiers.
- Pending payment state.
- Success and Failure flows.
- Duplicate-payment protection.
- Server-authoritative order totals.
- Backend payment finalisation.
- Inventory revalidation.
- Atomic inventory deduction.
- Cart clearing only after successful payment.
- Order status preservation.

---

# ⚠️ Why Razorpay API Credentials Were Not Used

The original internship requirement specified the use of **Razorpay in Test Mode** for the payment stage of the pizza ordering application.

The intended implementation was therefore to integrate Razorpay's test checkout and use Razorpay test API credentials to simulate successful and failed customer payments.

During development, however, an account-access and geographical onboarding limitation prevented the project from obtaining usable Razorpay test credentials.

## Razorpay Account Availability Limitation

The application was developed in **South Africa**.

During the Razorpay account setup and onboarding process encountered during development, South Africa was not provided as an available country for the required account setup.

The available country options presented through the relevant onboarding process included:

- India
- Singapore
- United States

Because South Africa was not available in that onboarding process, the required account setup could not be completed and usable Razorpay Test Mode credentials could not be obtained.

A normal direct integration would require credentials such as:

```text
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
```

Without usable test credentials, the application could not legitimately communicate with Razorpay's test API.

## Why Another Payment Gateway Was Not Used During the Internship Implementation

From a technical perspective, another payment provider could have been integrated.

However, the internship specification explicitly required **Razorpay**.

Replacing Razorpay with an unrelated payment provider during the assessment would have moved the implementation away from the payment provider specified by the internship requirement.

For that reason, the project retained the Razorpay-oriented requirement and implemented a **Razorpay-style simulated Test Mode workflow** instead of presenting another payment provider as though it fulfilled the Razorpay requirement.

The intention was to reproduce the important payment lifecycle and application behaviour as closely as possible while remaining transparent about the fact that the project was not communicating with Razorpay's servers.

## Attempt to Resolve the Limitation

Guidance was requested from the internship team regarding the inability to obtain usable Razorpay test credentials in the South African development context.

No response was received before development needed to continue.

Rather than leaving the payment requirement completely unfinished, or falsely claiming that a real Razorpay API integration had been completed, development continued using a controlled Razorpay-style payment simulator.

## Implemented Razorpay-Style Test Flow

The fallback payment implementation was designed to exercise the actual application business logic.

The flow is:

```text
Customer Completes Checkout
        ↓
Backend Creates Order
        ↓
Payment Status = Pending
        ↓
Test Payment Session Created
        ↓
Customer Opens Payment Interface
        ↓
Customer Selects Success / Failure
        ↓
Backend Receives Payment Result
        ↓
Payment Finalisation Logic
        ↓
Success → Paid
Failure → Failed
```

The backend remains authoritative throughout this process.

A successful simulated payment triggers actual application logic including:

- Payment finalisation.
- Duplicate-payment protection.
- Inventory availability revalidation.
- Atomic inventory deduction.
- Order payment-status update.
- Customer cart clearing.
- Order tracking activation.

A failed payment does not perform successful-payment inventory deduction and does not complete the order as paid.

The customer can therefore retry the payment.

## Why This Approach Was Chosen

This solution allowed the project to demonstrate the architectural responsibilities surrounding payment processing while respecting the account-access limitation encountered during development.

Most importantly, this project does **not** claim that the simulator is an official Razorpay API integration.

It is documented as a temporary **Razorpay-style simulated Test Mode payment adapter** used because usable Razorpay test credentials could not be obtained in the development environment.

---

# 🔄 Payment Architecture and Future Gateway Integration

The payment implementation was deliberately kept separate from the core ordering and inventory architecture.

This means a real payment gateway can later replace the simulator without rebuilding the complete pizza ordering system.

The simulator-specific components that would primarily be removed or replaced include:

- Simulated Success and Failure controls.
- Test payment-session endpoints and fields.
- Simulator-generated payment identifiers.
- Simulator-specific payment-controller logic.

The following application architecture can remain:

- Customer cart.
- Checkout.
- Trusted server-side pricing.
- Order creation.
- Payment state management.
- Inventory validation.
- Inventory transactions.
- Cart clearing after confirmed payment.
- Order history.
- Administrator order management.
- Customer order tracking.

The current simulator is therefore not intended to be the application's permanent payment solution.

It provides an internship-development fallback while preserving a clean migration path to a real payment provider later.

---

# 📦 Atomic Inventory Deduction

Inventory is deducted only after successful payment finalisation.

The application uses MongoDB transactions together with conditional stock updates.

The payment finalisation process follows this structure:

```text
Payment Success
      ↓
Begin MongoDB Transaction
      ↓
Re-check Inventory
      ↓
Atomically Deduct Stock
      ↓
Mark Order as Paid
      ↓
Clear Customer Cart
      ↓
Commit Transaction
```

If an operation inside the transaction fails:

```text
Transaction Aborted
      ↓
Changes Rolled Back
      ↓
Order Remains Unpaid
Cart Remains Intact
```

This architecture reduces the risk of overselling inventory when multiple customers attempt to order limited stock.

---

# 🧾 Catalog Pizza Recipes

Regular menu pizzas are mapped to inventory ingredients.

A pizza recipe can contain:

- Pizza base
- Sauce
- Cheese
- Vegetables

For example:

```text
Catalog Pizza
      ↓
Base
Sauce
Cheese
Selected Ingredients
      ↓
Inventory Requirements
```

This allows catalog pizzas and custom pizzas to participate in the same inventory-management system.

When a paid order is finalised, the backend can determine which inventory ingredients must be deducted.

---

# 🏪 Administrator Portal

The administrator uses a separate authentication flow from customers.

There is no public administrator registration interface.

Protected administrator functionality requires:

- A valid administrator JWT.
- The administrator role.

This prevents normal customer accounts from accessing protected administrator functionality.

---

# 📊 Inventory Dashboard

The administrator can manage inventory categories including:

- Pizza bases
- Sauces
- Cheeses
- Vegetables

Each inventory item contains information such as:

- Name
- Price
- Current stock
- Unit
- Low-stock threshold
- Availability

---

# 🔧 Manual Stock Management

Administrators can:

- Increase stock.
- Decrease stock.
- Set exact stock quantities.
- Enable or disable ingredients.
- Configure individual low-stock thresholds.

Example:

```text
Exact Stock: 15
Low-stock Alert: 20
```

Because:

```text
15 <= 20
```

the ingredient is considered low stock.

The **exact stock** represents the quantity currently available.

The **low-stock threshold** represents the warning level configured by the administrator.

Changing the exact stock does not automatically change the threshold.

---

# ⚠️ Configurable Low-Stock Detection

The system uses the following rule:

```text
stock <= lowStockThreshold
```

Example:

| Exact Stock | Alert Threshold | Result    |
| ----------: | --------------: | --------- |
|          50 |              20 | Normal    |
|          25 |              20 | Normal    |
|          20 |              20 | Low Stock |
|          15 |              20 | Low Stock |
|           5 |              20 | Low Stock |

The threshold represents the stock level at which the administrator wants the system to begin displaying a warning.

---

# 📧 Automated Low-Stock Email Notifications

The project uses `node-cron` to perform scheduled inventory checks.

The configured schedule can be supplied through:

```env
LOW_STOCK_CRON=0 9 * * *
```

This cron expression schedules the inventory check for **09:00 each day**, according to the timezone used by the running server environment unless an explicit timezone is configured.

The process is:

```text
Scheduled Job Runs
      ↓
Load Inventory
      ↓
Detect Low-Stock Items
      ↓
Check Previous Alert State
      ↓
Send Email for New Alerts
      ↓
Record Alert State
```

The notification recipient is configured using:

```env
ADMIN_EMAIL=
```

---

# 🔁 Duplicate Low-Stock Alert Protection

The project prevents the same unchanged low-stock condition from repeatedly generating unnecessary notification emails.

The behaviour is:

```text
Item First Becomes Low
      ↓
Email Sent
      ↓
Alert Recorded

Item Remains Low
      ↓
No Duplicate Alert Required

Item Restocked Above Threshold
      ↓
Alert State Reset

Item Becomes Low Again
      ↓
New Alert Can Be Sent
```

This reduces repeated low-stock notifications while still allowing the administrator to be notified when a new low-stock event occurs.

---

# 📋 Administrator Order Management

Administrators can:

- View incoming orders.
- View customer information associated with orders.
- View ordered items.
- View order totals.
- View payment status.
- View delivery information.
- Update order status.

Only successfully paid orders should proceed through the kitchen and delivery workflow.

---

# 🚚 Order Status Flow

The implemented order lifecycle is:

```text
Order Received
      ↓
In Kitchen
      ↓
Sent to Delivery
```

The administrator controls these status transitions through the administrator dashboard.

---

# 🔴 Near-Real-Time Customer Order Tracking

Customers can see order-status changes without manually refreshing the Orders page.

The frontend uses periodic polling to request updated order information from the backend.

Polling is used in customer-facing order-tracking areas including:

- Customer dashboard.
- Orders / Track My Order page.

When the administrator changes an order status:

```text
Admin Changes Status
      ↓
MongoDB Updated
      ↓
Customer Polling Request
      ↓
Latest Order Retrieved
      ↓
React State Updated
      ↓
Tracking Interface Updates
```

Customers also receive toast notifications when an existing paid order progresses to important stages such as:

- `In Kitchen`
- `Sent to Delivery`

Browser focus and visibility events are also used to refresh order information when the customer returns to a previously backgrounded tab.

This provides a near-real-time experience without introducing WebSocket infrastructure into the current internship implementation.

---

# 🖼️ Pizza Image Uploads

Administrators can upload or replace pizza images.

Uploaded files are processed by Multer and stored under:

```text
server/uploads/pizzas/
```

MongoDB stores the public image path rather than storing the image binary directly inside the pizza document.

Example:

```text
/uploads/pizzas/example-image.jpg
```

The backend exposes the uploads directory using Express static-file serving so the React application can display the uploaded images.

---

# 🎨 Frontend Design

The customer application uses a modern responsive design with:

- Branded authentication pages.
- Customer-specific pizza background artwork.
- Responsive pizza cards.
- Pizza builder interface.
- Cart interface.
- Checkout interface.
- Payment interface.
- Order tracking.
- Responsive navigation.

The administrator interface uses a separate professional operations-oriented design with:

- Collapsible sidebar.
- Order management.
- Inventory management.
- Pizza management.
- Responsive mobile navigation.

The administrator workspace intentionally uses a cleaner visual background to improve readability for operational information.

---

# 🔒 Security Considerations

The application includes security measures such as:

- Password hashing using bcrypt.
- JWT authentication.
- Separate customer and administrator authentication.
- Role-based administrator authorization.
- Protected frontend routes.
- Protected backend routes.
- Email verification.
- Secure password-reset tokens.
- Hashed password-reset tokens.
- Password-reset expiration.
- Server-authoritative pricing.
- Order ownership validation.
- Payment ownership validation.
- Duplicate-payment protection.
- MongoDB inventory transactions.
- Conditional stock deduction.
- Restricted CORS configuration.
- Environment-variable protection.

---

# 🌐 CORS Configuration

The backend restricts browser access using the configured frontend origin.

Example:

```js
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
```

During local development:

```env
CLIENT_URL=http://localhost:5173
```

When deployed, this value can be replaced with the public production frontend URL.

---

# 🔐 Environment Variables

Real environment files are intentionally excluded from Git.

The repository contains `.env.example` files showing which variables are required without exposing real credentials.

## Backend Environment

Create:

```text
server/.env
```

using:

```text
server/.env.example
```

as the template.

Example configuration:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret

EMAIL_USER=your_email@example.com
EMAIL_PASS=your_email_app_password

CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:5000

ADMIN_SEED_EMAIL=admin@example.com
ADMIN_SEED_PASSWORD=your_secure_admin_password

ADMIN_EMAIL=admin@example.com

LOW_STOCK_CRON=0 9 * * *
```

Never commit real values for passwords, secrets, database connection strings, or email credentials.

## Frontend Environment

Create:

```text
client/.env
```

using:

```text
client/.env.example
```

as the template.

Example:

```env
VITE_API_URL=http://localhost:5000/api
```

---

# 📁 Project Structure

```text
OIBSIP/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── services/
│   │   └── utils/
│   │
│   ├── .env.example
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── uploads/
│   │   └── pizzas/
│   ├── utils/
│   ├── .env.example
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# 🚀 Running the Project Locally

## 1. Clone the Repository

```bash
git clone <repository-url>
```

Move into the project directory:

```bash
cd OIBSIP
```

---

## 2. Install and Configure the Backend

```bash
cd server
npm install
```

Create:

```text
.env
```

using `.env.example` as the template.

Start the backend using the development/start command configured in `server/package.json`.

For example:

```bash
node server.js
```

The backend runs by default on:

```text
http://localhost:5000
```

---

## 3. Install and Configure the Frontend

Open another terminal and run:

```bash
cd client
npm install
```

Create:

```text
.env
```

using `.env.example` as the template.

Start Vite:

```bash
npm run dev
```

The frontend runs by default on:

```text
http://localhost:5173
```

---

# 🏗️ Production Build

The React application successfully produces a Vite production build using:

```bash
npm run build
```

The generated production files are placed inside:

```text
client/dist/
```

The `dist` directory is intentionally ignored by Git.

---

# 🧪 Testing Completed

The application was manually tested throughout development.

## Customer Testing

The following customer flows were tested:

- Registration.
- Strong-password validation.
- Email verification.
- Verification redirect to the login page.
- Login.
- Invalid login.
- Forgot password.
- Password reset.
- Protected routes.
- Pizza menu.
- Pizza builder.
- Catalog pizza cart.
- Custom pizza cart.
- Quantity updates.
- Checkout.
- Trusted order totals.
- Payment Failure.
- Payment retry.
- Payment Success.
- Cart clearing after successful payment.
- Order history.
- Order-status polling.
- Order-status toast notifications.

## Administrator Testing

The following administrator flows were tested:

- Separate administrator login.
- Protected administrator routes.
- Incoming order display.
- Paid-order status management.
- Inventory display.
- Quick stock adjustments.
- Exact stock updates.
- Configurable low-stock thresholds.
- Low-stock visual warnings.
- Ingredient availability.
- Pizza creation.
- Pizza editing.
- Pizza deletion.
- Pizza image upload.
- Featured and Popular status.
- Pizza inventory-recipe mapping.
- Scheduled low-stock detection.
- Low-stock email notifications.
- Duplicate low-stock alert protection.

---

# ✅ Internship Requirement Coverage

## User Side

- [x] User registration with email verification
- [x] JWT-based user login
- [x] Forgot-password email flow
- [x] Dashboard displaying pizzas
- [x] Five pizza-base options
- [x] Five sauce options
- [x] Cheese selection
- [x] Multiple vegetable selection
- [x] Order summary before payment
- [x] Razorpay-style Test Mode payment lifecycle
- [x] Order Received → In Kitchen → Sent to Delivery
- [x] Near-real-time order-status polling

## Admin Side

- [x] Separate administrator login
- [x] Inventory dashboard
- [x] Pizza-base inventory
- [x] Sauce inventory
- [x] Cheese inventory
- [x] Vegetable inventory
- [x] Automatic inventory deduction
- [x] Manual stock updates
- [x] Configurable low-stock thresholds
- [x] Scheduled low-stock email notifications
- [x] Order management
- [x] Order-status updates
- [x] Status reflected on the customer interface

---

# ⚠️ Known Limitation

The payment interface currently uses a **Razorpay-style simulator** rather than direct communication with the official Razorpay API.

This resulted from the inability to obtain usable Razorpay Test Mode credentials through the account/onboarding options available in the South African development context.

Guidance was requested from the internship team regarding the limitation, but no response was received before development needed to continue.

The project therefore implements and documents the payment simulator transparently rather than claiming that a real Razorpay API integration exists.

The payment architecture was intentionally separated from the rest of the ordering system so that the simulator can later be replaced by a real payment provider without redesigning the customer cart, order, inventory, and tracking architecture.

---

# 🌿 Version Control and Development Workflow

Git and GitHub were used throughout the project not only for source-code storage, but also to maintain a structured development history and separate major areas of development.

## Branching Strategy

The repository was developed using three primary branches:

```text
main
├── backend-auth
└── frontend-ui
```

### `backend-auth`

This branch was primarily used for backend development and progressively introduced functionality such as:

- Authentication and authorization.
- MongoDB models and database integration.
- Pizza management.
- Customer cart functionality.
- Checkout and order creation.
- Payment processing architecture.
- Atomic inventory deduction.
- Administrator order management.
- Order-status tracking.
- Inventory management.
- Automated low-stock email notifications.

Backend functionality was committed incrementally rather than being introduced as one large final commit.

Examples of development milestones included:

```text
feat(pizza): implement admin pizza management and image uploads

feat(order): complete cart checkout payment and atomic inventory flow

feat(orders): add admin management and order status tracking

feat(inventory): add automated low-stock email notifications
```

This creates a Git history that reflects how the backend evolved throughout development.

### `frontend-ui`

The `frontend-ui` branch was used for the customer and administrator interfaces and for the final frontend/backend integration work.

This included:

- Customer authentication interfaces.
- Protected React routes.
- Customer dashboard.
- Pizza menu.
- Pizza builder.
- Shopping cart.
- Checkout.
- Payment interface.
- Order history and tracking.
- Administrator dashboard.
- Inventory interface.
- Pizza-management interface.
- Responsive layouts.
- API service integration.
- Final UI and integration improvements.

After integration testing was completed, the work was committed as a frontend integration milestone before being merged into `main`.

### `main`

The `main` branch represents the final integrated and stable version of the application.

The final integration process followed:

```text
backend-auth
      ↓
    main
      ↑
frontend-ui
```

The completed backend branch was first merged into `main`, followed by the frontend/integration branch.

This preserved the development history of both areas while producing one final application branch.

---

# 🔀 Merge Conflict Resolution

The final integration also provided practical experience resolving Git merge conflicts.

Because both the backend and frontend-integration work modified some shared backend configuration files, Git detected conflicts while merging `frontend-ui` into `main`.

The affected files included:

```text
server/.gitignore
server/controllers/authController.js
server/server.js
```

Rather than deleting changes or recreating files manually, the conflicting versions were reviewed in the context of the completed application.

The final integration versions were retained because they contained the later application-level changes required by the completed frontend/backend integration.

The resolved files were then staged and the merge was completed with a dedicated merge commit.

The resulting workflow was:

```text
Merge Branch
     ↓
Git Detects Conflicts
     ↓
Identify Conflicting Files
     ↓
Determine Correct Final Versions
     ↓
Stage Resolved Files
     ↓
Verify with git status
     ↓
Create Merge Commit
     ↓
Push Integrated main Branch
```

This demonstrated an important part of collaborative software development: merge conflicts are not simply errors to bypass; they require understanding which changes belong in the final application.

---

# 🖥️ Git Command-Line Workflow

The project was managed primarily through Git commands in the terminal.

Commands used during the development and integration process included:

```bash
git status
git add .
git commit -m "commit message"
git push origin <branch>
git switch <branch>
git log --oneline
git stash push -u -m "description"
git stash pop
git checkout --theirs <file>
git merge <branch>
git reset --hard HEAD
```

Each command served a specific role in the development workflow.

For example:

```bash
git status
```

was used frequently before commits and merges to verify the state of the working tree.

```bash
git log --oneline
```

was used to inspect development milestones and branch history.

```bash
git stash
```

was used when completed but uncommitted integration work needed to be preserved temporarily before changing branches.

```bash
git merge
```

was used to bring completed development branches together into the final `main` branch.

---

# 🛟 Recovering from an Interrupted Branch Switch

During the final version-control process, a branch switch was interrupted by a Windows file-locking issue while Git was attempting to update `HEAD`.

This resulted in the working tree and index being partially updated while Git still reported the previous branch as active.

Because the completed frontend work had already been committed and pushed to GitHub, the repository could safely be restored to the known commit using:

```bash
git reset --hard HEAD
```

After confirming:

```text
nothing to commit, working tree clean
```

the branch switch was attempted again successfully.

This experience reinforced several practical Git principles:

- Commit important work before risky repository operations.
- Push important milestones to the remote repository.
- Check `git status` before and after branch operations.
- Do not panic when the working tree unexpectedly changes.
- Understand the repository state before running recovery commands.
- Avoid destructive Git commands unless the desired work is already safely committed.
- Keep development servers and unnecessary repository processes stopped during important branch and merge operations when file locking may be a concern.

---

# 🔐 Protecting Environment Secrets in Git

Environment configuration was also handled as part of the version-control strategy.

Real environment files such as:

```text
client/.env
server/.env
```

are excluded from version control.

Safe templates are provided instead:

```text
client/.env.example
server/.env.example
```

Before the final commits, `git status` was explicitly reviewed to confirm that real `.env` files, `node_modules`, and frontend build output were not being staged.

This ensures that the public repository documents the required configuration without exposing private credentials.

---

# 📚 Version Control Learning Outcomes

Developing this project provided practical experience beyond simply writing application code.

The version-control workflow involved:

- Maintaining separate development branches.
- Creating incremental feature commits.
- Switching safely between branches.
- Using Git stash to preserve unfinished integration work.
- Understanding tracked, untracked, staged, and ignored files.
- Protecting environment credentials.
- Reading Git status and commit history.
- Recovering from an interrupted branch operation.
- Resolving merge conflicts.
- Creating merge commits.
- Combining independent development histories.
- Maintaining a stable `main` branch.
- Synchronising local branches with GitHub.

The final repository therefore serves not only as the source code for the pizza delivery application, but also as a record of the project's continuous development and integration process.

## Deployment & Hosting

The Pizza Delivery System was deployed as a full-stack application using separate cloud services for the frontend, backend API, and database.

### Deployment Architecture

The deployed system uses the following architecture:

**Frontend (React + Vite)** → **Vercel**  
**Backend (Node.js + Express)** → **Render**  
**Database (MongoDB)** → **MongoDB Atlas**

This separation allows the frontend, backend, and database to be deployed and managed independently while still communicating through secure network requests.

---

### MongoDB Atlas – Database

MongoDB Atlas is used as the cloud-hosted database.

During the initial backend configuration, a MongoDB Atlas connection string was created and stored in
the backend environment variables rather than being hard-coded into the application.

Example:

````env
MONGODB_URI=<MongoDB Atlas connection string>

#### Render Free-Tier Behaviour

The backend is currently deployed using Render's free hosting tier. Free-tier services can experience a
startup delay after periods of inactivity.

During this startup period, the frontend may temporarily appear to be waiting for a response because
authentication and other application functionality depend on the Render-hosted API.

The request flow is:

```text
Customer / Admin
       ↓
Vercel Frontend
       ↓
Render Backend API
       ↓
MongoDB Atlas


## 🌐 Live Deployment

The Pizza Delivery System has been deployed and can be tested using the links below.

### Customer Application
**Live Application:** https://oibsip-psi-orcin.vercel.app/login

Customers can register/login, browse the menu, build custom pizzas, manage their cart, complete checkout,
 use the test payment flow, and track their orders.

### Admin Application
**Live Application:** https://oibsip-psi-orcin.vercel.app/admin/login

The Admin application provides access to administrative functionality such as inventory management,
 order management, and updating customer order statuses.

> **Note:** The Customer and Admin applications are intentionally maintained as separate application experiences.
 They communicate with the same backend API and database but have separate authentication entry points.

**Note:** For security reasons, **administrator credentials are not publicly included in this repository or README**.
---

# 🔮 Potential Future Improvements

Outside the current internship submission scope, future development could include:

- Integration with a real supported payment provider.
- Production payment webhooks.
- Explicit deployment timezone configuration for scheduled jobs.
- Additional `Delivered` and `Cancelled` order statuses.
- Order archiving.
- Customer profile management.
- Customer address book.
- Push notifications.
- WebSocket-based real-time order updates.
- Sales analytics.
- Revenue reporting.
- Advanced administrator reporting.
- Cloud image storage.
- Production deployment and monitoring.

---

# 👨‍💻 Author

**Victor Sumbo**

Oasis Infobyte Internship Project

Full-Stack Pizza Delivery & Inventory Management Application
````
