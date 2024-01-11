<script>
  import { onMount, onDestroy } from "svelte";
  import { BASE_URL } from "../../store/global";
  import { user } from "../../store/stores";
  import { currentProjectName, currentProjectId, projectUsers } from "../../store/project";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import "../../assets/css/project.css";
  import { showToast } from "../../assets/js/toast";
  import * as d3 from "d3";
  import { IO_URL } from "../../store/global";
  import io from "socket.io-client";

  const socket = io($IO_URL, {
    query: {
      projectId: $currentProjectId,
      username: $user,
    },
  });

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
  });

  function handleSearchUser() {
    if (!users.includes(searchUser)) {
      socket.emit("search-user", { searchUser });
      searchStatus = "";
      userFound = false;
    } else {
      searchStatus = "User is already in the project";
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
    socket.on("add-user-success", (data) => {
      showToast(data.message, "success");
      users = [...users, searchUser];
      searchUser = "";
    });
    socket.on("add-user-error", (data) => {
      showToast(data.message, "error");
    });
  }

  function handleRemoveUser(username) {
    socket.emit("remove-user", {
      username,
      projectId: $currentProjectId,
    });
    socket.on("remove-user-success", (data) => {
      showToast(data.message, "success");
      users = users.filter(user => user !== username);
    });
    socket.on("remove-user-error", (data) => {
      showToast(data.message, "error");
    });
  }

  onDestroy(() => {
    // Leave the room based on currentProjectId
    socket.emit("leave-room", { projectId: $currentProjectId });
  });

  // chart logic -----------------------------
  const formatLabel = d3.format(",.0f");

  const margin = {
    top: 30,
    right: 100,
    bottom: 0,
    left: 110,
  };

  let width = 500;
  let height = 150;

  $: innerWidth = width - margin.left - margin.right;
  let innerHeight = height - margin.top - margin.bottom;

  let xScale, yScale;
  $: if (kanban.length > 0) {
    xScale = d3
      .scaleLinear()
      .domain([0, d3.max(kanban, (list) => list.taskCount)])
      .range([0, innerWidth]);

    yScale = d3
      .scaleBand()
      .domain(kanban.map((list) => list.name))
      .range([0, innerHeight])
      .padding(0.25);
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
</div>
<hr />

<div class="row">
  <div class="container">
    <h2>Chart overview for kanban</h2>
    <h3>Sum of all tasks on project: {taskSum}</h3>
    {#if kanban.length > 0}
      <div class="wrapper" bind:clientWidth={width}>
        <svg {width} {height}>
          <g transform={`translate(${margin.left}, ${margin.top})`}>
            {#each kanban as list}
              <text
                text-anchor="end"
                x={-10}
                y={yScale(list.name) + yScale.bandwidth() / 2}
                dy=".35em"
              >
                {list.name}
              </text>
              <rect
                x={0}
                y={yScale(list.name)}
                width={xScale(list.taskCount)}
                height={yScale.bandwidth()}
              />
              <text
                text-anchor="start"
                x={xScale(list.taskCount)}
                dx="10"
                y={yScale(list.name) + yScale.bandwidth() / 2}
                dy=".35em"
              >
                {formatLabel(list.taskCount)}
              </text>
            {/each}
          </g>
        </svg>
      </div>
    {:else}
      <p>No tasks assigned to project yet.</p>
    {/if}
  </div>

  <div class="container">
    <h2>Add users and list of users</h2>
    
    <div class="add-user">
      <h3>Search user to add:</h3>
      <input type="text" on:change={handleSearchUser} bind:value={searchUser} />
      {#if userFound && searchUser != ""}
        <button on:click={handleAddUser}>Add user</button>
      {/if}
      <p style="color: red;"><strong>{searchStatus}</strong></p>
    </div>
    <div class="user-table">
      <th>Username:</th>
      {#each users as user}
        <tr>
          <td width="200px">{user}</td>
          <td
            ><button class="delete-btn" on:click={() => handleRemoveUser(user)}>Remove</button
            ></td
          >
        </tr>
      {/each}
    </div>

  
  </div>
</div>