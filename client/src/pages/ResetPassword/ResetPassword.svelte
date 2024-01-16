<script>
  import { BASE_URL } from "../../store/global.js";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  let userNameForReset = "";

  let username = "";
  let secretToken = "";
  let newPassword = "";

  async function handleGetSecretToken() {
    try {
      const response = await fetch($BASE_URL + "/auth/getSecretToken", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userNameForReset }),
        credentials: "include",
      });
      if (response.ok) {
        // Handle successful token mail
        const result = await response.json();
        showToast(result.message, "success");
        userNameForReset = "";
      } else {
     
        const error = await response.json();
        showToast(error.message, "error");

        userNameForReset = "";
      }
    } catch (error) {
      showToast(error, "error");

      userNameForReset = "";
    }
  }

  async function handleReset() {
    const resetData = {
      username,
      secretToken,
      newPassword,
    };

    try {
      const response = await fetch($BASE_URL + "/auth/resetPassword", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(resetData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        showToast(result.message, "succes");

        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } else {
        const error = await response.json();
        showToast(error.message, "error");

        username = "";
        secretToken = "";
        newPassword = "";
      }
    } catch (error) {
      showToast(error, "error");

      username = "";
      secretToken = "";
      newPassword = "";
    }
  }
</script>

<h1>Reset your password</h1>

<div class="container" style="margin-left: 375px;">
  <div class="column">
    <h2>Get token for reset</h2>
    <p>Secret token will be sent to your mail. It will be active for 30min.</p>

    <form on:submit|preventDefault={handleGetSecretToken}>
      <label for="usernameforreset">Username:</label>
      <input type="text" id="usernameforreset" bind:value={userNameForReset} />

      <button type="submit">Get token</button>
    </form>
  </div>
  <div class="column">
    <h2>Input username and secret token to reset password.</h2>
    <form on:submit|preventDefault={handleReset}>
      <label for="username">Username:</label>
      <input type="text" id="username" bind:value={username} />

      <label for="secretToken">Secret token:</label>
      <input type="text" id="secretToken" bind:value={secretToken} />

      <label for="newPassword">New password:</label>
      <input type="password" id="newPassword" bind:value={newPassword} />

      <button type="submit">Reset password</button>
    </form>
  </div>
</div>
