const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
const { readJsonFile, getQueryParam } = require("./controllerHelper.js");
const ejs = require("ejs");
const { formidable } = require("formidable");

const controller = {
  getHomePage: async (request, response) => {
    try {
      const users = await readJsonFile("../database/data.json");

      const str = await ejs.renderFile(
        path.join(__dirname, "homepageHelper.ejs"),
        { users: users }
      );

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
      const user = users.find((u) => u.username === username);

      if (!user) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("User not found");
        return;
      }

      const str = await ejs.renderFile(path.join(__dirname, "getFeed.ejs"), {
        user: user,
      });

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
    const form = formidable({});
    form.uploadDir = path.join(__dirname, "photos", username);
    form.keepExtensions = true;

    form.parse(request, async (err, fields, files) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error uploading file.");
        return;
      }
      const oldPath = files.upload[0].filepath;
      const filename = files.upload[0].originalFilename;
      const newPath = path.join(form.uploadDir, filename);

      try {
        await fs.rename(oldPath, newPath);

        const users = await readJsonFile("../database/data.json");

        const user = users.find((u) => u.username === username);
        if (user) {
          user.photos.push(filename);
        }

        await fs.writeFile(
          path.join(__dirname, "..", "database", "data.json"),
          JSON.stringify(users, null, 2),
          "utf8"
        );

        response.writeHead(302, { Location: `/feed?username=${username}` });
        response.end();
      } catch (fileErr) {
        console.error(fileErr);
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error processing the uploaded image.");
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

    console.log(username, photo);
    try {
      const users = await readJsonFile("../database/data.json");
      const user = users.find((u) => u.username === username);

      if (user && user.photos.includes(photo)) {
        const photoIndex = user.photos.indexOf(photo);
        user.photos.splice(photoIndex, 1);

        await fs.unlink(path.join(__dirname, "photos", username, photo));

        await fs.writeFile(
          path.join(__dirname, "..", "database", "data.json"),
          JSON.stringify(users, null, 2),
          "utf8"
        );

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
    const str = await ejs.renderFile(path.join(__dirname, "settings.ejs"));

    response.writeHead(200, { "Content-Type": "text/html" });
    response.end(str);
  },
  getGallery: async (request, response) => {
    try {
      const username = getQueryParam(
        request.url,
        "username",
        request.headers.host
      );
      const users = await readJsonFile("../database/data.json");
      const user = users.find((u) => u.username === username);

      if (!user) {
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("User not found");
        return;
      }

      const str = await ejs.renderFile(path.join(__dirname, "gallery.ejs"), {
        user: user,
      });

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
