<script>
    import { createEventDispatcher } from 'svelte';
    import "../css/taskModal.css";
  
    export let updateTask;
    export let taskToUpdate;
  
    let updatedTaskName = taskToUpdate.name;
    let updatedDescription = taskToUpdate.description;
    let updatedUrl = taskToUpdate.url;
    let updatedStartDate = taskToUpdate.startDate;
    let updatedEndDate = taskToUpdate.endDate;
  
    const dispatch = createEventDispatcher();
  
    function handleSubmit() {
      if (!updatedTaskName || !updatedStartDate || !updatedEndDate) {
        
        return;
      }
  
      // Dispatches an event to update the task
      updateTask({
        name: updatedTaskName,
        description: updatedDescription,
        url: updatedUrl,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
      });
  
      // Close the modal
      dispatch('closeModal');
    }
  
    function handleClose() {
      // Close the modal without updating the task
      dispatch('closeModal');
    }
  </script>
  
  <div class="modal">
    <h2>Update Task</h2>
    <form on:submit|preventDefault={handleSubmit}>
      <label for="updatedTaskName">Task Name:</label>
      <input type="text" id="updatedTaskName" bind:value={updatedTaskName} required>
  
      <label for="updatedDescription">Description:</label>
      <textarea id="updatedDescription" bind:value={updatedDescription}></textarea>
  
      <label for="updatedUrl">URL:</label>
      <input id="updatedUrl" bind:value={updatedUrl}>
  
      <label for="updatedStartDate">Start Date:</label>
      <input type="date" id="updatedStartDate" bind:value={updatedStartDate}>
  
      <label for="updatedEndDate">End Date:</label>
      <input type="date" id="updatedEndDate" bind:value={updatedEndDate}>
  
      <button type="submit">Update Task</button>
    </form>
    <button on:click={handleClose}>Close</button>
  </div>