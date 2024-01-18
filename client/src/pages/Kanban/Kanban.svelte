<script>
  // @ts-nocheck
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
  // addition for socket
  import { getSocket } from "../../util/socketService";

  let socket = null;

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/auth/authSocket", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        socket = getSocket();
        loadKanban();
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });
  // default kanban when none is created yet
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

  // load kanban from project
  function loadKanban() {
    try {
      socket.emit("load-kanban", {
        projectId: $currentProjectId,
      });

      socket.on("kanban-data", (data) => {
        if (data.kanban && Array.isArray(data.kanban)) {
          if (data.kanban.length > 0) {
            kanban = data.kanban;
            if (data.message != "") {
              showToast(data.message, "success");
            }
          }
        } else {
          showToast("Loaded data not compatible.", "error");
        }
      });
    } catch (error) {
      showToast(error, "error");
    }
  }

  // update kanban for each client in the same project room
  function handleUpdateKanban() {
    socket.emit("update-kanban", {
      kanban,
      projectId: $currentProjectId,
      username: $user,
    });
    socket.on("kanban-error", (data) => {
      showToast(data.message, "error");
    });
  }

  // save kanban upon exit
  function handleSaveKanban() {
    socket.emit("save-kanban", {
      kanban,
      projectId: $currentProjectId,
      username: $user,
    });
    socket.on("save-success-kanban", (data) => {
      showToast(data.message, "success");
    });
  }

  // Drag start event for tasks
  function dragStart(event, listIndex, taskIndex) {
    // Create a data object with listIndex and taskIndex
    const data = { listIndex, taskIndex };
    // Set the drag-and-drop data with the JSON-serialized data object
    event.dataTransfer.setData("text/plain", JSON.stringify(data));
  }

  // Drop event for tasks
  function drop(event, listIndex) {
    event.preventDefault();
    // get the JSON-serialized data from the drag-and-drop data
    const json = event.dataTransfer.getData("text/plain");
    const data = JSON.parse(json);

    // get the task from the original list and update the Kanban board
    const [task] = kanban[data.listIndex].tasks.splice(data.taskIndex, 1);

    // Add the task to the new list and trigger a Kanban board update
    kanban[listIndex].tasks.push(task);
    kanban = kanban;
    handleUpdateKanban();
  }

  function handleAddList() {
    const newList = {
      name: "New List",
      tasks: [],
    };

    // update lists in kanban
    kanban = [...kanban, newList];
    handleUpdateKanban();
  }

  // Function to handle editing list name
  function handleEditListName(listIndex, newName) {
    kanban[listIndex].name = purify(newName);
    handleUpdateKanban();
  }

  // Modal logic for add task
  let isModalOpen = false;

  function openModal(listIndex) {
    selectedListIndex = listIndex;
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  let selectedListIndex = 0;

  function addTask(newTask) {
    // adds the new task to the selected list index
    kanban[selectedListIndex].tasks = [
      newTask,
      ...kanban[selectedListIndex].tasks,
    ];
    handleUpdateKanban();
    isModalOpen = false;
  }

  // modal logic for update task
  let isUpdateModalOpen = false;

  let taskToUpdate;
  let listIndexToUpdate;
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
    // updates the task in the correct list and at the correct index
    kanban[listIndexToUpdate].tasks[updateTaskIndex] = updatedTask;
    kanban = [...kanban];
    handleUpdateKanban();
    closeUpdateModal();
  }

  // delete functions for task and list
  function deleteTask(listIndex, taskIndex) {
    kanban[listIndex].tasks.splice(taskIndex, 1);
    // updates tasks on lists array to trigger reactivity
    kanban = [...kanban];
    handleUpdateKanban();
  }

  function deleteList(listIndex) {
    kanban.splice(listIndex, 1);
    // updates lists array to trigger reactivity
    kanban = [...kanban];
    handleUpdateKanban();
  }

  // on destroy
  onDestroy(() => {
    handleSaveKanban();
  });

  function handleNavigate(path) {
    navigate(path);
  }
</script>

<div class="btn-container">
  <h3 style="margin-right: 300px;">Kanban board for {$currentProjectName}</h3>
  <button class="btn-container-btn" on:click={handleAddList}>Add list</button>
<!--   <button class="btn-container-btn" on:click={openModal}>Add Task</button> -->
  <button class="navigate-button" on:click={() => handleNavigate("/project")}
    >Dashboard</button
  >
</div>

{#if isModalOpen}
  <TaskModal on:closeModal={closeModal} {addTask} {selectedListIndex} />
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
      <div class="kan-col">
        <input
          style="font: bold 16px Arial, sans-serif; max-width: 115px;"
          bind:value={list.name}
          placeholder={list.name}
          on:change={handleEditListName(listIndex, list.name)}
        />
        <!-- add by list -->
        <button class="btn-container-btn" on:click={() => openModal(listIndex)}
          >+task</button
        >
        <button class="delete-button" on:click={() => deleteList(listIndex)}>
          <img
            src="../../delete-icon.jpg"
            alt="Delete List"
            class="delete-image"
          />
        </button>
        <hr />
        <ul
          on:drop={(event) => drop(event, listIndex)}
          ondragover="return false"
          style="list-style-type: none; padding: 0; height: 420px; overflow-y: auto;"
        >
          {#each list.tasks as task, taskIndex (task)}
            <div class="task">
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
