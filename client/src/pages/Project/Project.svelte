<script>
  import { onMount, onDestroy } from "svelte";
  import { BASE_URL } from "../../store/global";
  import { currentProjectName, currentProjectId } from "../../store/project";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import "../../assets/css/project.css";
  import { showToast } from "../../assets/js/toast";
  import Chart from "./Chart.svelte";
  import * as d3 from "d3";
  import { IO_URL } from "../../store/global";
  // addition for socket connection
  import { getSocket, initializeSocket } from "../../util/socketService";

  let socket = null;

  let kanban = [];
  let taskSum;
  let users = [];
  let searchUser;
  let searchStatus = "";
  let userFound = false;

  onMount(async () => {
    try {
      const response = await fetch(
        $BASE_URL + `/projects/${$currentProjectId}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const result = await response.json();
        if (getSocket() === null) {
          socket = await initializeSocket($IO_URL, $currentProjectId);
        } else {
          socket = getSocket();
        }
        kanban = result.projectData.kanban;
        taskSum = kanban.reduce(
          (accumulator, current) => accumulator + current.taskCount,
          0
        );
        users = result.projectData.users;
      } else {
        showToast("Could not load project", "error");
      }
    } catch (error) {
      showToast("Error occured. Could not show project", "error");
    }
    socket.on("add-user-success", (data) => {
      showToast(data.message, "success");
      users = data.users;
      searchUser = "";
    });
    socket.on("add-user-error", (data) => {
      showToast(data.message, "error");
    });
    socket.on("remove-user-success", (data) => {
      showToast(data.message, "success");
      users = data.users;
    });
    socket.on("remove-user-error", (data) => {
      showToast(data.message, "error");
    });
  });

  async function handleDeleteProject() {
    try {
      const response = await fetch(
        $BASE_URL + `/projects/${$currentProjectId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      const result = await response.json();
      if (response.ok) {
        showToast(result.message, "success");

        setTimeout(() => {
          navigate("/userpage");
        }, 3000);
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast("Error occured. Could not delete project", "error");
    }
  }

  function handleSearchUser() {
    if (!users.includes(searchUser)) {
      socket.emit("search-user", { searchUser });
      searchStatus = "";
      userFound = false;
    } else {
      searchStatus = "User is already added";
      userFound = false;
    }
    socket.on("find-user-result", () => {
      userFound = true;
    });
    socket.on("find-user-error", (data) => {
      userFound = false;
      searchStatus = data.message;
    });
  }

  function handleAddUser() {
    socket.emit("add-user", {
      username: searchUser,
      projectId: $currentProjectId,
    });
  }

  function handleRemoveUser(username) {
    socket.emit("remove-user", {
      username,
      projectId: $currentProjectId,
    });
  }

  function handleNavigate(path) {
    navigate(path);
  }
</script>

<h2>Dashboard for: {$currentProjectName}</h2>

<div>
  <button class="navigate-button" on:click={() => handleNavigate("/kanban")}
    >Kanban board</button
  >

  <button class="navigate-button" on:click={() => handleNavigate("/diagram")}
    >Diagram creator</button
  >

  <button
    class="navigate-button"
    on:click={() => handleNavigate("/noteOverview")}>Notes</button
  >

  <button class="navigate-button" on:click={() => handleNavigate("/userpage")}
    >User overview</button
  >

  <button
    class="delete-btn"
    style="margin-left:150px"
    on:click={handleDeleteProject}>Delete project</button
  >
</div>
<hr />

<div class="row">
  <div class="container">
    <Chart {taskSum} {kanban}/>
  </div>

  <div class="container" style="border-left: 1px solid #000;">
    <h2>Add users and list of users</h2>

    <div class="add-user">
      <h3>Search user to add:</h3>
      <div class="input-container">
        <input
          type="text"
          on:keyup={handleSearchUser}
          bind:value={searchUser}
        />
        {#if userFound && searchUser != ""}
          <button on:click={handleAddUser}>Add</button>
        {/if}
      </div>
      <p style="color: red;"><strong>{searchStatus}</strong></p>
    </div>
    <div class="user-table">
      <th>Username:</th>
      {#each users as user}
        <tr>
          <td width="300px">{user}</td>
          <td
            ><button class="delete-btn" on:click={() => handleRemoveUser(user)}
              >Remove</button
            ></td
          >
        </tr>
      {/each}
    </div>
  </div>
</div>
