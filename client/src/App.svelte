<script>
  import { Router, Link, Route } from "svelte-navigator";
  import Home from "./pages/Home/Home.svelte";
  import Login from "./pages/Login/Login.svelte";
  import Signup from "./pages/Signup/Signup.svelte";
  import Contact from "./pages/Contact/Contact.svelte";
  import Member from "./pages/MemberPage/MemberPage.svelte";
  import Admin from "./pages/Admin/Admin.svelte";
  import PrivateRoute from "./components/RouteProtection/PrivateRoute.svelte";
  import ResetPassword from "./pages/ResetPassword/ResetPassword.svelte";
  import Kanban from "./pages/Kanban/Kanban.svelte";
  import { user, role } from "./store/stores.js";
  import { url } from "./util/apiUrl";
  import Diagram from "./pages/Diagram/Diagram.svelte";

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

    <Link to="/contact">Contact</Link>

    <Link to="/memberpage">Member</Link>

    <Link to="/kanban">Kanban</Link>

    <Link to="/diagram">Diagram</Link>

    {#if $user != null && $role == "admin"}
      <Link to="/adminpage">Admin</Link>
    {/if}

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
    <Route path="/contact"><Contact /></Route>
    <Route path="/kanban"><Kanban /></Route>
    <Route path="/diagram"><Diagram /></Route>
    <PrivateRoute path="/memberpage" let:location>
      <Member />
    </PrivateRoute>
    <PrivateRoute path="/adminpage" let:location>
      <Admin />
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
