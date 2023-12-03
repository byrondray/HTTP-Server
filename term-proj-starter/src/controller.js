const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
const {
  readJsonFile,
  getQueryParam,
  writeUserData,
  findUserByUsername,
  renderTemplate,
  initializeForm,
  processUploadedFile,
  sendErrorResponse,
  sendRedirectResponse,
  deletePhoto,
} = require("./controllerHelper.js");

const controller = {
  getHomePage: async (request, response) => {
    try {
      const users = await readJsonFile("../database/data.json");

      const str = await renderTemplate("homepageHelper.ejs", { users: users });

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(str);
    } catch (err) {
      console.error("Error:", err);
      response.writeHead(500, DEFAULT_HEADER);
      response.end("Server error");
    }
  },

  getFeed: async (request, response) => {
    try {
      const username = getQueryParam(
        request.url,
        "username",
        request.headers.host
      );
      const users = await readJsonFile("../database/data.json");
      const user = findUserByUsername(users, username);

      if (!user) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("User not found");
        return;
      }

      const str = await renderTemplate("getFeed.ejs", { user: user });

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(str);
    } catch (err) {
      console.error("Error:", err);
      response.writeHead(500, DEFAULT_HEADER);
      response.end("Server error");
    }
  },

  uploadImages: async (request, response) => {
    const username = getQueryParam(
      request.url,
      "username",
      request.headers.host
    );
    const form = initializeForm(path.join(__dirname, "photos", username));

    form.parse(request, async (err, fields, files) => {
      if (err) {
        sendErrorResponse(response, "Error uploading file.");
        return;
      }

      try {
        await processUploadedFile(files, username);
        sendRedirectResponse(response, `/feed?username=${username}`);
      } catch (fileErr) {
        console.error(fileErr);
        sendErrorResponse(response, "Error processing the uploaded image.");
      }
    });
  },
  deleteImage: async (request, response) => {
    const username = getQueryParam(
      request.url,
      "username",
      request.headers.host
    );
    const photo = getQueryParam(request.url, "photo", request.headers.host);

    try {
      const users = await readJsonFile();
      const user = findUserByUsername(users, username);

      if (user && user.photos.includes(photo)) {
        await deletePhoto(username, photo, user);

        await writeUserData(users);

        response.writeHead(200, { "Content-Type": "text/plain" });
        response.end("Image deleted successfully");
      } else {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("User or photo not found");
      }
    } catch (err) {
      console.error(err);
      response.writeHead(500, { "Content-Type": "text/plain" });
      response.end("Server error during image deletion");
    }
  },
  getSettings: async (request, response) => {
    try {
      const str = await renderTemplate("settings.ejs", {}); 

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(str);
    } catch (err) {
      console.error("Error:", err);
      response.writeHead(500, DEFAULT_HEADER);
      response.end("Server error");
    }
  },
  getGallery: async (request, response) => {
    try {
      const username = getQueryParam(
        request.url,
        "username",
        request.headers.host
      );
      const users = await readJsonFile("../database/data.json");
      const user = findUserByUsername(users, username);

      if (!user) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("User not found");
        return;
      }

      const str = await renderTemplate("gallery.ejs", { user });

      response.writeHead(200, { "Content-Type": "text/html" });
      response.end(str);
    } catch (err) {
      console.error("Error:", err);
      response.writeHead(500, DEFAULT_HEADER);
      response.end("Server error");
    }
  },
};

module.exports = controller;
