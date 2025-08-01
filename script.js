// Disable Thursdays & Sundays
const dateInput = document.getElementById("date");

// Set min and max selectable dates (today to 1 month from today)
const today = new Date();
const maxDate = new Date();
maxDate.setMonth(today.getMonth() + 1);

// Format as YYYY-MM-DD
const formattedToday = today.toISOString().split("T")[0];
const formattedMax = maxDate.toISOString().split("T")[0];

dateInput.min = formattedToday;
dateInput.max = formattedMax;

const timeSelect = document.getElementById("time");
const barberSelect = document.getElementById("barber");

dateInput.addEventListener("input", () => {
  const selected = new Date(dateInput.value);
  selected.setHours(0, 0, 0, 0);
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const day = selected.getDay();
  if (selected < now) {
    alert("You cannot book for a past date.");
    dateInput.value = "";
    return;
  }

  if (day === 0 || day === 4) {
    alert("We are closed on Thursdays and Sundays. Please choose another date.");
    dateInput.value = "";
    return;
  }

  loadAvailableTimeSlots();
});

barberSelect.addEventListener("change", () => {
  if (dateInput.value) {
    loadAvailableTimeSlots();
  }
});

// All possible time slots (09:00 to 18:30, every 30 minutes)
const allSlots = [];
for (let hour = 9; hour <= 18; hour++) {
  allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
  allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
}

async function loadAvailableTimeSlots() {
  const date = dateInput.value;
  const barber = barberSelect.value;

  if (!date || !barber) return;

  try {
    const snapshot = await db.collection("bookings")
      .where("date", "==", date)
      .where("barber", "==", barber)
      .get();

    const taken = snapshot.docs.map(doc => doc.data().time);
    const available = allSlots.filter(slot => !taken.includes(slot));

    timeSelect.innerHTML = '<option value="">Select Time</option>';
    available.forEach(time => {
      const option = document.createElement("option");
      option.value = time;
      option.textContent = time;
      timeSelect.appendChild(option);
    });

    if (available.length === 0) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = "No available times";
      timeSelect.appendChild(option);
    }
  } catch (err) {
    console.error("Error loading available slots:", err);
    timeSelect.innerHTML = '<option value="">Error loading times</option>';
  }
}

// Handle Booking Form Submit
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = document.getElementById("service").value;
  const barber = barberSelect.value;
  const date = dateInput.value;
  const time = timeSelect.value;

  if (!name || !phone || !service || !barber || !date || !time) {
    alert("Please fill in all fields.");
    return;
  }

  const bookingData = {
    name,
    phone,
    service,
    barber,
    date,
    time,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    const existing = await db.collection("bookings")
      .where("date", "==", date)
      .where("barber", "==", barber)
      .where("time", "==", time)
      .get();

    if (!existing.empty) {
      document.getElementById("message").textContent = "Sorry, that time is already booked. Please choose another.";
      document.getElementById("message").style.color = "red";
      loadAvailableTimeSlots();
      return;
    }

    await db.collection("bookings").add(bookingData);
    document.getElementById("message").textContent = "Booking successful!";
    document.getElementById("message").style.color = "green";
    document.getElementById("form").reset();
    loadAvailableTimeSlots();
  } catch (error) {
    console.error("Error booking:", error);
    document.getElementById("message").textContent = "Error saving booking. Please try again.";
    document.getElementById("message").style.color = "red";
  }
});
