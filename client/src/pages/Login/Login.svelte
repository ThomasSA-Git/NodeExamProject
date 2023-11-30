<script>
  import { user, role } from "../../store/stores.js";
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
        $role = userData.role;
        localStorage.setItem("user", JSON.stringify(userData));
        showToast("Login successful. Redirecting to member page.", "success");

        // Redirect depending on role
        setTimeout(() => {
          if ($role === "admin") {
            navigate("/adminpage");
          } else {
            navigate("/memberpage");
          }
        }, 2000);
      } else {
        // Handle failed login
        const errorData = await response.json();
        // make the below a toast instead
        const errorMessage =
          errorData.error || "Login failed. Please check your credentials.";
          showToast(errorMessage, 'error');
        username = "";
        password = "";
      }
    } catch (error) {
      console.log(error);
      
      showToast(`Login failed. Error: ${error.message}`, 'error');
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
  <input type="text" id="username" bind:value={username} />

  <label for="password">Password:</label>
  <input type="password" id="password" bind:value={password} />

  <button type="submit">Login</button>
</form>
<button on:click={navigateToResetPassword}>Forgot Password?</button>
