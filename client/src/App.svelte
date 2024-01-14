<script>
  import { Router, Link, Route, navigate } from "svelte-navigator";
  import Home from "./pages/Home/Home.svelte";
  import Login from "./pages/Login/Login.svelte";
  import Signup from "./pages/Signup/Signup.svelte";
  import User from "./pages/UserPage/UserPage.svelte";
  import PrivateRoute from "./components/RouteProtection/PrivateRoute.svelte";
  import ResetPassword from "./pages/ResetPassword/ResetPassword.svelte";
  import Kanban from "./pages/Kanban/Kanban.svelte";
  import Project from "./pages/Project/Project.svelte";
  import NoteSystem from "./pages/NoteSystem/NoteSystem.svelte";
  import { user } from "./store/stores.js";
  import { currentProjectId, currentProjectName } from "./store/project.js";
  import { BASE_URL } from "./store/global.js";
  import Diagram from "./pages/Diagram/Diagram.svelte";
  import NoteOverview from "./pages/NoteOverview/NoteOverview.svelte";
  import { disconnectSocket } from "./util/socketService.js";

  import { onMount } from "svelte";
  import { showToast } from "./assets/js/toast";

  onMount(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      user.set(userData.username);
    }
  });

  async function handleLogout() {
    try {
      disconnectSocket();
      const response = await fetch($BASE_URL + "/auth/logout", {
        credentials: "include",
      });
      
      if(response.ok){
      $user = null;
      $currentProjectId = null;
      $currentProjectName = null;
      localStorage.clear();
      navigate("/");
    }
    else {
      showToast("Not logged out", "error");
    }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
</script>

<Router>
  <nav>
    <Link to="/">Home</Link>
    {#if $user != null}
      <Link to="/userpage">User start</Link>
    {/if}

    {#if $user == null}
      <Link to="/login">Login</Link><br />
      <Link to="/signup">Signup</Link><br />
    {/if}

    {#if $user != null}
      <button on:click={handleLogout} class="delete-btn">Logout</button>
    {/if}
  </nav>
  <div>
    <Route path="/"><Home /></Route>
    <Route path="/login"><Login /></Route>
    <Route path="/signup"><Signup /></Route>
    <Route path="/resetpassword"><ResetPassword /></Route>

    <PrivateRoute path="/project" let:location><Project /></PrivateRoute>
    <PrivateRoute path="/kanban" let:location><Kanban /></PrivateRoute>
    <PrivateRoute path="/noteOverview" let:location
      ><NoteOverview /></PrivateRoute
    >
    <PrivateRoute path="/diagram" let:location>
      <Diagram />
    </PrivateRoute>
    <PrivateRoute path="/notes" let:location>
      <NoteSystem />
    </PrivateRoute>
    <PrivateRoute path="/userpage" let:location>
      <User />
    </PrivateRoute>
  </div>
</Router>
