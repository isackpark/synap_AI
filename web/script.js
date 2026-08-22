// =========================================================
// SYNAP AI — FRONTEND CONTROLLER
// =========================================================


// =========================================================
// 1. HTML ELEMENTS
// =========================================================

const menuButton = document.getElementById("menuButton");
const sidebar = document.getElementById("sidebar");

const newChatButton = document.getElementById("newChatButton");
const recentButton = document.getElementById("recentButton");
const historyButton = document.getElementById("historyButton");
const themeButton = document.getElementById("themeButton");
const settingsButton = document.getElementById("settingsButton");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");
const messages = document.getElementById("messages");


// =========================================================
// 2. APPLICATION STATE
// =========================================================

let chatHistory = loadChats();

let currentChat = [];

let currentChatId = null;

let isSending = false;


// =========================================================
// 3. LOAD CHATS
// =========================================================

function loadChats() {

    try {

        const savedChats =
            localStorage.getItem("synapChats");

        if (!savedChats) {
            return [];
        }

        const chats = JSON.parse(savedChats);

        if (!Array.isArray(chats)) {
            return [];
        }

        return chats;

    } catch (error) {

        console.error(
            "SYNAP: Failed to load chats.",
            error
        );

        return [];
    }
}


// =========================================================
// 4. SAVE ALL CHATS
// =========================================================

function saveAllChats() {

    try {

        localStorage.setItem(
            "synapChats",
            JSON.stringify(chatHistory)
        );

    } catch (error) {

        console.error(
            "SYNAP: Failed to save chats.",
            error
        );

    }
}


// =========================================================
// 5. CREATE UNIQUE CHAT ID
// =========================================================

function createChatId() {

    return (
        Date.now().toString() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2, 9)
    );

}


// =========================================================
// 6. SIDEBAR MENU
// =========================================================

if (menuButton && sidebar) {

    menuButton.addEventListener(
        "click",
        function () {

            const hidden =
                sidebar.style.display === "none";

            sidebar.style.display =
                hidden ? "block" : "none";

        }
    );

}


// =========================================================
// 7. SHOW WELCOME SCREEN
// =========================================================

function showWelcome() {

    messages.innerHTML = `
        <div class="welcome">
            <h2>Welcome to SYNAP</h2>
            <p>Start a new conversation.</p>
        </div>
    `;

}


// =========================================================
// 8. START NEW CHAT
// =========================================================

function startNewChat() {

    currentChat = [];

    currentChatId = null;

    showWelcome();

    if (messageInput) {

        messageInput.value = "";

        messageInput.focus();

    }

}


// =========================================================
// 9. NEW CHAT BUTTON
// =========================================================

if (newChatButton) {

    newChatButton.addEventListener(
        "click",
        startNewChat
    );

}


// =========================================================
// 10. CREATE CURRENT CHAT IF NEEDED
// =========================================================

function ensureCurrentChat() {

    if (!currentChatId) {

        currentChatId =
            createChatId();

    }

}


// =========================================================
// 11. ADD MESSAGE TO UI
// =========================================================

function addMessageToScreen(
    text,
    role
) {

    const message =
        document.createElement("div");


    if (role === "user") {

        message.className =
            "synap-user-message";

    } else {

        message.className =
            "synap-ai-message";

    }


    message.textContent = text;


    messages.appendChild(message);


    messages.scrollTop =
        messages.scrollHeight;


    return message;
}


// =========================================================
// 12. SAVE CURRENT CHAT
// =========================================================

function saveCurrentChat() {

    if (
        !currentChatId ||
        currentChat.length === 0
    ) {

        return;

    }


    const firstUserMessage =
        currentChat.find(
            message =>
                message.role === "user"
        );


    const title =
        firstUserMessage
            ? firstUserMessage.message
                .trim()
                .substring(0, 50)
            : "New Chat";


    const chat = {

        id: currentChatId,

        title: title,

        messages: currentChat,

        updatedAt: Date.now()

    };


    const existingIndex =
        chatHistory.findIndex(
            item =>
                item.id === currentChatId
        );


    if (existingIndex >= 0) {

        chatHistory[existingIndex] =
            chat;

    } else {

        chatHistory.push(chat);

    }


    // Newest chats first

    chatHistory.sort(
        (a, b) =>
            (b.updatedAt || 0) -
            (a.updatedAt || 0)
    );


    saveAllChats();

}


// =========================================================
// 13. SEND MESSAGE
// =========================================================

