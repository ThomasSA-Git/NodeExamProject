<script>
  // @ts-nocheck

  import { flip } from "svelte/animate";
  import "../../assets/css/kanban.css";
  import "../../assets/css/toast.css";
  import TaskModal from "../../assets/modal/TaskModal.svelte";
  import UpdateTaskModal from "../../assets/modal/UpdateTaskModal.svelte";
  import { IO_URL } from "../../store/global";
  import io from "socket.io-client";
  import { onMount } from "svelte";
  import { currentProjectId } from "../../store/project";
  import { currentProjectName } from "../../store/project";
  import { showToast } from "../../assets/js/toast.js";
  import { navigate } from "svelte-navigator";

  const socket = io($IO_URL);

  let kanban = [
    {
      name: "To do",
      tasks: [
        {
          name: "test",
          description: "test",
          url: "",
        },
      ],
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

    hoveringOverList = null;
  }

  function handleAddList() {
    const newList = {
      name: "New List",
      tasks: [],
    };

    // Use set to update the lists array
    kanban = [...kanban, newList];
  }

  // Function to handle editing list name
  function handleEditListName(listIndex, newName) {
    kanban[listIndex].name = newName;
  }

  function addTask(newTask) {
    // Add the new task to the first index of the lists array
    kanban[0].tasks = [newTask, ...kanban[0].tasks];
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
    listIndexToUpdate = listIndex; // Add this line to capture listIndex
    isUpdateModalOpen = true;
  }

  function closeUpdateModal() {
    isUpdateModalOpen = false;
  }

  function updateTask(updatedTask) {
    // Update the task in the correct list and at the correct index
    kanban[listIndexToUpdate].tasks[updateTaskIndex] = updatedTask;

    // Trigger reactivity
    kanban = [...kanban];
    closeUpdateModal();
  }

  function deleteTask(listIndex, taskIndex) {
    kanban[listIndex].tasks.splice(taskIndex, 1);
    // Update tasks on lists array to trigger reactivity
    kanban = [...kanban];
  }

  function deleteList(listIndex) {
    kanban.splice(listIndex, 1);
    // Update lists array to trigger reactivity
    kanban = [...kanban];
  }

  onMount(async () => {
    try {
      socket.emit("load-kanban", await $currentProjectId);

      socket.on("kanban-data", (data) => {
        console.log(data);
        if (data && Array.isArray(data)) {
          kanban = data;
        }
      });
    } catch (error) {
      console.error("Error emitting load-kanban event:", error);
    }

    // Clean up the interval when the component is unmounted
  });

  function startUpdateInterval() {
    // Clear the existing interval (if any)
    clearInterval(updateInterval);

    // Set a new interval
    updateInterval = setInterval(() => {
      handleUpdateKanban();
    }, 120000);
  }

  function handleUpdateKanban() {
    socket.emit("update-kanban", { kanban, projectId: $currentProjectId });
    socket.on("update-success", (data) => {
      showToast(data.message, "success");
      startUpdateInterval();
    });
    socket.on("update-failure", (data) => {
      showToast(data.message, "error");
    });
  }

  function handleNavigate(path) {
    navigate(path);
  }
</script>

<!-- Button for adding lists and tasks -->
<div class="btn-container">
  <h3 style="margin-right: 300px;">Kanban board for {$currentProjectName}</h3>
  <button class="btn-container-btn" on:click={handleAddList}>Add list</button>
  <button class="btn-container-btn" on:click={openModal}>Add Task</button>
  <button class="btn-container-btn" on:click={handleUpdateKanban}
    >Save kanban</button
  >
  <button class="navigate-button" on:click={() => handleNavigate("/project")}>Project overview</button>
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

<div style="display: flex; gap: 20px; overflow-x: auto;">
  {#each kanban as list, listIndex (list)}
    <div animate:flip class="kan-col">
      <input
        style="font: bold 16px Arial, sans-serif; max-width: 180px"
        bind:value={list.name}
        placeholder={list.name}
        on:keydown={handleEditListName(listIndex, list.name)}
      />

      <button class="delete-button" on:click={() => deleteList(listIndex)}>
        <img
          src="../../public/delete-icon.jpg"
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
        style="list-style-type: none; padding: 0;"
      >
        {#each list.tasks as task, taskIndex (task)}
          <div class="task" animate:flip>
            <li
              class="task-content"
              draggable={true}
              on:dragstart={(event) => dragStart(event, listIndex, taskIndex)}
            >
              <strong>{task.name}</strong>
              <!-- Edit button for task -->
              <button
                class="edit-button"
                on:click={() => openUpdateModal(listIndex, taskIndex, task)}
              >
                <img
                  src="../../public/edit-icon.png"
                  alt="Edit Task"
                  class="edit-image"
                />
              </button>
              <!-- Delete button for task -->
              <button
                class="delete-button"
                on:click={() => deleteTask(listIndex, taskIndex)}
              >
                <img
                  src="../../public/delete-icon.jpg"
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
