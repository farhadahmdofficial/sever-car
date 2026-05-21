
# 🖥️ DriveFleet Server | Production API Gateway

This is the secure, serverless backend core for **DriveFleet** (Premium Car Rental Service). It manages the MongoDB Atlas cloud instances, processes vehicle telemetry logging, and coordinates authentication states.

🔗 **Production API Endpoint:** Active on Vercel
🔗 **Frontend Interface Node:** [https://font-car-rental.vercel.app/](https://font-car-rental.vercel.app/)

---

## 🛠️ Technologies & Tools Used

- ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) — Backend runtime engine.
- ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) — Minimalist web framework for routing.
- ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) — NoSQL Cloud Database via MongoDB Atlas.
- ![Better Auth](https://img.shields.io/badge/Better_Auth-FF4154?style=for-the-badge&logo=auth0&logoColor=white) — Server-side Identity Management & Session Handlers.
- ![Cors](https://img.shields.io/badge/CORS-Secure-orange?style=for-the-badge) — Cross-Origin Resource Sharing payload firewall.
- ![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white) — Serverless Edge Function Deployment.

---

## 🔒 Security Gateways & CORS Matrix

The backend enforces tight CORS (Cross-Origin Resource Sharing) matrices to ensure data stream integrity. 
* Requests are tightly bound to authorize incoming traffic from `https://font-car-rental.vercel.app` and local audit ports (`http://localhost:3000`).
* Database clusters are locked down. Ensure your MongoDB Atlas **Network Access Control List (ACL)** permits access from everywhere (`0.0.0.0/0`) to work seamlessly with serverless Vercel deployments.

---

## 📡 API Architecture Nodes (Endpoints)

### 🗂️ Core Matrix Route: `/`
* `GET /` — Returns current Server Diagnostics, connection verification, and Node online pulse.

### 🚙 Vehicle Log Matrix: `/cars`
* `GET /cars` — Fetches all premium automotive logs from the MongoDB cluster.
* `GET /cars/:id` — Fetches individual vehicle matrix log via unique Object ID.
* `POST /cars` — Appends a new vehicle node to the fleet database *(Admin Restrictive)*.
* `PUT /cars/:id` — Modifies parameters of an existing vehicle telemetry slot.
* `DELETE /cars/:id` — Purges a specific vehicle node from the tracking block.

### 🔑 Identity & Authorization: `/api/auth`
* Handled seamlessly through **Better Auth** core routines, capturing Google OAuth callback tokens and establishing cryptographic user logs.

---

## 📦 Directory Matrix Structure

```text
drivefleet-server/
├── api/                    # Vercel Serverless Server Directory
│   └── index.js            # Main Express entry point & middleware injector
├── config/                 # Database initialization nodes
│   └── mongodb.js
├── models/                 # Database Document Schemas
│   └── Car.js
├── .env                    # Hidden Environment Gateway Keys
├── package.json            # Application dependencies manifest
└── README.md               # Telemetry documentation











