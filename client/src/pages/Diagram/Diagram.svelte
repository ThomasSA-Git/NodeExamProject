<script>
  import { writable } from "svelte/store";
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    SvelteFlowProvider,
  } from "@xyflow/svelte";
  import { onDestroy, onMount } from "svelte";
  import "@xyflow/svelte/dist/style.css";
  import CustomNode from "./CustomNode.svelte";
  import { BASE_URL } from "../../store/global";
  import { showToast } from "../../assets/js/toast";
  import "../../assets/css/toast.css";

  let initialNodes = [];

  let initialEdges = [];

  const nodes = writable(initialNodes);

  const edges = writable(initialEdges);

  let savedNodes = [];
  let savedEdges = [];
  const unsubscribeNodes = nodes.subscribe((updatedNodes) => {
    const updatedPositions = updatedNodes.map((node) => {
      console.log(
        `Node ${node.id} position: x=${node.position.x}, y=${node.position.y}`
      );
      return node;
    });

    savedNodes = updatedPositions;
    console.log(savedNodes[0]);
    initialNodes = savedNodes;
  });

  const unsubscribeEdges = edges.subscribe((updatedEdges) => {
    savedEdges = updatedEdges;
    console.log(savedEdges[0]);
    initialEdges = savedEdges;
  });

  const nodeTypes = {
    custom: CustomNode,
  };

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/diagram", {
        credentials: "include",
      });
      const data = await response.json();
      if (response.ok) {
        console.log(data[0]);
        initialNodes = data.nodes;
        initialEdges = data.edges;
        // Update the Svelte store with the fetched data
        nodes.set(data.diagram.nodes);
        edges.set(data.diagram.edges);
      } else {
        showToast(data.message, "error");
      }
    } catch (error) {
      showToast(error, "error");
    }
  });

  async function handleSave() {
    try {
      const diagram = {
        nodes: initialNodes,
        edges: initialEdges
      };

      const response = await fetch($BASE_URL + "/diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(diagram),
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        showToast(result.message, "success");
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(error, "error");
    }
  }

  function handleLog() {
    console.log(savedNodes[2]);
    savedEdges.forEach((element) => {
      console.log(element);
    });
  }

  function handleAddNode() {
    const newNode = {
    id: (initialNodes && initialNodes.length > 0 ? 1 + initialNodes.length : 1).toString(),
    data: { label: "New node" },
    position: { x: 10, y: 0 },
    type: "custom",
  };
  nodes.update((currentNodes) => [...currentNodes, newNode]);
}


  onDestroy(() => {
    unsubscribeNodes();
    unsubscribeEdges();
  });
</script>

<div style:height="80vh">
  <SvelteFlowProvider>
    <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
      <Controls />
      <Background />
      <MiniMap />
    </SvelteFlow>
  </SvelteFlowProvider>
</div>

<button on:click={handleLog}>Log</button>
<button on:click={handleAddNode}>Add node</button>
<button on:click={handleSave}>Save diagram</button>
