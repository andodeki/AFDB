import { Source } from "/imports/api/mainObjects/sourceModel";
const fs = require("fs");

//routine to remove orphaned PDF files in fileUploads older than a given number of days
export const pdfGarbageCollector = (days) => {
  if (Meteor.isServer) {
    console.log("Running routine to remove orphan pdf files...");

    const cwd = process.cwd().match(/.*AFDB\//)[0];
    const fileUploadsDirectory = cwd + "fileUploads/";

    //get all fileIds with '.pdf' extension
    let files = [];
    fs.readdirSync(fileUploadsDirectory).forEach((file) => {
      files.push(file);
    });

    //search for each fileId in sources
    let removedCounter = 0;
    files.forEach((file) => {
      let source = Source.findOne({
        "sourceInfo.body.fileId": file.replace(".pdf", ""),
      });

      //if source not found, remove file if it is older than given number of days
      if (!source) {
        const filePath = fileUploadsDirectory + file;

        if (fs.existsSync(filePath)) {
          const lastModified = fs.statSync(filePath).ctime;
          const now = new Date();
          const ageInDays = (now - lastModified) / (1000 * 3600 * 24);

          if (ageInDays > days) {
            fs.unlinkSync(filePath);
            removedCounter += 1;
            console.log("Removed " + filePath);
          }
        } else {
          console.error("File not found: " + filePath);
        }
      }
    });

    //display results
    if (removedCounter > 0) {
      console.log("Process complete, " + removedCounter + " file(s) removed");
    } else {
      console.log("Process complete, no files to remove");
    }
  }
};
