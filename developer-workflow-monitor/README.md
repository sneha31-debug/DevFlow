# Developer Workflow Monitoring Platform

This platform helps developers test, monitor, and debug their APIs from one place.
It combines Postman-like API testing, Uptime Monitoring, and Logging into a single dashboard.

## 🚀 Features

-   **API Testing**: Send requests and view responses (like Postman).
-   **Uptime Monitoring**: Automatically check API availability and latency.
-   **Logs**: Centralized logging for debug and analysis.

## 📂 Project Structure

-   `client/`: React + Vite + TypeScript frontend.
-   `server/`: Node.js + Express + TypeScript backend.
-   `database/`: Database assets and configuration.

## 🛠️ Getting Started

### Prerequisites

-   Node.js (v18+)
-   Docker (optional, for MongoDB)

### Running Locally

1.  **Clone the repo**
2.  **Start the Server**:
    ```bash
    cd server
    npm install
    npm run dev
    ```
3.  **Start the Client**:
    ```bash
    cd client
    npm install
    npm run dev
    ```

## 🐳 Docker

Run the entire stack with:
```bash
docker-compose up -d
```
