<script>
  import { onMount } from "svelte";
  import { user } from "../../store/stores.js";
  import { BASE_URL } from "../../store/global.js";
  import { currentProjectName, currentProjectId } from "../../store/project.js";
  import "../../assets/css/toast.css";
  import "../../assets/css/userPage.css";
  import { showToast } from "../../assets/js/toast.js";
  import { navigate } from "svelte-navigator";
  import { paginate, LightPaginationNav } from "svelte-paginate";

  let data = [];

  // needs to be named items to be used in paginate
  let items = [];

  let currentPage = 1;
  let pageSize = 4;
  $: paginatedItems = paginate({ items, pageSize, currentPage });

  let newProjectName;

  onMount(async () => {
    loadProjects();
  });

  async function loadProjects() {
    try {
      const response = await fetch(
        $BASE_URL + `/projects`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const responseData = await response.json();
        data = responseData.data;
        items = responseData.data;
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to fetch project data.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("An error occurred.", "error");
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
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
        newProjectName = "";
        $currentProjectName = newProjectName; // or use result.projectName if it's returned
        showToast(result.message, "success");
        setTimeout(() => {
          loadProjects();
        }, 2000);
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
    $currentProjectName = projectName;
    $currentProjectId = projectId;

    navigate("/project");
  }

  let sortColumn = null;
  let sortDirection = 'asc';

  function sortBy(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortColumn = column;
      sortDirection = 'asc';
    }

    // Sort the items array
    items = [...items].sort((a, b) => {
      const aValue = column === 'projectName' ? a.projectName : a.createdAt;
      const bValue = column === 'projectName' ? b.projectName : b.createdAt;

      if (sortDirection === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
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
  <button>Create</button>
</form>

<hr />

{#if items.length > 0}
<table class="items">
  <thead>
    <tr>
      <th on:click={() => sortBy('projectName')}>Project Name</th>
      <th on:click={() => sortBy('createdAt')}>Created at</th>
    </tr>
  </thead>
  <tbody>
    {#each paginatedItems as item}
      <tr
        class="item"
        on:click={() => handleNavigate(item.projectName, item._id)}
      >
        <td>{item.projectName}</td>
        <!-- Add more columns as needed -->
        <td style="max-width: 100px;">{item.createdAt}</td>
      </tr>
    {/each}
  </tbody>
</table>
{:else}
<p>You're not involved in any projects yet. Create one to see list.</p>

{/if}
<LightPaginationNav
  totalItems={items.length}
  {pageSize}
  {currentPage}
  limit={1}
  showStepOptions={true}
  on:setPage={(e) => (currentPage = e.detail.page)}
/>