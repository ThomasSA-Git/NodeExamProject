<script>
  import { writable } from 'svelte/store';
  import {
    SvelteFlow,
    Controls,
    Background,
    MiniMap,
    SvelteFlowProvider
  } from '@xyflow/svelte';

  import { onDestroy } from "svelte"

  import '@xyflow/svelte/dist/style.css'

  import CustomNode from './CustomNode.svelte';
  


  let intitialNodes = [
    {
      id: '1',
      data: { label: 'Hello' },
      position: { x: 0, y: 0 }
    },
    {
      id: '2',
      data: { label: 'World' },
      position: { x: 0, y: 150 }
    },
    {
      id: '3',
      data: { label: 'World' },
      position: { x: 250, y: 50 },
      type: 'custom'
    }
  ];

  const nodes = writable(intitialNodes);

  const edges = writable([
    {
      id: '1-2',
      source: '1',
      target: '2',
    },
    {
      id: '1-3',
      source: '1',
      target: '3',
    },
    {
      id: '2-3',
      source: '2',
      target: '3',
    }
  ]);

  let savedNodes = [];
  
  // Subscribe to changes in the nodes store
  const unsubscribe = nodes.subscribe(updatedNodes => {
    // Log the positions of the nodes
    const updatedPositions = updatedNodes.map(node => {
      console.log(`Node ${node.id} position: x=${node.position.x}, y=${node.position.y}`);
      return node;
    });

    // Update the savedNodes store with the latest positions
    savedNodes = updatedPositions;
    console.log(savedNodes[0]);
    intitialNodes = savedNodes;
  });

  const nodeTypes = {
    custom: CustomNode
  }

  function handleLog(){
    console.log(intitialNodes[3])
  }

  function handleAddNode(){
    const newNode = {
      id: (1 + intitialNodes.length).toString(),
      data: { label: "New node" },
      position: { x: 10, y: 0}
    };
    nodes.update(currentNodes => [...currentNodes, newNode]);
  }

  onDestroy(() => unsubscribe());
</script>

<div style:height="100vh">
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