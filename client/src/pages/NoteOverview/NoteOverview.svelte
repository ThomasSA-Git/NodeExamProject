<script>
  import { onMount } from "svelte";
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import { BASE_URL } from "../../store/global";
  import { currentProjectId, currentNoteName } from "../../store/project";
  import { showToast } from "../../assets/js/toast";
  import { navigate } from "svelte-navigator";
  import "../../assets/css/toast.css";
  import "../../assets/css/noteOverview.css";

  let newNoteName;

  // needs to be named items to be used in paginate
  let items = [];

  let currentPage = 1;
  let pageSize = 6;
  $: paginatedItems = paginate({ items, pageSize, currentPage });

  let sortColumn = null;
  let sortDirection = "asc";

  function sortBy(column) {
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      sortColumn = column;
      sortDirection = "asc";
    }

    // Sort the items array
    items = [...items].sort((a, b) => {
      const aValue = column === "projectName" ? a.projectName : a.createdAt;
      const bValue = column === "projectName" ? b.projectName : b.createdAt;

      if (sortDirection === "asc") {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }

  onMount(loadNotes);

  async function loadNotes() {
    try {
      const response = await fetch($BASE_URL + `/notes`, {
        credentials: "include",
      });

      if (response.ok) {
        const responseData = await response.json();
        items = responseData.data;
        items.reverse();
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to fetch note data.";
        showToast(errorMessage, "error");
      }
    } catch (error) {
      showToast("An error occurred.", "error");
    }
  }

  async function handleCreateNewNote() {
    try {
    
      const newNote = {
        time: new Date().getTime(),
        blocks: [
          {
            type: "paragraph",
            data: {
              text: "Hello, I'm your new note!",
            },
          },
        ],
        version: "2.12.4",
      };

      const noteData = {
        projectId: $currentProjectId,
        note: {
          noteName: newNoteName,
          note: newNote,
        },
      };

      const response = await fetch($BASE_URL + "/notes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(noteData),
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        if(result.created){
        $currentNoteName = newNoteName;
        newNoteName = "";
        //navigation and reset of newNoteName not working. FIXXX!!!!!!
        navigate("/notes")
      }
      else{
        showToast(result.message, "error");
      }
      } else {
        console.error("Failed to save data:", response.statusText);
      }
    } catch (error) {
      console.error("Error during save:", error);
    }
  }

  function handleDate(date) {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  function handleNavigate(noteName) {
    $currentNoteName = noteName;
    navigate("/notes");
  }
</script>

  <label for="newNoteName">New note name</label>
  <input type="text" bind:value={newNoteName} required />
  <button on:click={handleCreateNewNote}>Create</button>

<hr />

{#if items.length > 0}
  <table class="items">
    <thead>
      <tr>
        <th on:click={() => sortBy("noteName")}>Note Name</th>
        <th on:click={() => sortBy("createdAt")}>Created at</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedItems as item}
        <tr
          class="item"
          on:click={() => handleNavigate(item.noteName)}
        >
          <td>{item.noteName}</td>
          <td style="max-width: 100px;">{handleDate(item.note.time)}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>You don't have any notes yet. Create one to see list.</p>
{/if}
<LightPaginationNav
  totalItems={items.length}
  {pageSize}
  {currentPage}
  limit={1}
  showStepOptions={true}
  on:setPage={(e) => (currentPage = e.detail.page)}
/>
<button class="navigate-button" on:click={() => navigate("/project")}
  >Back to project</button
>
