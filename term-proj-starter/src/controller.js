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
  sendRedirectResponse,
  streamFile,
  getContentType,
  checkFileExists,
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
  getHomepageCss: async (request, response) => {
    const cssFilePath = path.join(__dirname, "homepageHelper.css");
    streamFile(cssFilePath, response, "text/css");
  },
  getFeedCss: async (request, response) => {
    const cssFilePath = path.join(__dirname, "getFeed.css");
    streamFile(cssFilePath, response, "text/css");
  },
  getProfilePicture: async (request, response) => {
    const profilePicturePath = path.join(
      __dirname,
      "photos",
      request.username,
      request.profile
    );
    try {
      const contentType = getContentType(profilePicturePath);

      streamFile(profilePicturePath, response, contentType);
    } catch (error) {
      console.error("Error accessing file:", error);
      response.writeHead(404);
      response.end("Profile picture not found.");
    }
  },
  feedImages: async (request, response) => {
    const profileImagePath = path.join(
      __dirname,
      "photos",
      request.username,
      request.photo
    );

    if (!(await checkFileExists(profileImagePath))) {
      response.writeHead(404);
      response.end();
      return;
    }

    await streamFile(
      profileImagePath,
      response,
      getContentType(profileImagePath)
    );
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
  refreshFeed: async (request, response) => {
    const scriptPath = path.join(__dirname, "getFeedHelper.js");
    streamFile(scriptPath, response, "application/javascript");
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
  redX: async (request, response) => {
    const redXPath = path.join(__dirname, "..", "..", "assets", "redX.png");
    streamFile(redXPath, response, "image/png");
  },
};

module.exports = controller;
