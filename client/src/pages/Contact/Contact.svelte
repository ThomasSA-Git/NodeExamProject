<script>
  import { BASE_URL } from "../../store/global.js";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  let name = "";
  let email = "";
  let message = "";

  async function handleSubmit() {
    const contactData = {
      name,
      email,
      message,
    };

    try {
      const response = await fetch($BASE_URL + "/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contactData),
        credentials: "include",
      });

      if (response.ok) {
        // Handle successful contact
        showToast("Message sent successfully", "succes");

        resetValues();
      } else {
        // Handle failed fetch
        const errorData = await response.json();

        let errorMessage =
          errorData.message ||
          "Message submittance failed. Please try again later.";
        showToast(errorData.message, "error");
        resetValues();
      }
    } catch (error) {
      showToast(
        "An unexpected error occurred. Please try again later.",
        "error"
      );
      resetValues();
    }
  }

  function resetValues() {
    name = "";
    email = "";
    message = "";
  }
</script>

<h1>Contact</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label for="name">Your name:</label>
  <input bind:value={name} name="name" placeholder="Your name" />

  <label for="email">Your Email:</label>
  <input
    bind:value={email}
    type="email"
    name="email"
    placeholder="Your email"
  />

  <label for="message">Message:</label>
  <textarea
    bind:value={message}
    name="message"
    cols="80"
    rows="10"
    placeholder="Message"
  />

  <button type="submit">Submit</button>
</form>
