<script>
  import { Router, Link, Route } from "svelte-navigator";
  import Home from "./pages/Home/Home.svelte";
  import Login from "./pages/Login/Login.svelte";
  import Signup from "./pages/Signup/Signup.svelte";
  import User from "./pages/UserPage/UserPage.svelte";
  import PrivateRoute from "./components/RouteProtection/PrivateRoute.svelte";
  import ResetPassword from "./pages/ResetPassword/ResetPassword.svelte";
  import Kanban from "./pages/Kanban/Kanban.svelte";
  import Project from "./pages/Project/Project.svelte";
  import NoteSystem from "./pages/NoteSystem/NoteSystem.svelte";
  import { user, role } from "./store/stores.js";
  import { currentProjectId } from "./store/project";
  import { url } from "./util/apiUrl";
  import Diagram from "./pages/Diagram/Diagram.svelte";
  import NoteOverview from "./pages/NoteOverview/NoteOverview.svelte";

  import { onMount } from "svelte";

  onMount(() => {
    // Check for user in localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      user.set(userData.username);
      role.set(userData.role);
    }
  });

  async function handleLogout() {
    await fetch(url + "auth/logout", {
      credentials: "include",
    });
    $user = null;
    localStorage.clear();
  }
</script>

<Router>
  <nav>
    <Link to="/">Home</Link>

    {#if $user == null}
      <Link to="/login">Login</Link><br />
      <Link to="/signup">Signup</Link><br />
    {/if}

    <Link to="/userpage">User start</Link>

    {#if $user != null}
      <h3>Welcome {$user}</h3>
      <button on:click={handleLogout} class="logout-button">Logout</button>
    {/if}
  </nav>
  <div>
    <Route path="/"><Home /></Route>
    <Route path="/login"><Login /></Route>
    <Route path="/signup"><Signup /></Route>
    <Route path="/resetpassword"><ResetPassword /></Route>
    <Route path="/diagram"><Diagram /></Route>
    <Route path="/notes"><NoteSystem /></Route>

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

<style>
  /* Define your red color */
  .logout-button {
    color: white;
    background-color: red;
    border: none;
    padding: 5px;
    cursor: pointer;
    border-radius: 5px;
  }
</style>
