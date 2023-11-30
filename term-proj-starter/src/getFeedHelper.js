document.addEventListener("DOMContentLoaded", (event) => {
  document.querySelectorAll(".red-x").forEach((item) => {
    item.addEventListener("click", function (e) {
      e.preventDefault();
      const galleryItem = this.closest(".gallery-item");
      const username = this.dataset.username;
      const photo = this.dataset.photo;
      console.log(username, photo);

      // Create a new XMLHttpRequest
      const xhr = new XMLHttpRequest();
      xhr.open("DELETE", `/delete/{username}/{photo}`, true);

      xhr.onload = function () {
        // Check if the request was successful
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("Image deleted successfully");
          galleryItem.remove(); // Remove the gallery item from the DOM
        } else {
          console.error("Error deleting image");
        }
      };

      xhr.onerror = function () {
        // Handle network errors
        console.error("Network error:", xhr.statusText);
      };

      // Send the request
      xhr.send();
    });
  });
});
