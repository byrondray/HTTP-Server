const fs = require("fs/promises");
const path = require("path");

const readJson = () => {
  const jsonPath = path.join(__dirname, "..", "database", "data.json");
  fs.readFile(jsonPath, "utf8")
    .then((users) => JSON.parse(users))
};

const users = readJson();
console.log(users);

module.exports = { readJson };
