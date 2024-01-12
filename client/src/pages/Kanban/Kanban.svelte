<script>
  // @ts-nocheck

  import { flip } from "svelte/animate";
  import "../../assets/css/kanban.css";
  import "../../assets/css/toast.css";
  import TaskModal from "../../components/modal/TaskModal.svelte";
  import UpdateTaskModal from "../../components/modal/UpdateTaskModal.svelte";
  import { BASE_URL, IO_URL } from "../../store/global";
  import io from "socket.io-client";
  import { onMount, onDestroy } from "svelte";
  import { currentProjectId, currentProjectName } from "../../store/project";
  import { user } from "../../store/stores";
  import { showToast } from "../../assets/js/toast.js";
  import { purify } from "../../assets/js/purification.js";
  import { navigate } from "svelte-navigator";

  let socket = null;

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/auth/authSocket", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        socket = io($IO_URL, {
          query: {
            projectId: $currentProjectId,
            username: $user,
          },
        });
        loadKanban();
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  let kanban = [
    {
      name: "To do",
      tasks: [],
    },
    {
      name: "In progress",
      tasks: [],
    },
    {
      name: "Completed",
      tasks: [],
    },
    {
      name: "Discarded",
      tasks: [],
    },
  ];

  function loadKanban() {
    try {
      socket.emit("load-kanban", {
        projectId: $currentProjectId,
        username: $user,
      });

      socket.on("kanban-data", (data) => {
        if (data && Array.isArray(data)) {
          if (data.length > 0) {
            kanban = data;
          }
        }
      });
    } catch (error) {
      console.error("Error emitting load-kanban event:", error);
    }
  }

  function handleSaveKanban() {
    socket.emit("save-kanban", {
      kanban,
      projectId: $currentProjectId,
      username: $user,
    });
    socket.on("save-success", (data) => {
      showToast(data.message, "success");
    });
    socket.on("save-failure", (data) => {
      showToast(data.message, "error");
    });
  }

  let hoveringOverList;

  let listIndexToUpdate;

  function dragStart(event, listIndex, taskIndex) {
    const data = { listIndex, taskIndex };
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  }

  function drop(event, listIndex) {
    event.preventDefault();
    const json = event.dataTransfer.getData("text/plain");
    const data = JSON.parse(json);

    const [task] = kanban[data.listIndex].tasks.splice(data.taskIndex, 1);

    kanban[listIndex].tasks.push(task);
    kanban = kanban;
    handleSaveKanban();
    hoveringOverList = null;
  }

  function handleAddList() {
    const newList = {
      name: "New List",
      tasks: [],
    };

    // update lists in kanban
    kanban = [...kanban, newList];
    handleSaveKanban();
  }

  // Function to handle editing list name
  function handleEditListName(listIndex, newName) {
    kanban[listIndex].name = purify(newName);
    handleSaveKanban();
  }

  function addTask(newTask) {
    // Adds the new task to the first index of the lists array
    kanban[0].tasks = [newTask, ...kanban[0].tasks];
    handleSaveKanban();
  }

  // Modal logic
  let isModalOpen = false;

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  let isUpdateModalOpen = false;
  let taskToUpdate;
  let updateTaskIndex;

  function openUpdateModal(listIndex, taskIndex, task) {
    taskToUpdate = task;
    updateTaskIndex = taskIndex;
    listIndexToUpdate = listIndex;
    isUpdateModalOpen = true;
  }

  function closeUpdateModal() {
    isUpdateModalOpen = false;
  }

  function updateTask(updatedTask) {
    // Updates the task in the correct list and at the correct index
    kanban[listIndexToUpdate].tasks[updateTaskIndex] = updatedTask;

    kanban = [...kanban];
    handleSaveKanban();
    closeUpdateModal();
  }

  function deleteTask(listIndex, taskIndex) {
    kanban[listIndex].tasks.splice(taskIndex, 1);
    // Updates tasks on lists array to trigger reactivity
    kanban = [...kanban];
    handleSaveKanban();
  }

  function deleteList(listIndex) {
    kanban.splice(listIndex, 1);
    // Updates lists array to trigger reactivity
    kanban = [...kanban];
    handleSaveKanban();
  }

  onDestroy(() => {
    socket.emit("leave-room", { projectId: $currentProjectId });
  });

  function handleNavigate(path) {
    navigate(path);
  }
</script>

<div class="btn-container">
  <h3 style="margin-right: 300px;">Kanban board for {$currentProjectName}</h3>
  <button class="btn-container-btn" on:click={handleAddList}>Add list</button>
  <button class="btn-container-btn" on:click={openModal}>Add Task</button>
  <button class="navigate-button" on:click={() => handleNavigate("/project")}
    >Dashboard</button
  >
</div>

{#if isModalOpen}
  <TaskModal on:closeModal={closeModal} {addTask} />
{/if}

{#if isUpdateModalOpen}
  <UpdateTaskModal
    on:closeModal={closeUpdateModal}
    {updateTask}
    {taskToUpdate}
  />
{/if}
<div class="kan-container">
  <div style="display: flex; gap: 20px; overflow-x: auto;">
    {#each kanban as list, listIndex (list)}
      <div animate:flip class="kan-col">
        <input
          style="font: bold 16px Arial, sans-serif; max-width: 180px"
          bind:value={list.name}
          placeholder={list.name}
          on:change={handleEditListName(listIndex, list.name)}
        />

        <button class="delete-button" on:click={() => deleteList(listIndex)}>
          <img
            src="../../delete-icon.jpg"
            alt="Delete List"
            class="delete-image"
          />
        </button>
        <hr />
        <ul
          class:hovering={hoveringOverList === list.name}
          on:dragenter={() => (hoveringOverList = list.name)}
          on:dragleave={() => (hoveringOverList = null)}
          on:drop={(event) => drop(event, listIndex)}
          ondragover="return false"
          style="list-style-type: none; padding: 0; height: 420px; overflow-y: auto;"
        >
          {#each list.tasks as task, taskIndex (task)}
            <div class="task" animate:flip>
              <li
                class="task-content"
                draggable={true}
                on:dragstart={(event) => dragStart(event, listIndex, taskIndex)}
              >
                <strong>{task.name}</strong>
                <!-- edit button for task -->
                <button
                  class="edit-button"
                  on:click={() => openUpdateModal(listIndex, taskIndex, task)}
                >
                  <img
                    src="../../edit-icon.png"
                    alt="Edit Task"
                    class="edit-image"
                  />
                </button>
                <!-- delete button for task -->
                <button
                  class="delete-button"
                  on:click={() => deleteTask(listIndex, taskIndex)}
                >
                  <img
                    src="../../delete-icon.jpg"
                    alt="Delete Task"
                    class="delete-image"
                  />
                </button>
              </li>
            </div>
          {/each}
        </ul>
      </div>
    {/each}
  </div>
</div>
