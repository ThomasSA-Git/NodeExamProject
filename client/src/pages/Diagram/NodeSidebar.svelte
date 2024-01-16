<script>  
    import "../../assets/css/sidebar.css";
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
        <button class="button-sidebar" on:click={() => handleDelete(id)}>Delete</button>
      </div>
      <hr>
    {/each}
    {/if}
  </div>