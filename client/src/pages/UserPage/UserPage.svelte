<script>
  import { onMount } from "svelte";
  import { user } from "../../store/stores.js";
  import { BASE_URL } from "../../store/global.js";
  import { currentProjectName, currentProjectId } from "../../store/project.js";
  import "../../assets/css/toast.css";
  import "../../assets/css/userPage.css";
  import { showToast } from "../../assets/js/toast.js";
  import { purify } from "../../assets/js/purification.js";
  import { navigate } from "svelte-navigator";
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import { disconnectSocket } from "../../util/socketService.js";

  // needs to be named items to be used in paginate
  let items = [];

  let currentPage = 1;
  let pageSize = 4;
  $: paginatedItems = paginate({ items, pageSize, currentPage });

  let newProjectName;

  onMount(loadProjects);

  async function loadProjects() {
    disconnectSocket();
    try {
      const response = await fetch($BASE_URL + `/projects`, {
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        items = result.data;
      } else {
        const error = await response.json();
        showToast(error.message, "error");
      }
    } catch (error) {
      showToast("An error occurred. Could not load projects", "error");
    }
  }

  async function handleCreateProject(event) {
    event.preventDefault();
    try {
      const newProjectData = {
        projectName: purify(newProjectName),
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
        $currentProjectName = purify(newProjectName);
        showToast(result.message, "success");
        setTimeout(() => {
          loadProjects();
        }, 2000);
      } else {
        const error = await response.json();
        showToast(error.message, "error");
      }
    } catch (error) {
      showToast(
        `An error occurred. Could not create project: ${error}`,
        "error"
      );
    }
  }

  async function handleNavigate(projectName, projectId) {
    $currentProjectName = projectName;
    $currentProjectId = projectId;
    navigate("/project");
  }

  let sortColumn = null;
  let sortDirection = "asc";

  function sortBy(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }

    // sorts tshe array with projects (called items because of paginate lite)
    // use spread operator to make shallow copy to sort before setting items
    items = [...items].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      if (aValue === undefined || bValue === undefined) {
        return 0; // handle undefined values by treating them as equal
      }
      if (column === "createdAt") {
      // sort by date without using localeCompare
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    } else {
      // localeCompare used for string comparison
      return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
    }
    });
  }
</script>

<h1>Hello {$user}</h1>
<p style="text-align: center">
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
        <th on:click={() => sortBy("projectName")}>Project Name</th>
        <th on:click={() => sortBy("createdAt")}>Created at</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedItems as item}
        <tr
          class="item"
          on:click={() => handleNavigate(item.projectName, item._id)}
        >
          <td>{item.projectName}</td>
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
