<script>
  import { onMount } from "svelte";
  import { BASE_URL } from "../../store/stores.js";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";

  let members = [];

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/admin/getMembers", {
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage =
          errorData.error ||
          "Failed getting user data. Please check your credentials.";
        showToast(errorMessage, "error");
      }

      const result = await response.json();
      members = result.data;
    } catch (error) {
      showToast(error, "error");
    }
  });
</script>

<h1>Welcome admin</h1>

<h2>List of members</h2>

{#each members as member}
  <hr />
  <p><strong>Username: </strong>{member.username}</p>
  <p><strong>Email: </strong>{member.email}</p>
  <p><strong>Role: </strong>{member.role}</p>
  {#if member.address != undefined}
    <p><strong>Street: </strong>{member.address.streetname}</p>
    <p><strong>Email: </strong>{member.address.cityname}</p>
    <p><strong>Role: </strong>{member.address.zipcode}</p>
  {/if}
  <br />
{/each}
