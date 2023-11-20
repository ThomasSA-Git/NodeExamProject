<script>
  import { onMount } from "svelte";
  import { user, BASE_URL } from "../../store/stores.js";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  const member = $user;

  let streetname = "";
  let cityname = "";
  let zipcode = "";

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/member/getMember", {
        credentials: "include",
      });

      if (response.ok) {
        const memberData = await response.json();
        streetname = memberData.user.address?.streetname || "";
        cityname = memberData.user.address?.cityname || "";
        zipcode = memberData.user.address?.zipcode || "";
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to fetch member data.";

        showToast(errorMessage, "error");

        streetname = "";
        cityname = "";
        zipcode = "";
      }
    } catch (error) {
      // Handle other errors

      showToast("An error occurred.", "error");

      streetname = "";
      cityname = "";
      zipcode = "";
    }
  });

  async function handleUpdateAddress() {
    try {
      const updateData = {
        username: member,
        address: {
          streetname,
          cityname,
          zipcode,
        },
      };

      const response = await fetch($BASE_URL + "/member/updateAddress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
        credentials: "include",
      });

      if (response.ok) {
        const successMessage = await response.json();

        showToast(successMessage.message, "succes");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to update address.";

        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("An error occurred.", "error");
    }
  }
</script>

<h1>Hello {member}</h1>
<p>Here you can see your personal info and update your address.</p>

<form on:submit|preventDefault={handleUpdateAddress}>
  <label for="streetname">Street:</label>
  <input type="text" id="streetname" bind:value={streetname} />

  <label for="cityname">City:</label>
  <input type="text" id="cityname" bind:value={cityname} />

  <label for="zipcode">Zip code:</label>
  <input type="text" id="zipcode" bind:value={zipcode} />

  <button type="submit">Submit new address</button>
</form>
