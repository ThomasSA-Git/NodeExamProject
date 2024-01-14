<script>
  import { createEventDispatcher } from 'svelte';
  import "../../assets/css/taskModal.css";
  import { purify } from "../../assets/js/purification.js";
  // prop from parent, allows
  export let addTask;

  let taskName = "";
  let description = "";
  let url = "";
  let startDate = "";
  let endDate = "";

  // used to communicate with parent and trigger event/function
  const dispatch = createEventDispatcher();

  function handleSubmit() {
    // validate required input fields. Event below will not be dispatched if they're not
    if (!taskName || !startDate || !endDate) {
      return;
    }

    // use addTask in parent
    addTask({
      name: purify(taskName),
      description: purify(description),
      url: purify(url),
      startDate,
      endDate,
    });

    // clear input fields after adding task
    taskName = "";
    description = "";
    url = "";
    startDate = "";
    endDate = "";

    // closes the modal after adding task
    dispatch('closeModal');
  }

  function handleClose() {
    // clears input fields and close the modal without adding the task
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