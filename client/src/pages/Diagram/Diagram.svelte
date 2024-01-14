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
  import NodeSidebar from "./NodeSidebar.svelte";
  import EdgeSidebar from "./EdgeSidebar.svelte";
  import { showToast } from "../../assets/js/toast";
  import "../../assets/css/toast.css";
  import "../../assets/css/diagram.css";
  import { navigate } from "svelte-navigator";
  import { currentProjectId } from "../../store/project";
  import { user } from "../../store/stores";
  import { BASE_URL, IO_URL } from "../../store/global";
  import io from "socket.io-client";
  import { getSocket } from '../../util/socketService';

  let socket = null;

  onMount(async () => {
    try {
      const response = await fetch($BASE_URL + "/auth/authSocket", {
        credentials: "include",
      });
      const result = await response.json();
      if (response.ok) {
        socket = getSocket();
        loadDiagram();
      } else {
        showToast(result.message, "error");
      }
    } catch (error) {
      showToast(error.message, "error");
    }
  });

  let initialNodes = [];
  let initialEdges = [];

  const nodes = writable(initialNodes);

  const edges = writable(initialEdges);

  let savedNodes = [];
  let savedEdges = [];
  const unsubscribeNodes = nodes.subscribe((updatedNodes) => {
    const updatedPositions = updatedNodes.map((node) => {
      return node;
    });

    savedNodes = updatedPositions;
    initialNodes = savedNodes;
  });

  const unsubscribeEdges = edges.subscribe((updatedEdges) => {
    savedEdges = updatedEdges;
    initialEdges = savedEdges;
  });

  const nodeTypes = {
    custom: CustomNode,
  };

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
    updateDiagram();
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

    updateDiagram();
  }

  function handleDeleteEdge(edgeId) {
    // remove the node with the given ID from the list of nodes
    initialEdges = initialEdges.filter((edge) => edge.id !== edgeId);
    edges.set(initialEdges);

    updateDiagram();
  }

  function loadDiagram() {
    try {
      socket.emit("load-diagram", {
        projectId: $currentProjectId,
        username: $user,
      });

      socket.on("diagram-data", (data) => {
        if (data.diagram && data.diagram.nodes && data.diagram.edges) {
          initialNodes = data.diagram.nodes;
          initialEdges = data.diagram.edges;

          nodes.set(initialNodes);
          edges.set(initialEdges);
          if (data.message != "") {
            showToast(data.message, "success");
          }
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
    socket.on("save-success-diagram", (data) => {
      showToast(data.message, "success");
    });
  }

  function updateDiagram() {
    const diagram = {
      nodes: initialNodes,
      edges: initialEdges,
    };
    socket.emit("update-diagram", {
      diagram,
      projectId: $currentProjectId,
      username: $user,
    });
    socket.on("diagram-error", (data) => {
      showToast(data.message, "error");
    });
  }

  onDestroy(() => {
    saveDiagram();
    unsubscribeNodes();
    unsubscribeEdges();
  });
</script>

<div class="buttons">
  <button on:click={handleAddNode}>Add node</button>
  <button on:click={saveDiagram}>Save diagram</button>
  <button class="navigate-button" on:click={() => navigate("/project")}
    >Back to project</button
  >
  <hr />
</div>

<div class="flow">
  <div class="svelte-flow-container">
    <SvelteFlowProvider>
      <SvelteFlow {nodes} {edges} {nodeTypes} fitView>
        <Controls />
        <MiniMap />
      </SvelteFlow>
    </SvelteFlowProvider>
  </div>
  <NodeSidebar {initialNodes} {handleDeleteNode} />
  <EdgeSidebar {initialEdges} {handleDeleteEdge} />
</div>
