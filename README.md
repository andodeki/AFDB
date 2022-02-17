### Actionable Findings Database

## Startup

- `cd` into `app` and run `npm install`.
- `cd` into `pdfHighlighter` and run `npm install`,
- Start the `pdfHighlighter` app by running `npm start` in its directory.
- `cd` back into `app` and run the main app by running `npm start` in this directory.
- See the app on your browser at `http://localhost:5000/`.

## Demo

- To load the demo data, if it is not already present, `cd` into `app`, start the main app on port 5000, and run the command `mongorestore --port=5001 ../dump` (this will require having [MongoDB Tools](https://docs.mongodb.com/database-tools/installation/installation/) installed). Make sure the database is empty before doing so, if it isn't, run `meteor reset` prior to starting the main app.
- See further demo instructions and information [here](https://docs.google.com/document/d/1pqE449NwNWg5oA_8GNJ-JSQDwG07-Y30_8bfahTOUZI/edit?usp=sharing).

## Docs

- Docs in docs.html.

- Note: There is a bug with Google Chrome where the last modified date of an HTML document shows up as the current system time. It doesn't look like Google is going to fix this any time soon (issue reported since at least 2016). If you want to check when the documentation was actually last updated, open docs.html with Firefox or another browser.
