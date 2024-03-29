<script>
  import { onMount } from "svelte";
  import { paginate, LightPaginationNav } from "svelte-paginate";
  import { BASE_URL } from "../../store/global.js";
  import { user } from "../../store/stores.js";
  import { currentProjectId, currentNoteName } from "../../store/project.js";
  import { showToast } from "../../assets/js/toast.js";
  import { purify } from "../../assets/js/purification.js";
  import { navigate } from "svelte-navigator";
  import { getSocket } from "../../util/socketService";
  import "../../assets/css/toast.css";
  import "../../assets/css/noteOverview.css";

  let newNoteName;
  let socket;

  // needs to be named items to be used in paginate
  let items = [];

  let currentPage = 1;
  let pageSize = 6;
  $: paginatedItems = paginate({ items, pageSize, currentPage });

  let sortColumn = null;
  let sortDirection = "asc";

  function sortBy(column) {
    // ff the same column is clicked again change the sort direction
    if (sortColumn === column) {
      sortDirection = sortDirection === "asc" ? "desc" : "asc";
    } else {
      // if a new column is clicked then reset the sort column and set direction to "asc"
      sortColumn = column;
      sortDirection = "asc";
    }
    // sort the items array based on the selected column and direction
    items = [...items].sort((a, b) => {
      // determine values to compare based on the selected column
      const aValue = a[column];
      const bValue = b[column];
      // add a check for undefined values
      if (aValue === undefined || bValue === undefined) {
        return 0; // Handle undefined values by treating them as equal
      }
      // compare values based on sort direction
      if (column === "time") {
        // Sort by date without using localeCompare
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        // localeCompare used for string comparison
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }

  onMount(loadNotes);

  // load array of notes
  async function loadNotes() {
    try {
      const response = await fetch($BASE_URL + `/notes`, {
        credentials: "include",
      });

      if (response.ok) {
        socket = getSocket();
        const result = await response.json();
        items = result.notes;
      } else {
        const error = await response.json();
        showToast(error.message, "info");
      }
    } catch (error) {
      showToast("An error occurred during load.", "error");
    }

    socket.on("user-editing", (data) => {
      showToast(data.message, "info");
      items = data.notes;
    });

    socket.on("user-stopped-editing", (data) => {
      showToast(data.message, "info");
      items = data.notes;
    });

    socket.on("editor-count-error", (data) => {
      showToast(data.message, "error");
    });
  }

  // create new note
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

      if (newNoteName === undefined) {
        newNoteName = "Project Note";
      }

      const noteData = {
        projectId: $currentProjectId,
        note: {
          noteName: purify(newNoteName),
          lastEditedBy: $user,
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
        $currentNoteName = purify(newNoteName);
        newNoteName = "";
        navigate("/notes");
      } else {
        const error = await response.json();
        showToast(error.message, "error");
      }
    } catch (error) {
      showToast(`Error during save: ${error}`, "error");
    }
  }

  // sets being edited to true if the value is not null, undefined or 0
  function isBeingEdited(editorCounter) {
    if (
      editorCounter !== null &&
      editorCounter !== undefined &&
      editorCounter > 0
    ) {
      editorCounter = true;
    } else {
      editorCounter = false;
    }
    return editorCounter;
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
        <th on:click={() => sortBy("time")}>Created at</th>
        <th on:click={() => sortBy("lastEditedBy")}>Last edited by</th>
        <th>Being edited</th>
      </tr>
    </thead>
    <tbody>
      {#each paginatedItems as item}
        <tr class="item" on:click={() => handleNavigate(item.noteName)}>
          <td>{item.noteName}</td>
          <td style="max-width: 100px;">{item.note.time}</td>
          <td>{item.lastEditedBy}</td>
          <td>{isBeingEdited(item.editorCounter)}</td>
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
  >Dashboard</button
>
