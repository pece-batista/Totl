import { AppRegistry } from "react-native";
import App from "./App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName || "Totl", () => App);
AppRegistry.registerComponent("totl", () => App);
AppRegistry.registerComponent("NomeTemp", () => App);
