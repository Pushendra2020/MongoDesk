# AI Meeting Notes Summarizer

A full-stack application designed to streamline the process of summarizing and sharing meeting transcripts. This tool leverages the power of Google's Gemini AI to generate concise, relevant summaries based on user-provided transcripts and instructions.

**Live Demo:** `[Link to your deployed application]`

## Features

-   **Transcript Analysis**: Paste or upload meeting transcripts directly into the application.
-   **Custom Instructions**: Guide the AI by providing specific prompts (e.g., "highlight action items," "summarize for an executive audience").
-   **AI-Powered Summaries**: Generate structured and relevant summaries with a single click using the Gemini AI model.
-   **Interactive Editing**: Easily edit the generated summary to make corrections or add notes before finalizing.
-   **Email Sharing**: Share the final summary with meeting participants by entering their email addresses.
-   **Conversation History**: Users can create multiple conversations, and all chat history is saved and can be revisited.

## Tech Stack

This project is built with a modern MERN-like stack:

-   **Frontend**:
    -   **Framework**: React
    -   **Build Tool**: Vite
    -   **Styling**: Tailwind CSS
-   **Backend**:
    -   **Runtime**: Node.js
    -   **Framework**: Express.js
-   **Database**:
    -   **DB**: MongoDB (with Mongoose ODM)
-   **AI Service**:
    -   **Model**: Google Gemini AI
-   **Authentication**:
    -   JWT (JSON Web Tokens)




## Local Setup and Installation

To run this project on your local machine, follow these steps:

### Prerequisites

-   Node.js (v18 or later)
-   MongoDB instance (local or cloud-based like MongoDB Atlas)
-   API Key for Google Gemini
-   SMTP credentials for email sharing (e.g., Mailtrap, SendGrid)

### 1. Clone the Repository

```bash
git clone [https://github.com/your-username/ai-notes.git](https://github.com/your-username/ai-notes.git)
cd ai-notes





# Navigate to the server directory
cd server

# Install dependencies
npm install

# Create a .env file in the /server directory
touch .env