### Known Issues:

    - Currently, updating a field version in editHistory mode is not triggering a re-render upon going back to the regular mode. The current workaround is to get the new object from the server response and display that. That works, but what if two users are simultaneously checking the same field? They should see the version change instantly, and it should be triggering a re-render, so why isn't it?
        - No longer an issue. Fixed by rendering actionableFinding directly, reason it wasn't working is because field was a local var

    - 'Meteor.Error() is not a constructor' on server-side?
        - This happened specifically on server-side method to create new field object, whenever it wasn't possible to save the new object. Instead of throwing the correct Meteor error, a new error would appear claiming that "Meteor.Error()" is not a constructor.
        - I don't know why this was happening. I rewrote that section (the same way) and now it works. I can't tell what I did differently or was doing wrong before but it seems like it's no longer an issue.

    - Something is happening that when the server is restarted, the current version of fields is not saved as the latest version
        - This is because server startup wasn't using proper insert field object method which takes care of syncing version to latest version whenever something is inserted. Fixed by initializing field containers to version 0 and using the proper method.

    - "Check your password" warning

    - Version Note sometimes not clearing
        - This seems to have happened a few times when I edit a field with a version note, that same note then shows up in the edit history reversion mode.
        - However, every time I try to fix this issue, I fail to reproduce it consistently, so I haven't been able to figure out what's causing it to happen sometimes.
        - Fixed, logic was wrong when exiting edit history and reversion mode at once through submit or cancel.

    - For some bizarre reason, calling the objectType dictionary with a objectType key in /public/dicts from methods.js in /imports/api returns undefined. I've tried many different things to solve this to no avail, and I have no idea what's causing this issue.
        - Fixed by making a function version of dict, but why was this happening in the first place?? I can return other classes such as description to methods.js using a simple dictionary.
        - Fixed by just not using this janky structure. See below.

    - Sometimes the DebunkedMythModel file complains that it can't inherit from MainObject as MainObject is undefined.
        - No clue what's causing this. Whenever it came up I just imported the DMM file on the server and tried logging the MainObject model in the DMM file until JS realized it exists
        - This (and the issue above too) was happening when there was a central dictionary file for all sorts of modularization dictionaries. Getting rid of that setup and just having local dictionaries where needed (to render other components or call other classes) seems to have fixed it. Public dicts now only contain static key-value pairs.

    - Field Object "createdAt" showing up undefined when looking at field objects from main object. UpdatedAt shows up correctly and createdAt shows up correctly when searching in fieldObject collection.
        - Probably something to do with the timing of creating field objects and associating them to a main object. I haven't looked into this as it's a non-priority issue because:
            1. There's no need to display a field objects's createdAt field from main object.
            2. if there's ever a need to display a field object's timestamp, the updatedAT timestamp also does the trick, as due to the logic I set up for field updating, these should be identical.

### Improvements:

    - Currently, actionableFindings are being searched twice in the index and show routes, is there a way to load them all on index only and then only send the right on to the show route?

    - 3 column layout: Column height should be the same for all columns at all times. For example, if the middle column expands to accommodate more content, so should the right and left columns.
        - Made it so that when a column overflows, it gets a scrollbar rather than growing, so all 3 columns maintain their constant height.

        - Flexbox also fixes this.

## Testing:

- IMPORTANT: set "testingMode = false" in server main.js file to avoid interference from seeded users and data in tests

* How to run tests:

  - In console (server & client):
    TEST_WATCH=1 meteor test --driver-package meteortesting:mocha / (or just npm run test)

  - In browser (server & client?):
    TEST_WATCH=1 meteor test --full-app --driver-package meteortesting:mocha / (or just npm run test-app)

* Needs testing:
  - mainObjectType check in mainObjectMethods
