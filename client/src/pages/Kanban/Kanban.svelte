<script>
  import { flip } from "svelte/animate";
  import TaskModal from "../../assets/modal/TaskModal.svelte";

  let lists = [
    {
      name: "To do",
      tasks: [/* "Create github repo", "Do homework" */],
    },
    {
      name: "In progress",
      tasks: [/* "Sleep", "Eat" */],
    },
    {
      name: "Completed",
      tasks: [/* "Do dishes" */],
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


</script>

<p>Kanban board</p>

<button on:click={handleAddList}>Add list</button>
<button on:click={openModal}>Add Task</button>

{#if isModalOpen}
<TaskModal on:closeModal={closeModal} addTask={addTask} />
{/if}

<div style="display: flex; gap: 20px;">
  {#each lists as list, listIndex (list)}
    <div animate:flip class="kan-col">
      <div
        contenteditable="true"
        on:input={(e) => handleEditListName(listIndex, e.target)}
      >
        {list.name}
      </div>
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
              draggable={true}
              on:dragstart={(event) => dragStart(event, listIndex, taskIndex)}
            >
              {task.name}
            </li>
          </div>
        {/each}
      </ul>
    </div>
  {/each}
</div>

<style>
  .hovering {
    border-color: rgb(0, 255, 34);
  }
  .task {
    display: block; /* Display tasks vertically */
  }
  li {
    background-color: lightgray;
    cursor: pointer;
    margin-bottom: 10px; /* Add margin between tasks */
    padding: 10px;
    border-radius: 5px; /* Rounded corners for tasks */
  }
  li:hover {
    background: green;
    color: white;
  }
  ul {
    height: 40px; /* needed when empty */
  }
  .kan-col {
    flex: 1;
    border: 1px solid lightgray;
    border-radius: 5px;
    padding: 10px;
    min-height: 500px;
  }
  /* Style for editable list name */
  [contenteditable="true"] {
    border: 1px solid lightgray;
    padding: 5px;
    border-radius: 3px;
    margin-bottom: 10px;
  }
</style>
