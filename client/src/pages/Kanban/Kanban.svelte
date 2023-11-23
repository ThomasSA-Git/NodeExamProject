<script>
  // @ts-nocheck

  import { flip } from "svelte/animate";
  import "../../assets/css/kanban.css";
  import TaskModal from "../../assets/modal/TaskModal.svelte";

  let lists = [
    {
      name: "To do",
      tasks: [
        {
          name: "test",
          description: "test",
          url: ""
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

<div class="btn-container">
  <button class="btn-container-btn" on:click={handleAddList}>Add list</button>
  <button class="btn-container-btn" on:click={openModal}>Add Task</button>
</div>
{#if isModalOpen}
  <TaskModal on:closeModal={closeModal} {addTask} />
{/if}

<div style="display: flex; gap: 20px;">
  {#each lists as list, listIndex (list)}
    <div animate:flip class="kan-col">
      <div
        class="list-name"
        contenteditable="true"
        on:input={(e) => handleEditListName(listIndex, e.target)}
      >
        {list.name}
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
              {task.name}
            </li>
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
          </div>
        {/each}
      </ul>
    </div>
  {/each}
</div>
