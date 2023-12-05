<script>
  import { onMount } from "svelte";
  import { BASE_URL } from "../../store/global";
  import { currentProjectName, currentProjectId } from "../../store/project";
  import { navigate } from "svelte-navigator";

  onMount(async () => {
    await fetch($BASE_URL);
  });

  function handleNavigate(path) {
    navigate(path);
  }
</script>

<h2>Overview for: {$currentProjectName}</h2>

<div class="row">
  <div class="container"><h3>Graph overview</h3></div>
  <div class="container">
    <div>
      <h3>Kanban, diagram and notes</h3>
    </div>
    <div class="text-container">
      <p>See kanban board <br>for project</p>
      <button style="margin-top: 80px;" class="navigate-button" on:click={() => handleNavigate("/kanban")}>Kanban</button>
    </div>
  </div>
</div>
<div class="row">
  <div class="container"><h3>Add users and list of users</h3></div>
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
  }

  h3 {
    text-align: center;
  }

  .text-container {
    display: flex;
    flex-direction: row;
  }

  p {
    text-align: left;
    margin-bottom: 0;
    margin-top: 75px;
    margin-left: -300px;
  }
  button{
    margin-left: -220px;
  }

  .row {
    display: flex;
    justify-content: space-between;
  }
</style>
