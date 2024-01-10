<script>
  import { onMount, onDestroy } from "svelte";
  import { BASE_URL } from "../../store/global";
  import { user } from "../../store/stores";
  import { currentProjectName, currentProjectId } from "../../store/project";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
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
  let users = [];
  let usersToAdd = [];
  let searchUser;
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
        users = result.users;
        getUsersToAdd();
        console.log(usersToAdd)
      } else {
        showToast("Could not load project", "error");
      }
    } catch (error) {
      showToast("Error occured. Could not show project", "error");
    }
  },
  );

  function handleSearchUser(){
  socket.emit("search-user", {searchUser})
  socket.on("find-user-result", () => {
    userFound = true;
  })
  socket.on("find-user-error", (data) => {
   
})
}  

function handleAddUser(){
  console.log(searchUser)
  socket.emit("add-user", { username: searchUser, projectId: $currentProjectId })
  socket.on("add-user-result", (data) => {
    searchUser = "";
  })
  socket.on("add-user-error", (data) => {
    showToast(data.message, "error");
})
}

onDestroy(() => {
    // Leave the room based on currentProjectId
    socket.emit("leave-room", { projectId: $currentProjectId });
  });

  async function getUsersToAdd() {
    try {
      const response = await fetch($BASE_URL + "/projectUsers", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        usersToAdd = result.usersToAdd;
      }
    } catch (error) {

    }
  }

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

<h2>Overview for: {$currentProjectName}</h2>

<div class="row">
  <div class="container">
    <h3>Chart overview for kanban</h3>
    {#if kanban.length > 0}
      <div class="chart-div" style="max-height: 150px;">
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
      </div>
    {:else}
      <p>No tasks assigned to project yet.</p>
    {/if}
  </div>

  <div class="container">
    <h3>Kanban, diagram and notes</h3>
    <div></div>
    <div class="button-row">
      <button class="navigate-button" on:click={() => handleNavigate("/kanban")}
        >Kanban board</button
      >

      <button
        class="navigate-button"
        on:click={() => handleNavigate("/diagram")}>Diagram creator</button
      >

      <button
        class="navigate-button"
        on:click={() => handleNavigate("/noteOverview")}>Project notes</button
      >

      <button
        class="navigate-button"
        on:click={() => handleNavigate("/userpage")}>User overview</button
      >
    </div>
  </div>
</div>
<div class="row">
  <div class="container"><h3>Add users and list of users</h3>
  <input type="text" on:change={handleSearchUser} bind:value={searchUser}>
  {#if userFound}
  <button on:click={handleAddUser}>Add user</button>
  {/if}
  </div>

  <div class="container"><h3>Next deadline for project and task name</h3></div>
</div>

<style>
  .container {
    box-sizing: border-box;
    width: 50%;
    height: 250px;
    padding: 10px;
    border: 3px solid #ccc;
    border-radius: 20px;
    margin-bottom: 20px;
    margin-right: 20px;
    margin-left: 30px;
    margin-right: 30px;
  }
  .chart-div {
    height: 200px; /* Set a fixed height for the div */
    overflow-y: scroll; /* Add a vertical scrollbar if content overflows */
    border: 1px solid #ccc; /* Optional: Add a border for better visibility */
    padding-top: 0px; /* Optional: Add padding for content inside the div */
    padding-bottom: 5px;
  }

  h3 {
    text-align: center;
    flex: 1000px;
  }

  p {
    text-align: left;
    margin-bottom: 0;
  }

  .row {
    display: flex;
    justify-content: space-between;
  }
  .wrapper {
    position: relative;
    width: 100%;
    max-width: 500px;
  }

  rect {
    fill: #2748ca;
  }

  .button-container {
    box-sizing: border-box;
    /* width: 50%; */
    height: 80px;
    width: 200px;

    border-radius: 20px;
  }
  .button-row {
    /* display: flex; */
    justify-content: space-between;
  }
</style>
