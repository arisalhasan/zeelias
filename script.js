// Disable Thursdays & Sundays
const dateInput = document.getElementById("date");
dateInput.addEventListener("input", () => {
  const day = new Date(dateInput.value).getDay();
  if (day === 0 || day === 4) {
    alert("We are closed on Thursdays and Sundays. Please choose another date.");
    dateInput.value = "";
  }
});

// Generate 30-min time slots from 09:00 to 18:30
const timeSelect = document.getElementById("time");
function generateTimeSlots() {
  timeSelect.innerHTML = '<option value="">Select Time</option>';
  for (let hour = 9; hour <= 18; hour++) {
    timeSelect.innerHTML += `<option value="${hour.toString().padStart(2, '0')}:00">${hour}:00</option>`;
    timeSelect.innerHTML += `<option value="${hour.toString().padStart(2, '0')}:30">${hour}:30</option>`;
  }
}
generateTimeSlots();

// Handle Booking Form Submit
document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const service = document.getElementById("service").value;
  const barber = document.getElementById("barber").value;
  const date = document.getElementById("date").value;
  const time = document.getElementById("time").value;

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
    await db.collection("bookings").add(bookingData);
    document.getElementById("message").textContent = "Booking successful!";
    document.getElementById("form").reset();
    generateTimeSlots();
  } catch (error) {
    console.error("Error booking:", error);
    document.getElementById("message").textContent = "Error saving booking. Please try again.";
  }
});
