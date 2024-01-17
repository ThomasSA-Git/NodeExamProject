<script>
  import { user } from "../../store/stores.js";
  import { BASE_URL } from "../../store/global.js";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  let username = "";
  let password = "";

  async function handleSubmit() {
    const loginData = {
      username,
      password,
    };

    try {
      const response = await fetch($BASE_URL + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
        credentials: "include",
      });

      if (response.ok) {
        // Handle successful login
        const userData = await response.json();
        $user = userData.username;
        localStorage.setItem("user", JSON.stringify(userData));
        showToast("Login successful. Redirecting to user page.", "success");

        // Redirect
        setTimeout(() => {
          navigate("/userpage");
        }, 2000);
      } else {
        // Handle failed login
        const error = await response.json();
        // make the below a toast instead
        showToast(error.message, "error");
        username = "";
        password = "";
      }
    } catch (error) {
      showToast(`Login failed. Error: ${error.message}`, "error");
      username = "";
      password = "";
    }
  }

  function navigateToResetPassword() {
    navigate("/resetpassword");
  }
</script>

<h1>Login</h1>

<form on:submit|preventDefault={handleSubmit}>
  <label for="username">Username:</label>
  <input type="text" id="username" bind:value={username} required />

  <label for="password">Password:</label>
  <input
    type="password"
    id="password"
    bind:value={password}
    required
    autocomplete=""
  />

  <button type="submit">Login</button>
</form>
<button on:click={navigateToResetPassword}>Forgot Password?</button>
