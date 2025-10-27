# TODO List for Chat Interface Implementation

- [x] Create ChatPage.js component in frontend/src/pages/ with:
  - Branding "Edubot" at the top.
  - Sidebar for "New Chat" button and previous chat history (stored in localStorage).
  - Main chat area displaying messages (user and bot).
  - Textarea for input and send button.
  - Interactive animations (e.g., typing indicator, message fade-in).
- [x] Update App.js to add a new route "/chat" for ChatPage.
- [x] Modify LoginPage.js to navigate to "/chat" on successful login (simulate success).
- [x] Implement backend API in app.py for chat responses.
- [ ] Test the app by running `npm start` in frontend/.
