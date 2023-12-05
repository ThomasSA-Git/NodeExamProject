import { readable } from "svelte/store";

export const BASE_URL = readable("http://localhost:8080/api");

export const IO_URL = readable("localhost:8080");