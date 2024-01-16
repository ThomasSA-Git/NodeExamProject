<script>
  import "../../assets/css/sidebar.css";
  export let initialEdges;
  export let handleDeleteEdge;

  function handleDelete(edgeId) {
    handleDeleteEdge(edgeId);
  }
</script>

<div class="sidebar">
  <h3>Edges</h3>
  <hr />
  {#if Array.isArray(initialEdges) && initialEdges.length != 0}
    <div class="edge-container">
      {#each initialEdges as edge}
        <div class="edge-item">
          <p>ID: {edge.id}</p>
          <p>Source: {edge.source}</p>
          <p>Target: {edge.target}</p>
          <button class="button-sidebar" on:click={() => handleDelete(edge.id)}>Delete</button>
        </div>
        <hr />
      {/each}
    </div>
  {/if}
</div>