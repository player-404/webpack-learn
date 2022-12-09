import "./index.css";
import _ from "lodash";

const str = _.toUpper("hello world");

const div = document.querySelector(".box");
div.innerHTML = str;
