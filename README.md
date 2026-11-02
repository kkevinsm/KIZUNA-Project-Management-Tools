# Kizuna Project Management Tools (Asana.com Clone)

A pixel-perfect, dark-themed duplicate of [Asana.com](https://asana.com) built for streamlined, beautiful project management with Cloudflare R2 object storage integration.

---

## ✨ Features Replicated

1. **Pixel-Perfect Asana Dark Theme UI/UX**:
   - Matches the exact Asana charcoal dark palette (`#1e1f21` base, `#151617` rail, `#252628` cards, `#4573d2` blue accents, `#f06a6a` coral create button).
   - Far-left navigation rail (Work, Agents, Strategy, Knowledge, People, More, Help, KS Avatar).
   - Collapsible left sidebar navigation with active highlight, unread badges, and 14-day trial status widget.
   - Global top navigation with Quick Search and "Work with Dash" AI assistant.

2. **Core Workflows**:
   - **Home View**: "Good morning, Kevin", upcoming tasks summary with filter pills (Upcoming, Overdue, Completed), recent projects cards, and "Learn Asana" interactive card carousel.
   - **My Tasks View**: Grouped sections ("Recently assigned", "Do today", "Do next week", "Do later"), inline task creation, completion toggles, sorting/filtering.
   - **Project Detail View**: Multi-view support for projects:
     - 📋 **List View**: Columns for Name, Assignee, Due Date, Priority (`Low`, `Medium`, `High`), Status (`On track`, `At risk`, `Off track`).
     - 📌 **Board View**: Interactive Kanban columns ("To do", "Doing", "Done") with instant column transitions.
     - 📅 **Calendar View**: Month grid plotting deadlines and task schedules.
     - 📊 **Dashboard View**: Real-time project health metrics, status breakdown, and priority distribution.
     - 📁 **Files View**: Project assets and file manager.
     - 🗺️ **Overview View**: Project summary, ownership, and milestones.
   - **Slide-over Task Details Drawer**:
     - Complete/incomplete toggle
     - Assignee switcher & Due date editor
     - Priority & Status selectors
     - Rich description
     - Subtasks with progress count
     - **Cloudflare R2 File Attachments**
     - Activity & comments feed with timestamps
   - **Bottom "Explore your project" widget**:
     - Progress bar (1 of 8 completed) and quick action pill buttons.

3. **Cloudflare R2 Storage Integration**:
   - Native S3-compatible integration using `@aws-sdk/client-s3`.
   - File uploads, downloads, and deletions directly via Next.js API route `/api/storage`.
   - Built-in graceful fallback simulation when running locally before credentials are added.

---

## 🚀 Cloudflare R2 Configuration

To connect your Cloudflare R2 bucket:

1. In your **Cloudflare Dashboard**, navigate to **R2 Storage**.
2. Create a bucket (e.g. `kizuna-storage`).
3. Click **Manage R2 API Tokens** and create a token with `Object Read & Write` permissions.
4. Copy your **Account ID**, **Access Key ID**, and **Secret Access Key**.
5. Set the values in `.env.local` (or in Vercel Project Settings > Environment Variables):

```bash
CLOUDFLARE_R2_ACCOUNT_ID="your_cloudflare_account_id"
CLOUDFLARE_R2_ACCESS_KEY_ID="your_r2_access_key_id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your_r2_secret_access_key"
CLOUDFLARE_R2_BUCKET_NAME="your_bucket_name"
CLOUDFLARE_R2_PUBLIC_URL="https://pub-yourbucket.r2.dev" # Optional custom domain or public URL
```

---

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🚢 Deployment to Vercel

```bash
# Build production bundle
npm run build

# Deploy to Vercel
vercel deploy --prod
```

Or connect the repository `https://github.com/kkevinsm/KIZUNA-Project-Management-Tools.git` directly to Vercel for automatic CI/CD deployments.

