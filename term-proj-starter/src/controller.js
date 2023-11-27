const fs = require("fs/promises");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const {
  readJsonFile,
  getQueryParam,
  processUsersData,
} = require("./controllerHelper.js");
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
      const users = await processUsersData("../database/data.json");
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

  // uploadImages: async (request, response) => {
  //   const form = formidable({});

  //   form.uploadDir = path.join(__dirname, "photos", "john123");
  //   form.keepExtensions = true;

  //   form.parse(request, (err, fields, files) => {
  //     if (err) {
  //       response.writeHead(500, { "Content-Type": "text/plain" });
  //       response.end("Error uploading file.");
  //       return;
  //     }
  //     const oldPath = files.upload[0].filepath;
  //     const newPath = path.join(form.uploadDir, files.upload[0].originalFilename);

  //     fs.rename(oldPath, newPath, (err) => {
  //       if (err) {
  //         response.writeHead(500, { "Content-Type": "text/plain" });
  //         response.end("Error moving file.");
  //         return;
  //       }
  //       response.writeHead(200, { "Content-Type": "image/png" });
  //       response.write("File uploaded successfully");
  //       response.end("Image uploaded successfully");
  //     });

  //   });
  //   try {
  //     // Read the current JSON file
  //     const users = processUsersData();
  //     const username = "john123";

  //     // Find the user and add the new image path
  //     const user = users.find(u => u.username === username);
  //     if (user) {
  //       user.photos.push(filename); // Add new filename to the photos array
  //     }

  //     // Write the updated users back to the file
  //     await fs.writeFile(path.join(__dirname, "..", 'database', 'data.json'), JSON.stringify(users, null, 2), 'utf8');

  //     response.writeHead(200, { "Content-Type": "image/png" });
  //     response.end("Image uploaded successfully");
  //   } catch (fileErr) {
  //     response.writeHead(500, { "Content-Type": "text/plain" });
  //     response.end("Error updating user photos.");
  //   }
  // },
  uploadImages: async (request, response) => {
    const form = formidable({});
    const username = "john123"; // This should be dynamically determined, e.g., from the session or request body.

    form.uploadDir = path.join(__dirname, "photos", username);
    form.keepExtensions = true;

    form.parse(request, async (err, fields, files) => {
      if (err) {
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error uploading file.");
        return;
      }
      const oldPath = files.upload[0].filepath;
      const filename = files.upload[0].originalFilename; // filename needs to be declared here
      const newPath = path.join(form.uploadDir, filename);

      try {
        await fs.rename(oldPath, newPath);

        const users = await processUsersData("../database/data.json");

        const user = users.find((u) => u.username === username);
        if (user) {
          user.photos.push(filename); // Add new filename to the photos array
        }

        await fs.writeFile(
          path.join(__dirname, "..", "database", "data.json"),
          JSON.stringify(users, null, 2),
          "utf8"
        );

        response.writeHead(200, { "Content-Type": "image/png" });
        response.end("Image uploaded successfully");
      } catch (fileErr) {
        console.error(fileErr);
        response.writeHead(500, { "Content-Type": "text/plain" });
        response.end("Error processing the uploaded image.");
      }
    });
  },
};

module.exports = controller;
