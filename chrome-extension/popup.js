const videoDiv = document.getElementById("video-id");
const chatDiv = document.getElementById("chat-history");

const input = document.getElementById("question");
const sendBtn = document.getElementById("send");

let videoId = null;

// Load videoId from storage
chrome.storage.local.get("videoId", (res) => {
    if (res.videoId) {
        videoId = res.videoId;
        videoDiv.innerText = `🎥 Video ID: ${videoId}`;
    } else {
        videoDiv.innerText = "❌ No YouTube video detected";
    }
});

// Send question
sendBtn.addEventListener("click", async () => {
    const query = input.value.trim();
    if (!query || !videoId) return;

    addMessage("You", query);
    input.value = "";

    try {
        const res = await fetch("http://127.0.0.1:5000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query, videoId })
        });

        const data = await res.json();
        addMessage("Bot", data.answer || JSON.stringify(data));
    } catch (err) {
        addMessage("Bot", "❌ Backend error");
    }
});

// Chat only in memory (auto-clears)
function addMessage(sender, text) {
    const div = document.createElement("div");
    div.className = sender === "You" ? "user" : "bot";
    div.innerText = `${sender}: ${text}`;
    chatDiv.appendChild(div);
    chatDiv.scrollTop = chatDiv.scrollHeight;
}
