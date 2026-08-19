
# SYNAP AI — Project Notes

## 1. What is SYNAP?

SYNAP AI is a web-based AI assistant.

It uses:

- HTML
- CSS
- JavaScript
- Python
- Flask
- Groq API

---

## 2. Project Structure

```text
SYNAP_AI/
│
├── web/
│   ├── index.html
│   ├── style.css
│   └── script.js
│
├── main.py
├── models.py
├── SYNAP_NOTES.md
├── .gitignore
└── .env


---

### 3. Frontend

index.html

HTML creates the structure of the application.

It contains things such as:

Sidebar

New Chat

Recent Chats

Chat History

Settings

Message area

Input box

Send button


style.css

CSS controls the appearance.

It controls:

Colors

Fonts

Background

Buttons

Sidebar

Message bubbles

Spacing

Themes


User messages are displayed on the right.

AI messages are displayed on the left.

script.js

JavaScript controls the behaviour of the frontend.

It handles:

Sending messages

New Chat

Recent Chats

Chat History

Loading chats

Theme

Settings

LocalStorage

Communication with the backend



---

### 4. Backend

main.py

Python Flask is the backend of SYNAP.

Its main jobs are:

1. Start the server.


2. Receive messages from the frontend.


3. Send messages to Groq.


4. Receive the AI response.


5. Return the response to the frontend.



Main endpoint:

POST /chat


---

### 5. AI Connection

SYNAP uses Groq API to access an AI model.

The basic flow is:

User ↓ Frontend ↓ JavaScript ↓ Flask ↓ Groq API ↓ AI Model ↓ Flask ↓ Frontend


---

### 6. Environment Variables

The .env file stores private information such as the Groq API key.

Example:

GROQ_API_KEY=YOUR_API_KEY
GROQ_MODEL=openai/gpt-oss-120b

The .env file must not be uploaded to GitHub.


---

### 7. models.py

models.py is a testing tool.

It is used to check which AI models are available through the Groq API.

It is not the AI model itself.


---

### 8. Chat History

SYNAP uses browser LocalStorage to save chat history.

This means chats can remain available after refreshing or reopening the page.

LocalStorage is local to the browser/device. It is not an online database.


---

### 9. GitHub

GitHub is used to store and manage the SYNAP source code.

The project repository is:

synap_AI

The .gitignore file prevents private files such as .env from being uploaded.


---

### 10. Important Problems Fixed

User messages were not on the right

CSS alignment was fixed using:

align-self: flex-end;
margin-left: auto;

AI was not responding

The backend was working, but the selected model returned:

404 model_not_found

We checked available models using models.py and selected an available model.


---

### 11. Core Architecture

HTML
↓
Structure

CSS
↓
Appearance

JavaScript
↓
Behaviour

Python + Flask
↓
Backend

Groq API
↓
AI Service


---

## 12. Main Explanation

SYNAP AI is a web application built with HTML, CSS and JavaScript for the frontend, Python Flask for the backend, and Groq API for the AI service.

The user sends a message through the frontend. JavaScript sends the message to Flask using an HTTP POST request. Flask sends the message to the AI model through Groq. The AI response is then returned to the frontend and displayed in the chat interface.