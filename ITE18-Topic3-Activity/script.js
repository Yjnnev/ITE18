// ---------- Mock service (supplied) ----------
function requestResources(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error("Resources could not be loaded."));
        return;
      }
      resolve([
        { title: "JavaScript Events", minutes: 15 },
        { title: "Closures Practice", minutes: 20 },
        { title: "Promises and Await", minutes: 25 }
      ]);
    }, 1200);
  });
}

// ---------- Step 1: closure-based counters ----------
function makeCounter() {
  let count = 0;
  return function () {
    count += 1;
    return count;
  };
}

// ---------- Step 2: classes ----------
class Resource {
  constructor(title) {
    this.title = title;
  }
  describe() {
    return this.title;
  }
}

class TimedResource extends Resource {
  constructor(title, minutes) {
    super(title);
    this.minutes = minutes;
  }
  describe() {
    return `${super.describe()} | ${this.minutes} min`;
  }
}

// ---------- Step 3: element selection and state ----------
const form = document.getElementById("resourceForm");
const failNext = document.getElementById("failNext");
const loadButton = document.getElementById("loadButton");
const attemptsEl = document.getElementById("attempts");
const statusEl = document.getElementById("status");
const listEl = document.getElementById("resourceList");
const pingButton = document.getElementById("pingButton");
const pingsEl = document.getElementById("pings");
const traceEl = document.getElementById("trace");

let busy = false;

const nextAttempt = makeCounter();
const nextPing = makeCounter();

// ---------- Step 4: trace logging ----------
function log(message) {
  traceEl.textContent += message + "\n";
}

function clearTrace() {
  traceEl.textContent = "";
}

function clearList() {
  listEl.textContent = "";
}

// ---------- Step 3/5: submit handler ----------
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (busy) {
    return;
  }

  busy = true;
  loadButton.disabled = true;
  const capturedMode = failNext.checked;
  attemptsEl.textContent = nextAttempt();
  statusEl.textContent = "Loading...";
  clearList();

  clearTrace();
  log("A: handler starts");

  setTimeout(() => {
    log("D: timer task");
  }, 0);

  Promise.resolve().then(() => {
    log("C: promise microtask");
  });

  log("B: before await");

  try {
    const data = await requestResources(capturedMode);

    const resources = data.map((item) => new TimedResource(item.title, item.minutes));
    resources.forEach((resource) => {
      const row = document.createElement("li");
      row.textContent = resource.describe();
      listEl.appendChild(row);
    });

    statusEl.textContent = `Loaded ${resources.length} resources.`;
    log("E: success");
  } catch (error) {
    statusEl.textContent = error.message;
    log("E: failure");
  } finally {
    busy = false;
    loadButton.disabled = false;
    log("F: cleanup");
  }
});

// ---------- Step 6: response click listener ----------
pingButton.addEventListener("click", () => {
  pingsEl.textContent = nextPing();
});
