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
  import Sidebar from "./Sidebar.svelte";
  import EdgeSidebar from "./EdgeSidebar.svelte";
  import { showToast } from "../../assets/js/toast";
  import "../../assets/css/toast.css";
  import { navigate } from "svelte-navigator";
  import { currentProjectId } from "../../store/project";
  import { user } from "../../store/stores";
  import { IO_URL } from "../../store/global";
  import io from "socket.io-client";

  const socket = io($IO_URL, {
    query: {
      projectId: $currentProjectId,
      username: $user,
    },
  });

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

  onMount(loadDiagram);

  function handleAddNode() {
    let id = "1";
    let highestId;
    if (Array.isArray(initialNodes) && initialNodes.length != 0) {
      const numericIds = initialNodes.map((node) => parseInt(node.id, 10));
      highestId = Math.max(...numericIds);
      id = (highestId + 1).toString();
    }

    const newNode = {
      id: id,
      data: { label: "New node", text: "" },
      position: { x: 10, y: 0 },
      type: "custom",
    };

    nodes.update((currentNodes) => [...currentNodes, newNode]);
    saveDiagram();
  }

  function handleDeleteNode(nodeId) {
    // remove the node with the given ID from the list of nodes
    initialNodes = initialNodes.filter((node) => node.id !== nodeId);
    nodes.set(initialNodes);
    // remove any edges associated with the deleted node
    initialEdges = initialEdges.filter(
      (edge) => edge.source !== nodeId && edge.target !== nodeId
    );
    edges.set(initialEdges);

    saveDiagram();
  }

  function handleDeleteEdge(edgeId) {
    // remove the node with the given ID from the list of nodes
    initialEdges = initialEdges.filter((edge) => edge.id !== edgeId);
    nodes.set(initialNodes);

    saveDiagram();
  }

  function loadDiagram() {
    try {
      socket.emit("load-diagram", {
        projectId: $currentProjectId,
        username: $user,
      });

      socket.on("diagram-data", (data) => {
        console.log(data.nodes);
        if (data && data.nodes && data.edges) {
          initialNodes = data.nodes;
          initialEdges = data.edges;

          nodes.set(initialNodes);
          edges.set(initialEdges);
        }
      });
    } catch (error) {
      showToast(error, "error");
    }
  }

  function saveDiagram() {
    const diagram = {
      nodes: initialNodes,
      edges: initialEdges,
    };
    socket.emit("save-diagram", {
      diagram,
      projectId: $currentProjectId,
      username: $user,
    });
    socket.on("diagram-save-success", (data) => {
      showToast(data.message, "success");
    });
    socket.on("diagram-save-failure", (data) => {
      showToast(data.message, "error");
    });
  }

  onDestroy(() => {
    saveDiagram();
    unsubscribeNodes();
    unsubscribeEdges();
    socket.emit("leave-room", { projectId: $currentProjectId });
  });
</script>

<div class="buttons">
  <button on:click={handleAddNode}>Add node</button>
  <button on:click={saveDiagram}>Save diagram</button>
  <button class="navigate-button" on:click={() => navigate("/project")}
    >Back to project</button
  >
  <hr>
</div>
<div class="container">
 
  <div class="flow">
    <div class="svelte-flow-container">
      <SvelteFlowProvider>
        <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
          <Controls />
          <Background />
          <MiniMap />
        </SvelteFlow>
      </SvelteFlowProvider>
    </div>
    <Sidebar {initialNodes} {handleDeleteNode} />
    <EdgeSidebar {initialEdges} {handleDeleteEdge}/>

  </div>


</div>

<style>
  .container {
    margin-top: 3rm;
    display: flex;
    flex-direction: column;
    height: 75vh;
  }

  .flow {
    flex: 1;
    display: flex;
  }

  .svelte-flow-container {
    height: 75vh;
    width: 88%; /* Adjust this as needed */
  }

  .buttons {
    margin-bottom: 1rem;
  }
</style>
