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

chrome.tabs.onUpdated.addListener((_, __, tab) => {
    const videoId = extractVideoId(tab.url);
    if (videoId) {
        chrome.storage.local.set({ videoId });
        console.log("Stored videoId:", videoId);
    }
});