async function sendMessage() {

    // Prevent duplicate requests

    if (isSending) {
        return;
    }


    if (!messageInput) {
        return;
    }


    const text =
        messageInput.value.trim();


    if (!text) {
        return;
    }


    ensureCurrentChat();


    isSending = true;


    // Disable send button

    if (sendButton) {

        sendButton.disabled = true;

    }


    // =====================================================
    // USER MESSAGE
    // =====================================================

    addMessageToScreen(
        text,
        "user"
    );


    // =====================================================
    // SAVE USER MESSAGE
    // =====================================================

    currentChat.push({

        role: "user",

        message: text,

        time: new Date().toISOString()

    });


    messageInput.value = "";


    // =====================================================
    // THINKING INDICATOR
    // =====================================================

    const thinking =
        addMessageToScreen(
            "SYNAP is thinking...",
            "assistant"
        );


    try {

        // =================================================
        // SEND TO FLASK BACKEND
        // =================================================

        const response =
            await fetch(
                "/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        message: text

                    })

                }
            );


        // =================================================
        // READ BACKEND RESPONSE
        // =================================================

        let data;

        try {

            data =
                await response.json();

        } catch {

            throw new Error(
                "Backend returned invalid JSON."
            );

        }


        // =================================================
        // BACKEND ERROR
        // =================================================

        if (!response.ok) {

            throw new Error(
                data.error ||
                `Backend error: ${response.status}`
            );

        }


        // Remove thinking indicator

        if (thinking) {

            thinking.remove();

        }


        // =================================================
        // CHECK AI RESPONSE
        // =================================================

        if (!data.reply) {

            throw new Error(
                "AI returned an empty response."
            );

        }


        // =================================================
        // SHOW AI RESPONSE
        // =================================================

        addMessageToScreen(
            data.reply,
            "assistant"
        );


        // =================================================
        // SAVE AI RESPONSE
        // =================================================

        currentChat.push({

            role: "assistant",

            message: data.reply,

            time: new Date().toISOString()

        });


        // =================================================
        // SAVE COMPLETE CONVERSATION
        // =================================================

        saveCurrentChat();


    } catch (error) {

        console.error(
            "SYNAP ERROR:",
            error
        );


        if (
            thinking &&
            thinking.parentNode
        ) {

            thinking.remove();

        }


        addMessageToScreen(
            "SYNAP could not connect to the AI.\n\n" +
            error.message,
            "assistant"
        );


    } finally {

        isSending = false;


        if (sendButton) {

            sendButton.disabled = false;

        }


        messageInput.focus();

    }

}


// =========================================================
// 14. SEND BUTTON
// =========================================================

if (sendButton) {

    sendButton.addEventListener(
        "click",
        sendMessage
    );

}


// =========================================================
// 15. ENTER TO SEND
// =========================================================

if (messageInput) {

    messageInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage();

            }

        }
    );

}


// =========================================================
// 16. SHOW CHAT HISTORY
// =========================================================

function showChatHistory() {

    messages.innerHTML = "";


    const heading =
        document.createElement("h2");

    heading.textContent =
        "Recent Chats";

    heading.style.marginBottom =
        "20px";

    messages.appendChild(
        heading
    );


    // No chats

    if (chatHistory.length === 0) {

        const empty =
            document.createElement("p");

        empty.textContent =
            "No chats yet.";

        empty.style.color =
            "#888";

        messages.appendChild(
            empty
        );

        return;
    }


    // =====================================================
    // DISPLAY CHATS
    // =====================================================

    chatHistory.forEach(
        function (chat) {

            const item =
                document.createElement("div");

            item.className =
                "chat-history-item";


            const title =
                document.createElement("div");

            title.textContent =
                chat.title ||
                "New Chat";


            const count =
                document.createElement("small");

            count.textContent =
                `${chat.messages.length} messages`;


            item.appendChild(title);

            item.appendChild(count);


            item.addEventListener(
                "click",
                function () {

                    loadChat(chat.id);

                }
            );


            messages.appendChild(item);

        }
    );

}


// =========================================================
// 17. RECENT CHATS
// =========================================================

if (recentButton) {

    recentButton.addEventListener(
        "click",
        showChatHistory
    );

}


// =========================================================
// 18. CHAT HISTORY
// =========================================================

if (historyButton) {

    historyButton.addEventListener(
        "click",
        showChatHistory
    );

}


// =========================================================
// 19. LOAD EXISTING CHAT
// =========================================================

function loadChat(chatId) {

    const chat =
        chatHistory.find(
            item =>
                item.id === chatId
        );


    if (!chat) {

        console.error(
            "SYNAP: Chat not found."
        );

        return;

    }


    currentChatId =
        chat.id;


    currentChat =
        Array.isArray(chat.messages)
            ? [...chat.messages]
            : [];


    messages.innerHTML = "";


    currentChat.forEach(
        function (item) {

            addMessageToScreen(
                item.message,
                item.role
            );

        }
    );


    messages.scrollTop =
        messages.scrollHeight;

}


// =========================================================
// 20. LOAD THEME
// =========================================================

function loadTheme() {

    const savedTheme =
        localStorage.getItem(
            "synapTheme"
        );


    if (savedTheme === "light") {

        document.body.classList.add(
            "light-theme"
        );

    } else {

        document.body.classList.remove(
            "light-theme"
        );

    }

}


// =========================================================
// 21. THEME SWITCH
// =========================================================

if (themeButton) {

    themeButton.addEventListener(
        "click",
        function () {

            document.body.classList.toggle(
                "light-theme"
            );


            const lightMode =
                document.body.classList.contains(
                    "light-theme"
                );


            localStorage.setItem(
                "synapTheme",
                lightMode
                    ? "light"
                    : "dark"
            );

        }
    );

}


// =========================================================
// 22. SETTINGS
// =========================================================

if (settingsButton) {

    settingsButton.addEventListener(
        "click",
        function () {

            alert(
                "SYNAP AI Settings\n" +
                "Version: 1.0.0\n" +
                "Backend: Flask\n" +
                "AI: Online API"
            );

        }
    );

}


// =========================================================
// 23. INITIALIZE APPLICATION
// =========================================================

function init() {

    // Load saved theme

    loadTheme();


    // Show welcome screen

    if (currentChat.length === 0) {

        showWelcome();

    }


    // Focus input

    if (messageInput) {

        messageInput.focus();

    }

}


// =========================================================
// START SYNAP
// =========================================================

document.addEventListener(
    "DOMContentLoaded",
    init
);
