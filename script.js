// Select the Form and the Result display area from the HTML using their IDs
const form = document.getElementById("form");
const result = document.getElementById("result");

// Listen for the 'submit' event
form.addEventListener("submit", function (e) {
  const submitBtn = form.querySelector("button");
  submitBtn.disabled = true;

  // STOP the browser's default behavior.
  // Normally, a browser refreshes the page on submit. This line keeps the user exactly where they are.
  e.preventDefault();

  // 4. Extract the data currently typed into the form fields
  const formData = new FormData(form);

  // 5. Convert that data into a plain JavaScript Object (e.g., {name: "Claudio", email: "..."})
  const object = Object.fromEntries(formData);

  // 6. Convert that Object into a JSON string.
  // APIs (like Web3Forms) usually require data to be sent as a string, not a live object.
  const json = JSON.stringify(object);

  // 7. Give the user immediate feedback so they don't click "Submit" ten times.
  result.innerHTML = "Please wait...";

  // 8. The FETCH API: This sends the actual "package" to the Web3Forms server
  fetch("https://api.web3forms.com/submit", {
    method: "POST", // 'POST' means we are SENDING data
    headers: {
      "Content-Type": "application/json", // Telling the server we are sending JSON
      Accept: "application/json", // Telling the server we want JSON back
    },
    body: json, // The actual data string we created in step 6
  })
    // 9. After the server responds...
    .then(async (response) => {
      // Read the response data coming back from the server
      let json = await response.json();

      // 10. Check if the server said "OK" (Status 200)
      if (response.status == 200) {
        result.innerHTML = "Success! Message sent.";
        result.style.color = "green";
      } else {
        // If the server sent an error (like a wrong API key)
        console.log(response);
        result.innerHTML = json.message;
        result.style.color = "red";
      }
    })
    // 11. CATCH is for major errors (like if the user loses internet connection mid-send)
    .catch((error) => {
      console.log(error);
      result.innerHTML = "Something went wrong!";
    })
    // 12. This block runs NO MATTER WHAT (success or failure)
    .then(function () {
      form.reset(); // Clear the Name, Email, and Message boxes

      // 13. SET TIMEOUT: Wait 5000 milliseconds (5 seconds), then hide the message
      setTimeout(() => {
        result.innerHTML = "";
      }, 5000);
      submitBtn.disabled = false; //re-enable the form
    });
});

// Horizontal Scroll Buttons Logic
const scrollContainer = document.getElementById("projectContainer");
const scrollLeft = document.getElementById("scrollLeft");
const scrollRight = document.getElementById("scrollRight");

if (scrollContainer && scrollLeft && scrollRight) {
  scrollRight.addEventListener("click", () => {
    scrollContainer.scrollBy({ left: 320, behavior: "smooth" });
  });

  scrollLeft.addEventListener("click", () => {
    scrollContainer.scrollBy({ left: -320, behavior: "smooth" });
  });

  scrollContainer.addEventListener("scroll", () => {
    // Show/hide left button if at the start
    scrollLeft.style.opacity = scrollContainer.scrollLeft > 10 ? "1" : "0";
    scrollLeft.style.pointerEvents = scrollContainer.scrollLeft > 10 ? "auto" : "none";

    // Show/hide right button if at the end
    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    scrollRight.style.opacity = scrollContainer.scrollLeft < maxScroll - 10 ? "1" : "0";
    scrollRight.style.pointerEvents = scrollContainer.scrollLeft < maxScroll - 10 ? "auto" : "none";
  });
}
