<script>
  import EditorJS from "@editorjs/editorjs";
  import { onMount } from "svelte";
  import { BASE_URL } from "../../store/global";
  import { currentProjectId, currentNoteName } from "../../store/project";
  import { showToast } from "../../assets/js/toast.js";
  import "../../assets/css/toast.css";
  import { navigate } from "svelte-navigator";

  let editor;

  onMount(loadData);

  let noteData;

  function initializeEditor() {
    editor = new EditorJS({
      holder: "editorjs",
      autofocus: true,
      data: noteData,
    });
  }

  async function loadData() {
    try {
      const response = await fetch($BASE_URL + `/notes/${$currentNoteName}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      noteData = data[0].note;
      initializeEditor();
    } catch (error) {
      showToast(error, "error");
    }
  }

  async function handleUpdate() {
    try {
      const savedNoteData = await editor.save();

      // Prepare the updated note object without wrapping it in an array
      const updatedNote = {
        noteName: $currentNoteName,
        note: savedNoteData,
      };
      const response = await fetch($BASE_URL + "/notes/" + $currentNoteName, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedNote),
        credentials: "include",
      });
      if (response.ok) {
        const result = await response.json();
        showToast(result.message, "success");
      } else {
        const errorData = await response.json();
        showToast(errorData.message, "error");
      }
    } catch (error) {
      showToast(`Save failed. Error: ${error.message}`, "error");
    }
  }

  function handleNavigate() {
    navigate("/noteOverview");
  }
</script>

<div>

  <button on:click={handleUpdate}>Save changes</button>
  <button class="navigate-button" on:click={handleNavigate}>Back</button>
  <div id="editorjs"></div>
</div>

<style>
  #editorjs {
    margin: 20px;
    border: 1px solid #ccc;
  }
</style>
