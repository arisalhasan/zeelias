// Disable Thursdays & Sundays
const dateInput = document.getElementById("date");
const timeSelect = document.getElementById("time");
const barberSelect = document.getElementById("barber");

dateInput.addEventListener("input", () => {
  const day = new Date(dateInput.value).getDay();
  if (day === 0 || day === 4) {
    alert("We are closed on Thursdays and Sundays. Please choose another date.");
    dateInput.value = "";
  } else {
    loadAvailableTimeSlots(); // update available slots
  }
});

barberSelect.addEventListener("change", () => {
  if (dateInput.value) {
    loadAvailableTimeSlots(); // update available slots
  }
});

// All possible time slots (09:00 to 18:30, 30 min steps)
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
  // Check if a booking already exists for the same date, time, and barber
  const existing = await db.collection("bookings")
    .where("date", "==", date)
    .where("barber", "==", barber)
    .where("time", "==", time)
    .get();

  if (!existing.empty) {
    document.getElementById("message").textContent = "Sorry, that time is already booked. Please choose another.";
    document.getElementById("message").style.color = "red";
    loadAvailableTimeSlots(); // Refresh available times
    return;
  }

  // If no conflict, save the new booking
  await db.collection("bookings").add(bookingData);
  document.getElementById("message").textContent = "Booking successful!";
  document.getElementById("message").style.color = "green";
  document.getElementById("form").reset();
  loadAvailableTimeSlots(); // Refresh available times
} catch (error) {
  console.error("Error booking:", error);
  document.getElementById("message").textContent = "Error saving booking. Please try again.";
  document.getElementById("message").style.color = "red";
}

});
