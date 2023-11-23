<script>
  import { createEventDispatcher } from 'svelte';

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
      alert("Please fill in all required fields.");
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

<style>
  .modal {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 20px;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    z-index: 1000;
  }

  label {
    display: block;
    margin-bottom: 8px;
  }

  input,
  textarea,
  button {
    margin-bottom: 16px;
  }

  button {
    padding: 8px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
</style>

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
    <input type="date" id="startDate" bind:value={startDate} required>

    <label for="endDate">End Date:</label>
    <input type="date" id="endDate" bind:value={endDate} required>

    <button type="submit">Create Task</button>
  </form>
  <button on:click={handleClose}>Close</button>
</div>