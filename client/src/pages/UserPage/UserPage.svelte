<script>
  import { onMount } from "svelte";
  import { user } from "../../store/stores.js";
  import { BASE_URL } from "../../store/global.js";
  import { currentProjectName, currentProjectId } from "../../store/project.js";
  import "../../assets/css/toast.css";
  import { showToast } from "../../assets/js/toast.js";
  import { navigate } from "svelte-navigator";

  let projectData = [];

  let newProjectName;



  onMount(async () => {
    try {
      const response = await fetch(
        $BASE_URL + `/projects/byUserName/${$user}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        projectData = responseData.data;
        console.log(projectData)
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to fetch project data.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("An error occurred.", "error");
    }
  });

  console.log(projectData)

  async function handleCreateProject() {
    try {
      const newProjectData = {
        projectName: newProjectName,
        username: $user,
      };

      const response = await fetch($BASE_URL + `/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProjectData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        $currentProjectName = newProjectName; // or use result.projectName if it's returned
        navigate("/project");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to create project.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("An error occurred.", "error");
    }
  }

  function handleNavigate(projectName, projectId) {
    console.log(projectId)
    $currentProjectName = projectName;
    $currentProjectId = projectId;

    navigate("/project");
  }
</script>

<h1>Hello {$user}</h1>
<p>
  Here you can see a list of projects you're involved in or create a new
  project.
</p>
<form on:submit={handleCreateProject}>
<label for="newProjectName">New project name</label>
<input type="text" bind:value={newProjectName} required />
<button>Submit</button>
</form>

{#if projectData.length > 0}
{#each projectData as project}
  <div class="column">
    <button on:click={() => handleNavigate(project.projectName, project._id)}><h2>{project.projectName}</h2></button>
    <p>Users assigned to project:</p>
    <ul>
      {#each project.users as user}
        <li>{user}</li>
      {/each}
    </ul>
  </div>
{/each}
{:else}
  <p>No projects found.</p>
{/if}
