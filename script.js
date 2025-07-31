// Disable Thursdays & Sundays
const dateInput = document.getElementById("date");
const today = new Date();
const maxDate = new Date();
maxDate.setMonth(today.getMonth() + 1);

dateInput.min = today.toISOString().split("T")[0];
dateInput.max = maxDate.toISOString().split("T")[0];

const timeSelect = document.getElementById("time");
const barberSelect = document.getElementById("barber");

dateInput.addEventListener("input", () => {
  const day = new Date(dateInput.value).getDay();
  if (day === 0 || day === 4) {
    alert("We are closed on Thursdays and Sundays. Please choose another date.");
    dateInput.value = "";
  } else {
    loadAvailableTimeSlots();
  }
});

barberSelect.addEventListener("change", () => {
  if (dateInput.value) loadAvailableTimeSlots();
});

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
    const snapshot = await firebase.firestore().collection("bookings")
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

firebase.auth().useDeviceLanguage();

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

  const selectedDate = new Date(date);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  if (selectedDate < now) {
    alert("You cannot book for a past date.");
    return;
  }

  try {
    await sendOTP(phone);
    const userCode = prompt("Enter the OTP sent to your phone:");
    const verified = await verifyOTP(userCode);
    if (!verified) {
      alert("OTP verification failed. Try again.");
      return;
    }

    const existing = await firebase.firestore().collection("bookings")
      .where("date", "==", date)
      .where("barber", "==", barber)
      .where("time", "==", time)
      .get();

    if (!existing.empty) {
      document.getElementById("message").textContent = "Sorry, that time is already booked.";
      document.getElementById("message").style.color = "red";
      loadAvailableTimeSlots();
      return;
    }

    await firebase.firestore().collection("bookings").add({
      name,
      phone,
      service,
      barber,
      date,
      time,
      timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });

    document.getElementById("message").textContent = "Booking successful!";
    document.getElementById("message").style.color = "green";
    document.getElementById("form").reset();
    loadAvailableTimeSlots();
  } catch (error) {
    console.error("Booking failed:", error);
    alert("Error: " + error.message);
  }
});

function sendOTP(phoneNumber) {
  window.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('recaptcha-container', {
    size: 'invisible',
    callback: () => console.log('reCAPTCHA resolved')
  });

  return firebase.auth().signInWithPhoneNumber(phoneNumber, window.recaptchaVerifier)
    .then(result => {
      window.confirmationResult = result;
      alert("OTP sent to your phone.");
    })
    .catch(error => {
      console.error("sendOTP error:", error);
      throw error;
    });
}

function verifyOTP(code) {
  return window.confirmationResult.confirm(code)
    .then(() => true)
    .catch(error => {
      console.error("verifyOTP error:", error);
      return false;
    });
}
