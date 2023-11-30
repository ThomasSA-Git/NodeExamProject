<script>
    import { onMount } from "svelte";
    import { BASE_URL } from "../../store/global";
    import { currentProject } from "../../store/project";

    console.log($currentProject)
    onMount( async() => {
        await fetch($BASE_URL)
    })
</script>

<h2>Overview for: {$currentProject}</h2>

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
  
    .row {
      display: flex;
      justify-content: space-between;
    }
  </style>
  
  <div class="row">
    <div class="container">Graph overview</div>
    <div class="container">Kanban, diagram and notes</div>
  </div>
  <div class="row">
    <div class="container">Add users and list of users</div>
    <div class="container">Next deadline for project and task name</div>
  </div>