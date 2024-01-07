<script>
  import { BASE_URL } from "../../store/global.js";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  let username = "";
  let password = "";
  let email = "";

  async function handleRegister() {
    const userData = {
      username,
      email,
      password,
    };

    try {
      const response = await fetch($BASE_URL + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
        credentials: "include",
      });

      if (response.ok) {
        const registrationMessage = await response.json();

        showToast(registrationMessage.message, "success");

        username = "";
        email = "";
        password = "";
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        // Handle failed registration
        const errorData = await response.json();

        const errorMessage =
          errorData.error || "Login failed. Please check your credentials.";
        showToast(errorMessage, "error");

        username = "";
        email = "";
        password = "";
      }
    } catch (error) {
      showToast(
        "An unexpected error occurred. Please try again later.",
        "error"
      );

      username = "";
      email = "";
      password = "";
    }
  }
</script>

<h1>Register new member</h1>

<form on:submit|preventDefault={handleRegister}>
  <label for="username">Username:</label>
  <input type="text" id="username" bind:value={username} required/>

  <label for="email">E-mail:</label>
  <input type="email" id="email" bind:value={email} required/>

  <label for="password">Password:</label>
  <input type="password" id="password" bind:value={password} required/>

  <button type="submit">Register</button>
</form>
