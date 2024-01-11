<script>
  import { createEventDispatcher } from 'svelte';
  import "../../assets/css/taskModal.css";
  export let addTask;

  let taskName = "";
  let description = "";
  let url = "";
  let startDate = "";
  let endDate = "";

  const dispatch = createEventDispatcher();
  function handleSubmit() {
    // Validate input fields
    if (!taskName || !startDate || !endDate) {
      
      return;
    }

    // Dispatch an event to add the new task to the board
    addTask({
      name: taskName,
      description,
      url,
      startDate,
      endDate,
    });

    // Clear input fields
    taskName = "";
    description = "";
    url = "";
    startDate = "";
    endDate = "";

    // Close the modal
    dispatch('closeModal');
  }

  function handleClose() {
    // Clear input fields and close the modal without adding the task
    taskName = "";
    description = "";
    url = "";
    startDate = "";
    endDate = "";

    dispatch('closeModal');
  }
</script>

<div class="modal">
  <h2>New Task</h2>
  <form on:submit|preventDefault={handleSubmit}>
    <label for="taskName">Task Name:</label>
    <input type="text" id="taskName" bind:value={taskName} required>

    <label for="description">Description:</label>
    <textarea id="description" bind:value={description}></textarea>

    <label for="url">URL:</label>
    <input id="url" bind:value={url}>

    <label for="startDate">Start Date:</label>
    <input type="date" id="startDate" bind:value={startDate}>

    <label for="endDate">End Date:</label>
    <input type="date" id="endDate" bind:value={endDate}>

    <button type="submit">Create Task</button>
  </form>
  <button on:click={handleClose}>Close</button>
</div>