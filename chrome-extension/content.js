console.log("popup.js loaded");

const chatBox = document.getElementById("chat-history");
const questionInput = document.getElementById("question");
const sendBtn = document.getElementById("send");
const videoIdDiv = document.getElementById("video-id");

let videoId = null;
let history = [];

/* Extract videoId */
function extractVideoId(url) {
    if (!url) return null;

    let m = url.match(/[?&]v=([^?&]+)/);
    if (m) return m[1];

    m = url.match(/youtu\.be\/([^?&]+)/);
    if (m) return m[1];

    m = url.match(/shorts\/([^?&]+)/);
    if (m) return m[1];

    return null;
}

/* Detect active tab */
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    videoId = extractVideoId(tab?.url);

    if (videoId) {
        videoIdDiv.innerText = `🎥 Video ID: ${videoId}`;
        chrome.storage.local.set({ videoId });
    } else {
        videoIdDiv.innerText = "❌ Not a YouTube video";
    }
});

/* Load history SAFELY */
chrome.storage.local.get({ chatHistory: [] }, (res) => {
    history = res.chatHistory;
    history.forEach(addMessage);
});

/* SEND BUTTON — NOW IT WORKS */
sendBtn.addEventListener("click", async () => {
    console.log("Send clicked");

    const query = questionInput.value.trim();
    if (!query || !videoId) return;

    addMessage({ role: "user", text: query });
    history.push({ role: "user", text: query });
    questionInput.value = "";

    try {
        const res = await fetch("http://127.0.0.1:5000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, videoId })
        });

        const data = await res.json();

        addMessage({ role: "bot", text: data.answer });
        history.push({ role: "bot", text: data.answer });

        chrome.storage.local.set({ chatHistory: history });
    } catch (e) {
        addMessage({ role: "bot", text: "❌ Backend error" });
        console.error(e);
    }
});

/* Render message */
function addMessage(msg) {
    const div = document.createElement("div");
    div.className = `message ${msg.role}`;
    div.innerText = `${msg.role === "user" ? "You" : "Bot"}: ${msg.text}`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}
