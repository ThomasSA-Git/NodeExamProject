<script>
  import { writable } from "svelte/store";
  import {
    SvelteFlow,
    Controls,
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
  import { BASE_URL } from "../../store/global";
  import { getSocket } from "../../util/socketService";

  let socket = null;

  let initialNodes = [];
  let initialEdges = [];

  const nodes = writable(initialNodes);
  const edges = writable(initialEdges);

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

  // subscribing to changes in both nodes and edges so that if, update or save is initiated
  // the initialNodes are updated with positions
  const unsubscribeNodes = nodes.subscribe((updatedNodes) => {
    initialNodes = updatedNodes;
  });

  const unsubscribeEdges = edges.subscribe((updatedEdges) => {
    initialEdges = updatedEdges;
  });

  const nodeTypes = {
    custom: CustomNode,
  };

  function handleAddNode() {
    let id = "1";
    let highestId;
    if (Array.isArray(initialNodes) && initialNodes.length != 0) {
      // check the highest id in the node array, gives the new node an id with +1 to that number and makes it a string again
      const numericIds = initialNodes.map((node) => parseInt(node.id, 10));
      highestId = Math.max(...numericIds);
      id = (highestId + 1).toString();
    }

    // makes a custom node to add to the array of nodes. Type is set as custom so that i can use my selfmade node
    const newNode = {
      id: id,
      data: { label: "New node", text: "" },
      position: { x: 10, y: 0 },
      type: "custom",
    };

    // updates the array of nodes
    nodes.update((currentNodes) => [...currentNodes, newNode]);

    // updates diagram and emit change to other clients in same room.
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

    // updates diagram and emit change to other clients in same room.
    updateDiagram();
  }

  function handleDeleteEdge(edgeId) {
    // remove the edge with the given ID from the list of nodes
    initialEdges = initialEdges.filter((edge) => edge.id !== edgeId);
    edges.set(initialEdges);

    updateDiagram();
  }

  onDestroy(() => {
    saveDiagram();
    unsubscribeNodes();
    unsubscribeEdges();
  });
</script>

<div class="buttons">
  <button class="button" on:click={handleAddNode}>Add node</button>
  <button on:click={saveDiagram}>Save diagram</button>
  <button class="navigate-button" on:click={() => navigate("/project")}
    >Dashboard</button
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
