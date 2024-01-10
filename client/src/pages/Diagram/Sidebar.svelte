<script>
    import { createEventDispatcher } from 'svelte';
  
    export let initialNodes;
    export let handleDeleteNode;
  
    function handleDelete(nodeId) {
      handleDeleteNode(nodeId);
    }
  </script>
  
  <aside>
    {#each initialNodes as { id, data }}
      <div class="node-item">
        <p>ID: {id}</p>
        <p>Label: {data.label}</p>
        <button on:click={() => handleDelete(id)}>Delete</button>
      </div>
      <hr>
    {/each}
  </aside>
  
  <style>
    aside {
      width: 10vw;
      background: #f4f4f4;
      padding: 0.4rem 0.8rem;
      font-size: 12px;
    }
  
    .node-item {
      margin-bottom: 15px;
    }
  
    button {
      background-color: #d9534f;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }
  </style>