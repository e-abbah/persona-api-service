# persona-api-service


A backend service that enriches a user’s name using external APIs, classifies the data, and stores structured profiles and support filtering..

---

## 🚀 Features

- Accepts a name and enriches it using external APIs
- Integrates:
  - Genderize API
  - Agify API
  - Nationalize API
- Classifies:
  - Age group (child, teenager, adult, senior)
- Prevents duplicate entries (idempotency)
- Stores profiles in-memory using Maps
- Supports filtering, retrieval, and deletion
- Fully RESTful API design
- CORS enabled for external access

---

## 🧠 Tech Stack

- Node.js
- Express.js
- installed the UUID v7 module
- Native Fetch API
- In-memory data store (Map)

---

## 📡 External APIs Used

- Genderize → https://api.genderize.io?name={name}
- Agify → https://api.agify.io?name={name}
- Nationalize → https://api.nationalize.io?name={name}

---

## 📌 API Endpoints

---

### 1️⃣ Create Profile

**POST** `/api/profiles`

Request Body:
```json
{
  "name": "ella"
}
