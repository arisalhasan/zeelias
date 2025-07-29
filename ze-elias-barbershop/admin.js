function loadBookings() {
  const date = document.getElementById("adminDate").value;
  const barber = document.getElementById("adminBarber").value;
  const resultsDiv = document.getElementById("adminResults");

  if (!date || !barber) {
    alert("Please select both date and barber.");
    return;
  }

  resultsDiv.innerHTML = "<p>Loading bookings...</p>";

  db.collection("bookings")
    .where("date", "==", date)
    .where("barber", "==", barber)
    .orderBy("time")
    .get()
    .then((snapshot) => {
      if (snapshot.empty) {
        resultsDiv.innerHTML = "<p>No bookings found for that date and barber.</p>";
        return;
      }

      let html = "<ul>";
      snapshot.forEach((doc) => {
        const data = doc.data();
        html += `<li>
          <strong>${data.time}</strong> - ${data.name} (${data.phone}) - ${data.service}
          <button onclick="deleteBooking('${doc.id}')">Delete</button>
        </li>`;
      });
      html += "</ul>";
      resultsDiv.innerHTML = html;
    })
    .catch((error) => {
      console.error("Error loading bookings:", error);
      resultsDiv.innerHTML = "<p>Error loading bookings. Check console for details.</p>";
    });
}

function deleteBooking(id) {
  if (!confirm("Are you sure you want to delete this booking?")) return;

  db.collection("bookings")
    .doc(id)
    .delete()
    .then(() => {
      alert("Booking deleted.");
      loadBookings(); // Reload list
    })
    .catch((error) => {
      console.error("Error deleting booking:", error);
      alert("Error deleting booking.");
    });
}
