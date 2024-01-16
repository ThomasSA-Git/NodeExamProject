<script>
  import EditorJS from "@editorjs/editorjs";
  import Header from "@editorjs/header";
  import Paragraph from "editorjs-paragraph-with-alignment";
  import Quote from "@editorjs/quote";
  import Alert from "editorjs-alert";
  import List from "@editorjs/list";
  import Alignment from "editorjs-text-alignment-blocktune";
  import { onMount, onDestroy } from "svelte";
  import { BASE_URL } from "../../store/global.js";
  import { user } from "../../store/stores.js";
  import { currentNoteName, currentProjectId } from "../../store/project.js";
  import { showToast } from "../../assets/js/toast.js";
  import "../../assets/css/toast.css";
  import "../../assets/css/noteSystem.css";
  import { navigate } from "svelte-navigator";
  import { getSocket } from "../../util/socketService";

  let editor;

  onMount(loadData);

  let noteData;
  let lastEditedBy;
  let socket;

  function initializeEditor() {
    editor = new EditorJS({
      holder: "editorjs",
      autofocus: true,
      data: noteData,
      tools: {
        header: {
          class: Header,
          tunes: ["anyTuneName"],
        },
        paragraph: {
          class: Paragraph,
        },
        quote: Quote,
        alert: Alert,
        list: List,
        anyTuneName: Alignment,
      },
    });
  }

  async function loadData() {
    try {
      const response = await fetch($BASE_URL + `/notes/${$currentNoteName}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const result = await response.json();
        showToast(result.message, "error");
      } else {
        const result = await response.json();
        noteData = result[0].note;
        lastEditedBy = result[0].lastEditedBy;
        socket = getSocket();
        initializeEditor();
        adjustCounterUp();
      }
    } catch (error) {
      showToast(error, "error");
    }

    socket.on("user-editing", (data) => {
      showToast(data.message, "info");
    });

    socket.on("user-stopped-editing", (data) => {
      //console.log(data)
      showToast(data.message, "info");
    });
  }

  async function handleUpdate() {
    try {
      const savedNoteData = await editor.save();

      // Prepare the updated note object without wrapping it in an array
      const updatedNote = {
        noteName: $currentNoteName,
        lastEditedBy: $user,
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
      const result = await response.json();
      if (response.ok) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(`Save failed. Error: ${error.message}`, "error");
    }
  }

  async function handleDeleteNote() {
    try {
      const response = await fetch($BASE_URL + `/notes/${$currentNoteName}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        showToast(result.message, "success");
        navigate("/noteOverview");
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  // adjust editor counter
  function adjustCounterUp() {
    socket.emit("add-to-counter", {
      noteName: $currentNoteName,
      projectId: $currentProjectId,
      username: $user,
    });
  }

  // adjust editor counter
  function adjustCounterDown() {
    socket.emit("subtract-from-counter", {
      noteName: $currentNoteName,
      projectId: $currentProjectId,
      username: $user,
    });
  }

  function handleNavigate() {
    adjustCounterDown();
    navigate("/noteOverview");
  }

  onDestroy(() => {
    handleUpdate();
  });
</script>

<div>
  <h2>{$currentNoteName}</h2>
  <p><strong>Last edited by: </strong> {lastEditedBy}</p>
  <button on:click={handleUpdate}>Save changes</button>
  <button class="navigate-button" on:click={handleNavigate}>Back</button>
  <button class="delete-btn" on:click={handleDeleteNote}>Delete</button>
  <div id="editorjs"></div>
</div>
