<script>
    import { createEventDispatcher } from 'svelte';
    import "../../assets/css/taskModal.css";

    // prop function from parent
    export let updateTask;
    // prop variable from parent, gets set when opening update modal from list of tasks
    export let taskToUpdate;

    // sets all values to be equal to the task to be updated
    let updatedTaskName = taskToUpdate.name;
    let updatedDescription = taskToUpdate.description;
    let updatedUrl = taskToUpdate.url;
    let updatedStartDate = taskToUpdate.startDate;
    let updatedEndDate = taskToUpdate.endDate;
  
    const dispatch = createEventDispatcher();
  
    function handleSubmit() {
        // validate required input fields. Event below will not be dispatched if they're not
      if (!updatedTaskName || !updatedStartDate || !updatedEndDate) {
        
        return;
      }
      // use updateTask functionin parent
      updateTask({
        name: updatedTaskName,
        description: updatedDescription,
        url: updatedUrl,
        startDate: updatedStartDate,
        endDate: updatedEndDate,
      });
  
  
      // close the modal after updating task
      dispatch('closeModal');
    }
  
    function handleClose() {
      // close the modal without updating the task
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