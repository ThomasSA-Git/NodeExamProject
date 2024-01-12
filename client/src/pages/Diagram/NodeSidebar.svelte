<script>  
    export let initialNodes;
    export let handleDeleteNode;
  
    function handleDelete(nodeId) {
      handleDeleteNode(nodeId);
    }
  </script>
  

  <div class="sidebar">
    <h3>Nodes</h3>
    <hr>
    {#if Array.isArray(initialNodes) && initialNodes.length != 0}
    {#each initialNodes as { id, data }}
      <div class="node-item">
        <p>ID: {id}</p>
        <p>Label: {data.label}</p>
        <button on:click={() => handleDelete(id)}>Delete</button>
      </div>
      <hr>
    {/each}
    {/if}
  </div>
  
  <style>
     .sidebar {
      width: 10vw;
      background: #f4f4f4;
      padding: 0.4rem 0.8rem;
      font-size: 12px;
      max-height: 70vh;
      overflow-y: scroll;
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