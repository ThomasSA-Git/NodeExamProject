<script>
  import EditorJS from '@editorjs/editorjs';
  import { onMount } from 'svelte';
  import { BASE_URL } from '../../store/global';
  import { currentProjectId } from '../../store/project';

  let editor;

  let newNoteName

/*   onMount(loadData); */


  // Sample data to load initially
  let initialData = {
    time: 1556098174501,
    blocks: [
      {
        type: 'paragraph',
        data: {
          text: 'Hello, Editor.js!',
        },
      },
    ],
    version: '2.12.4',
  };

  function initializeEditor() {
    editor = new EditorJS({
      holder: 'editorjs',
      autofocus: true,
      data: initialData,
    });
  }

  async function handleSave() {
    try {
      const outputData = await editor.save();

      const noteData = {
        projectId: $currentProjectId,
        note: {
          noteName: newNoteName,
          outputData
        }
      }

      // Handle the saved data (outputData)
      console.log('Saved data:', outputData);

      const response = await fetch($BASE_URL + '/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(noteData),
        credentials: 'include',
      });

      if (response.ok) {
        console.log('Data saved successfully!');
      } else {
        console.error('Failed to save data:', response.statusText);
      }
    } catch (error) {
      console.error('Error during save:', error);
    }
  }

//   async function loadData() {
//  await fetch($BASE_URL + "/notes" /* + input note id here*/)
//  }
</script>

<style>
  #editorjs {
    margin: 20px;
    border: 1px solid #ccc;
  }
</style>

<div>
  <form on:submit={handleSave}>
    <label for="newNoteName">New note name</label>
    <input type="text" bind:value={newNoteName} required />
    <button>Save</button>
  </form>
  
 <!--  <button on:click={loadData}>Load Data</button> -->
  <button on:click={initializeEditor}>Initialize Editor</button>

  <div id="editorjs"></div>
</div>
