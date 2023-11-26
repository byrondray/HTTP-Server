const fs = require("fs");
const { DEFAULT_HEADER } = require("./util/util");
const path = require("path");
var qs = require("querystring");
const {
  readJsonFile,
  getQueryParam,
  processUsersData,
} = require("./controllerHelper.js");
const ejs = require("ejs");

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
      console.log(username);
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

  uploadImages: (request, response) => {},
};

module.exports = controller;
