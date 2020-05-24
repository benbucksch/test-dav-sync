import dav from 'dav';
import config from './config.js'; /* JSON file with:
export default
{
  "serverURL": "https://...hostname.../remote.php/dav",
  "username": "...",
  "password": "..."
}
*/

var gJSONSavedFile = {}; // would normally be a file or database table

async function start() {
  let syncToken = gJSONSavedFile.syncToken; // get it from file
  console.info("sync token from file", syncToken);

  console.time("calendar-connect");
  let xhr = new dav.transport.Basic(
    new dav.Credentials({
      username: config.username,
      password: config.password,
    })
  );
  let account = await dav.createAccount({
    server: config.serverURL,
    //loadCollections: false,
    //loadObjects: false,
    xhr: xhr,
  });
  console.timeEnd("calendar-connect");
  let calendar = account.calendars[0]; // just the first, just for testing
  console.time("calendar sync");
  console.log("sync token after init", calendar.syncToken);
  if (syncToken) {
    console.log("but setting sync token to", syncToken);
    calendar.syncToken = syncToken; // TODO Already set. Doesn't work.
  }
  calendar = await dav.syncCalendar(calendar, {
    syncToken: syncToken, // TODO Doesn't work
    xhr: xhr,
  });
  console.timeEnd("calendar sync");
  gJSONSavedFile.syncToken = calendar.syncToken; // save it
  console.log("sync token after sync", gJSONSavedFile.syncToken);
  console.log("Got", calendar.objects.length, "calendar entries");
}


(async () => {
  try {
    console.log("Test first start");
    await start();
    console.log("Test second start");
    await start();
  } catch (ex) {
    console.error(ex);
  }
})();
