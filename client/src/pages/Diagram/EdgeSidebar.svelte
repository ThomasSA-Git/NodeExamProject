<script>
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
          <button on:click={() => handleDelete(edge.id)}>Delete</button>
        </div>
        <hr />
      {/each}
    </div>
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
  
    .edge-item {
      margin-bottom: 15px;
    }

    .edge-container {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
    button {
      background-color: #d9534f;
      color: white;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
    }
  </style>