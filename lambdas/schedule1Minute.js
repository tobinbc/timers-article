"use strict";

const https = require("https");

module.exports.handler = async (event) => {
  console.log(JSON.stringify(event));
  return new Promise((resolve) => {
    https
      .get("https://encrypted.google.com/", (res) => {
        console.log("statusCode:", res.statusCode);
        console.log("headers:", res.headers);
        res.on("end", () => {
            resolve();
        });
      })
      .on("error", (e) => {
        console.error(e);
      })
      .end();
  });
};
