<script>
   import { Node, Svelvet, Minimap, Controls } from 'svelvet';
   import MyNode from './MyNode.svelte';

</script>

<!-- <Svelvet nodes={initialNodes} edges={initialEdges} background /> -->
<Svelvet id="my-canvas" width="{1275}" height="{600}" TD minimap controls locked>
  <MyNode />
  <Node id="alpha" bgColor="red" label="My Node"/>
</Svelvet>
