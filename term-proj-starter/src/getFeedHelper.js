function refreshFeed(username) {
    fetch(`/gallery?username=${username}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            "Network response was not ok " + response.statusText
          );
        }
        return response.text();
      })
      .then((html) => {
        const container = document.querySelector(".gallery");
        if (container) {
          container.innerHTML = html;
        } else {
          throw new Error("Gallery was not found.");
        }
      })
      .catch((err) => console.error("Error fetching feed data:", err));
  }
  
  function setupFeedRefresh(currentUsername) {
    setInterval(() => refreshFeed(currentUsername), 4000);
  }
  