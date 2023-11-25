  
<script>
import { ref, onMounted } from "@vue/runtime-core";
import { initializeGame } from "./game/app.ts";

export default {
  name: "BabylonScene",
  setup() {
    const bjsCanvas = ref(null);

    onMounted(() => {
        initializeGame();
    });

    return {
      bjsCanvas,
    };
  },
};
</script>
  