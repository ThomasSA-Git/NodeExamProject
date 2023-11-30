<script>
  // @ts-nocheck

  import { flip } from "svelte/animate";
  import "../../assets/css/kanban.css";
  import TaskModal from "../../assets/modal/TaskModal.svelte";
  import UpdateTaskModal from "../../assets/modal/UpdateTaskModal.svelte";

  let lists = [
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

    const [task] = lists[data.listIndex].tasks.splice(data.taskIndex, 1);

    lists[listIndex].tasks.push(task);
    lists = lists;

    hoveringOverList = null;
  }

  function handleAddList() {
    const newList = {
      name: "New List",
      tasks: [],
    };

    // Use set to update the lists array
    lists = [...lists, newList];
  }

  // Function to handle editing list name
  function handleEditListName(listIndex, newName) {
    lists[listIndex].name = newName;
  }

  function addTask(newTask) {
    // Add the new task to the first index of the lists array
    lists[0].tasks = [newTask, ...lists[0].tasks];
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
    lists[listIndexToUpdate].tasks[updateTaskIndex] = updatedTask;

    // Trigger reactivity
    lists = [...lists];
    closeUpdateModal();
  }

  function deleteTask(listIndex, taskIndex) {
    lists[listIndex].tasks.splice(taskIndex, 1);
    // Update tasks on lists array to trigger reactivity
    lists = [...lists];
  }

  function deleteList(listIndex) {
    lists.splice(listIndex, 1);
    // Update lists array to trigger reactivity
    lists = [...lists];
  }
</script>

<p>Kanban board</p>

<!-- Button for adding lists and tasks -->
<div class="btn-container">
  <button class="btn-container-btn" on:click={handleAddList}>Add list</button>
  <button class="btn-container-btn" on:click={openModal}>Add Task</button>
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

<div style="display: flex; gap: 20px;">
  {#each lists as list, listIndex (list)}
    <div animate:flip class="kan-col">
      <div
        class="list-name"
        contenteditable="true"
        on:input={(e) => handleEditListName(listIndex, e.target)}
      >
        <strong>{list.name}</strong>
      </div>
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
