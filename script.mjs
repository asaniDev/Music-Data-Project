import { countUsers } from "./common.mjs";

window.onload = function () {
  document.querySelector("body").innerText = `There are ${countUsers()} users`;
};
