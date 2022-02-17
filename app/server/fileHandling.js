import { Files } from "/imports/db/collections";
import { Meteor } from "meteor/meteor";

if (Meteor.isServer) {
  const fs = require("fs");
  //   const mime = require("mime");
  const sanitize = require("sanitize-filename");
  const process = require("process");

  //handler to upload file
  WebApp.connectHandlers.use("/uploadFile", function (req, res) {
    let fileId = Files.insert({});

    var cwd = process.cwd().match(/.*AFDB\//)[0];

    if (cwd.length < 1) {
      throw new Meteor.Error("missing-cwd", "Couldn't find working directory");
    }

    destinationDirectory = cwd + "fileUploads/";
    if (!fs.existsSync(destinationDirectory)) {
      fs.mkdirSync(destinationDirectory);
    }

    var file = fs.createWriteStream(destinationDirectory + fileId + ".pdf");

    file.on("error", function (error) {
      throw new Meteor.Error("upload-error", "Error uploading file", error);
    });
    file.on("finish", function () {
      res.writeHead(200);
      res.write(fileId); //send back file ID
      res.end(); //end the response
    });

    req.pipe(file); //pipe the request to the file
  });

  //handler to retrieve file
  WebApp.connectHandlers.use("/retrieveFile", function (req, res) {
    //cors policy
    res.setHeader("access-control-allow-origin", "*");

    let fileId = sanitize(req.url);
    let filePath = fileId + ".pdf";

    var cwd = process.cwd().match(/.*AFDB\//)[0];
    if (cwd.length < 1) {
      throw new Meteor.Error("missing-cwd", "Couldn't find working directory");
    }

    destinationDirectory = cwd + "fileUploads/";
    let path = destinationDirectory + filePath;

    if (fs.existsSync(path)) {
      var file = fs.createReadStream(path);
      file.pipe(res);
    } else {
      throw new Meteor.Error("missing-file", "Couldn't find file'");
    }
  });

  export const removeFile = (fileId) => {
    console.log("Request to remove pdf file with id " + fileId);

    const cwd = process.cwd().match(/.*AFDB\//)[0];
    const fileUploadsDirectory = cwd + "fileUploads/";
    const filePath = fileUploadsDirectory + fileId + ".pdf";

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log("Removed " + filePath);
    } else {
      console.error("File not found: " + filePath);
    }
  };
}
